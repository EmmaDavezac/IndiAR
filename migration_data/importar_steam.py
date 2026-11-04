#!/usr/bin/env python3
"""Importa el JSON enriquecido de Steam; por defecto solo muestra una previsualización.

Desde la raíz del proyecto:
  python migration_data/importar_steam.py
  python migration_data/importar_steam.py --apply
  python migration_data/importar_steam.py --apply --update-existing
"""
import argparse
import html
import json
import os
import re
import sys
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path

from sqlalchemy import MetaData, Table, URL, create_engine, func, insert, select, update
from sqlalchemy.exc import SQLAlchemyError


DATA_DIR = Path(__file__).resolve().parent
DEFAULT_FILE = DATA_DIR / "juegos_argentinos.json"
PLATFORMS = (("windows", "Windows"), ("linux", "Linux"), ("mac", "macOS"))


def build_database_url():
    if os.getenv("DATABASE_URL"):
        return os.environ["DATABASE_URL"]
    return URL.create(
        "mysql+mysqlconnector",
        username=os.getenv("MYSQL_USER", "user"),
        password=os.getenv("MYSQL_PASSWORD", "password"),
        host=os.getenv("MYSQL_HOST", "db"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        database=os.getenv("MYSQL_DB", "indiar"),
    )


def split_values(value):
    if isinstance(value, list):
        values = value
    elif isinstance(value, str):
        values = value.split(";")
    else:
        values = []
    return list(dict.fromkeys(item.strip() for item in values if isinstance(item, str) and item.strip()))


def clean_description(value):
    text = html.unescape(str(value or ""))
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"</p\s*>", "\n\n", text, flags=re.IGNORECASE)
    return re.sub(r"<[^>]+>", "", text).strip()


def normalize_entry(entry, today=None):
    appid = str(entry.get("steam_appid") or "").strip()
    if not appid.isdigit() or len(appid) > 20:
        raise ValueError("Steam App ID ausente o inválido")

    title = str(entry.get("nombre") or "").strip()
    if not title or len(title) > 255:
        raise ValueError("nombre ausente o supera los 255 caracteres")

    release = str(entry.get("fecha_lanzamiento") or "").strip()
    try:
        release_date = date.fromisoformat(release)
    except ValueError:
        release_date = today or date.today()

    try:
        price = Decimal(str(entry.get("precio_usd") or "0"))
    except InvalidOperation as error:
        raise ValueError("precio_usd no es un número válido") from error
    if not price.is_finite() or price < 0 or price > Decimal("99999999.99"):
        raise ValueError("precio_usd está fuera del rango permitido")
    price = price.quantize(Decimal("0.01"))

    developers = str(entry.get("desarrollador") or "").strip() or "Desarrollador no informado"
    publisher = str(entry.get("publisher") or "").strip() or developers
    if len(developers) > 255 or len(publisher) > 255:
        raise ValueError("desarrollador o publisher supera los 255 caracteres")

    image = str(entry.get("img_principal") or "").strip()
    image = image or f"https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header.jpg"
    if len(image) > 500:
        raise ValueError("img_principal supera los 500 caracteres")

    description = clean_description(entry.get("descripcion_corta"))
    if not description:
        description = "Descripción pendiente de revisión en Steam."

    categories = split_values(entry.get("generos"))
    if any(len(category) > 100 for category in categories):
        raise ValueError("un género supera los 100 caracteres")

    platforms = [label for key, label in PLATFORMS if entry.get(key)]
    return {
        "steam_appid": appid,
        "steam_url": str(entry.get("url_steam") or f"https://store.steampowered.com/app/{appid}")[:500],
        "steam_metadata": entry,
        "titulo": title,
        "distribuidor": publisher,
        "desarrollador": developers,
        "lanzamiento": release_date,
        "descripcion": description,
        "precio": price,
        "img_principal": image,
        "activo": False,
        "plataformas": platforms,
        "idiomas": split_values(entry.get("idiomas")),
        "categorias": categories,
        "fecha_subida": datetime.now(timezone.utc).replace(tzinfo=None),
    }


def load_tables(connection):
    metadata = MetaData()
    required = ("Juegos", "Requisitos", "Categorias", "Juego_Categorias")
    metadata.reflect(bind=connection, only=required)
    missing = [name for name in required if name not in metadata.tables]
    if missing:
        raise RuntimeError("Faltan tablas requeridas: " + ", ".join(missing))
    tables = {name: metadata.tables[name] for name in required}
    juego_columns = set(tables["Juegos"].c.keys())
    required_columns = {
        "ID", "titulo", "distribuidor", "desarrollador", "lanzamiento", "descripcion",
        "requisitosID", "precio", "img_principal", "activo", "plataformas", "idiomas",
        "fecha_subida", "steam_appid", "steam_url", "steam_metadata",
    }
    missing_columns = required_columns - juego_columns
    if missing_columns:
        raise RuntimeError(
            "La tabla Juegos no tiene las columnas necesarias. Reiniciá la API para aplicar "
            "la migración de esquema: " + ", ".join(sorted(missing_columns))
        )
    return tables


def get_or_create_category(connection, table, name, apply):
    category_id = connection.execute(
        select(table.c.ID).where(func.lower(table.c.Nombre) == name.lower())
    ).scalar_one_or_none()
    if category_id is not None or not apply:
        return category_id
    return connection.execute(insert(table).values(Nombre=name)).inserted_primary_key[0]


