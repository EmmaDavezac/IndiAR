import unittest
from datetime import date
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Integer,
    JSON,
    MetaData,
    Numeric,
    String,
    Table,
    Text,
    create_engine,
    select,
)

from migration_data.importar_steam import import_entries, load_tables, normalize_entry
from migration_data.enriquecer_steam import parse, parse_release_date


def create_test_schema(connection):
    metadata = MetaData()
    Table("Juegos", metadata,
          Column("ID", Integer, primary_key=True),
          Column("titulo", String(255), nullable=False),
          Column("distribuidor", String(255), nullable=False),
          Column("desarrollador", String(255), nullable=False),
          Column("lanzamiento", Date, nullable=False),
          Column("descripcion", Text, nullable=False),
          Column("requisitosID", Integer, nullable=False),
          Column("precio", Numeric(10, 2), nullable=False),
          Column("oferta_tipo", String(20)),
          Column("oferta_valor", Numeric(10, 2)),
          Column("img_principal", String(500), nullable=False),
          Column("activo", Boolean, nullable=False),
          Column("plataformas", JSON, nullable=False),
          Column("idiomas", JSON, nullable=False),
          Column("steam_appid", String(20), unique=True),
          Column("steam_url", String(500)),
          Column("steam_metadata", JSON),
          Column("fecha_subida", DateTime, nullable=False))
    Table("Requisitos", metadata,
          Column("ID", Integer, primary_key=True),
          Column("procesador_min", String(255)))
    Table("Categorias", metadata,
          Column("ID", Integer, primary_key=True),
          Column("Nombre", String(100), unique=True, nullable=False))
    Table("Juego_Categorias", metadata,
          Column("juego_id", Integer, primary_key=True),
          Column("categoria_id", Integer, primary_key=True))
    metadata.create_all(connection)


class SteamMigrationTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        with self.engine.begin() as connection:
            create_test_schema(connection)
            self.tables = load_tables(connection)

    def tearDown(self):
        self.engine.dispose()

    @staticmethod
    def entry(**overrides):
        game = {
            "steam_appid": "12345",
            "nombre": "Juego de prueba",
            "publisher": "Estudio de prueba",
            "desarrollador": "Estudio de prueba",
            "descripcion_corta": "Descripción <b>corta</b>.",
            "img_principal": "https://example.test/header.jpg",
            "precio_usd": "4.99",
            "generos": "Acción; Aventura",
            "idiomas": "Español; Inglés",
            "windows": True,
            "mac": False,
            "linux": True,
            "en_steam": True,
            "revisar": "",
        }
        return {**game, **overrides}

    def test_normalizes_missing_date_and_zero_price(self):
        result = normalize_entry(self.entry(fecha_lanzamiento="", precio_usd="0"), today=date(2025, 1, 2))
        self.assertEqual(result["lanzamiento"], date(2025, 1, 2))
        self.assertEqual(result["precio"], 0)
        self.assertFalse(result["activo"])
        self.assertEqual(result["plataformas"], ["Windows", "Linux"])
        self.assertEqual(result["descripcion"], "Descripción corta.")

    def test_enrichment_normalizes_usd_price_image_and_release_date(self):
        enriched = parse("12345", {
            "name": "Juego de prueba",
            "developers": ["Estudio"],
            "publishers": ["Distribuidor"],
            "release_date": {"date": "Jun 10, 2024"},
            "price_overview": {"final": 1299, "initial": 1999, "discount_percent": 35},
            "header_image": "https://example.test/steam.jpg",
            "platforms": {"windows": True, "linux": True},
            "categories": [{"id": 2}],
            "genres": [{"description": "Aventura"}],
        })
        self.assertEqual(enriched["precio_usd"], "12.99")
        self.assertEqual(enriched["precio_usd_inicial"], "19.99")
        self.assertEqual(enriched["img_principal"], "https://example.test/steam.jpg")
        self.assertEqual(enriched["fecha_lanzamiento"], "2024-06-10")
        self.assertFalse(enriched["fecha_provisional"])
        self.assertEqual(parse_release_date("10 jun 2024"), "2024-06-10")

    def test_import_is_idempotent_and_preserves_admin_fields_on_update(self):
        with self.engine.begin() as connection:
            first = import_entries(connection, self.tables, [self.entry()], True, False, False)
        self.assertEqual(first["created"], 1)

        with self.engine.begin() as connection:
            unchanged = import_entries(connection, self.tables, [self.entry()], True, False, False)
        self.assertEqual(unchanged["skipped"], 1)

        games = self.tables["Juegos"]
        with self.engine.begin() as connection:
            connection.execute(games.update().values(activo=True, precio=19.99, oferta_tipo="precio"))
            refreshed = import_entries(
                connection,
                self.tables,
                [self.entry(nombre="Nombre actualizado", precio_usd="99.00", generos="RPG")],
                True,
                True,
                False,
            )
            stored = connection.execute(select(games)).mappings().one()
            categories = connection.execute(select(self.tables["Categorias"].c.Nombre)).scalars().all()

        self.assertEqual(refreshed["updated"], 1)
        self.assertEqual(stored["titulo"], "Nombre actualizado")
        self.assertEqual(stored["precio"], Decimal("19.99"))
        self.assertTrue(stored["activo"])
        self.assertEqual(stored["oferta_tipo"], "precio")
        self.assertEqual(categories, ["Acción", "Aventura"])

    def test_review_rows_are_skipped_unless_explicitly_included(self):
        row = self.entry(revisar="estudio no coincide")
        with self.engine.begin() as connection:
            skipped = import_entries(connection, self.tables, [row], False, False, False)
            included = import_entries(connection, self.tables, [row], False, False, True)
        self.assertEqual(skipped["skipped"], 1)
        self.assertEqual(included["created"], 1)


if __name__ == "__main__":
    unittest.main()