def add_requirements(connection, table):
    primary_keys = {column.name for column in table.primary_key.columns}
    values = {
        column.name: "Por definir"
        for column in table.columns
        if column.name not in primary_keys
    }
    return connection.execute(insert(table).values(**values)).inserted_primary_key[0]


def title_collision(connection, juegos, title):
    return connection.execute(
        select(juegos.c.ID).where(func.lower(juegos.c.titulo) == title.lower())
    ).scalar_one_or_none()


def import_entries(connection, tables, entries, apply, update_existing, include_review):
    juegos = tables["Juegos"]
    requisitos = tables["Requisitos"]
    categorias = tables["Categorias"]
    relaciones = tables["Juego_Categorias"]
    stats = {"created": 0, "updated": 0, "skipped": 0, "invalid": 0}

    for index, entry in enumerate(entries, start=1):
        if not isinstance(entry, dict):
            stats["invalid"] += 1
            print(f"[{index}] OMITIDO: la entrada no es un objeto JSON")
            continue
        if not entry.get("en_steam", True):
            stats["skipped"] += 1
            print(f"[{index}] OMITIDO: no se encontró en Steam ({entry.get('nombre', 'sin nombre')})")
            continue
        if entry.get("revisar") and not include_review:
            stats["skipped"] += 1
            print(f"[{index}] OMITIDO para revisión: {entry.get('nombre', 'sin nombre')}: {entry['revisar']}")
            continue
        try:
            game = normalize_entry(entry)
        except (TypeError, ValueError) as error:
            stats["invalid"] += 1
            print(f"[{index}] INVÁLIDO ({entry.get('nombre', 'sin nombre')}): {error}")
            continue

        existing = connection.execute(
            select(juegos.c.ID, juegos.c.titulo).where(juegos.c.steam_appid == game["steam_appid"])
        ).first()
        if existing:
            if not update_existing:
                stats["skipped"] += 1
                print(f"[{index}] YA EXISTE: {game['titulo']} (App ID {game['steam_appid']})")
                continue
            if apply:
                managed_fields = (
                    "steam_url", "steam_metadata", "titulo", "distribuidor", "desarrollador",
                    "lanzamiento", "descripcion", "img_principal", "plataformas", "idiomas",
                )
                connection.execute(
                    update(juegos)
                    .where(juegos.c.ID == existing.ID)
                    .values(**{field: game[field] for field in managed_fields})
                )
            stats["updated"] += 1
            print(f"[{index}] ACTUALIZARÍA: {game['titulo']} (App ID {game['steam_appid']})")
            continue

        duplicate_id = title_collision(connection, juegos, game["titulo"])
        if duplicate_id is not None:
            stats["skipped"] += 1
            print(f"[{index}] OMITIDO: ya hay un juego con el título {game['titulo']!r} (ID {duplicate_id})")
            continue

        if apply:
            game["requisitosID"] = add_requirements(connection, requisitos)
            game_categories = game.pop("categorias")
            game_id = connection.execute(
                insert(juegos).values(**game)
            ).inserted_primary_key[0]
            for category_name in game_categories:
                category_id = get_or_create_category(connection, categorias, category_name, apply=True)
                connection.execute(insert(relaciones).values(
                    juego_id=game_id,
                    categoria_id=category_id,
                ))
        stats["created"] += 1
        print(f"[{index}] {'IMPORTARÍA' if not apply else 'IMPORTADO'}: {game['titulo']}")
    return stats


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", type=Path, default=DEFAULT_FILE, help="JSON generado por enriquecer_steam.py")
    parser.add_argument("--apply", action="store_true", help="Escribe los cambios (sin esta opción solo previsualiza)")
    parser.add_argument(
        "--update-existing",
        action="store_true",
        help="Actualiza metadatos Steam existentes; nunca cambia estado, precio, ofertas ni categorías",
    )
    parser.add_argument(
        "--include-review",
        action="store_true",
        help="Incluye filas marcadas con revisar en el JSON",
    )
    args = parser.parse_args(argv)

    try:
        with args.file.open(encoding="utf-8") as source:
            entries = json.load(source)
    except (OSError, json.JSONDecodeError) as error:
        parser.error(f"no se pudo leer {args.file}: {error}")
    if not isinstance(entries, list):
        parser.error("el JSON debe contener una lista de juegos")

    engine = create_engine(build_database_url(), pool_pre_ping=True)
    try:
        with engine.begin() as connection:
            tables = load_tables(connection)
            stats = import_entries(
                connection,
                tables,
                entries,
                apply=args.apply,
                update_existing=args.update_existing,
                include_review=args.include_review,
            )
    except (SQLAlchemyError, RuntimeError) as error:
        print(f"Error de importación; no se aplicaron cambios: {error}", file=sys.stderr)
        return 1
    finally:
        engine.dispose()

    action = "aplicada" if args.apply else "previsualización"
    print(
        f"\nResumen ({action}): {stats['created']} nuevos, {stats['updated']} actualizables, "
        f"{stats['skipped']} omitidos, {stats['invalid']} inválidos."
    )
    if not args.apply:
        print("Para escribir los juegos nuevos, volvé a ejecutar con --apply.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
