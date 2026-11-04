#!/usr/bin/env python3
"""Enriquece juegos_argentinos_seed.csv con datos de la Steam Store API.
Uso: python enriquecer_steam.py   (genera juegos_argentinos.csv y .json)
Si steam_appid está vacío, lo busca por nombre (solo coincidencia exacta).
La columna "revisar" marca filas a verificar a mano (appid sin resolver / estudio distinto).
Obtiene imágenes y precios regionales en USD; no requiere API key."""
import csv
import html
import json
import re
import time
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path

import requests

DATA_DIR = Path(__file__).resolve().parent
API = "https://store.steampowered.com/api/appdetails"
LANGUAGE = "spanish"
CURRENCY_COUNTRY = "us"

# IDs de categorías de Steam
CAT = {"single": {2}, "multi_local": {24, 37}, "multi_online": {36, 49, 20, 27},
       "coop_local": {39}, "coop_online": {38}}

def parse_langs(raw):
    """supported_languages viene como HTML: 'Español<strong>*</strong>, English<br><strong>*</strong>idiomas con audio'"""
    if not raw:
        return []
    raw = raw.split("<br>")[0]
    txt = html.unescape(re.sub(r"<[^>]+>", "", raw))
    return [l.strip().rstrip("*").strip() for l in txt.split(",") if l.strip()]


def parse_release_date(raw):
    if not raw:
        return None
    value = str(raw).strip()
    for pattern in ("%b %d, %Y", "%B %d, %Y", "%d %b, %Y", "%d %B, %Y"):
        try:
            return datetime.strptime(value, pattern).date().isoformat()
        except ValueError:
            pass

    spanish_months = {
        "ene": "Jan", "enero": "January", "feb": "Feb", "febrero": "February",
        "mar": "Mar", "marzo": "March", "abr": "Apr", "abril": "April",
        "may": "May", "mayo": "May", "jun": "Jun", "junio": "June",
        "jul": "Jul", "julio": "July", "ago": "Aug", "agosto": "August",
        "sep": "Sep", "sept": "Sep", "septiembre": "September",
        "oct": "Oct", "octubre": "October", "nov": "Nov", "noviembre": "November",
        "dic": "Dec", "diciembre": "December",
    }
    translated = value.lower()
    for spanish, english in spanish_months.items():
        translated = re.sub(r"\b" + spanish + r"\b", english, translated)
    for pattern in ("%b %d, %Y", "%B %d, %Y", "%d %b %Y", "%d %B %Y", "%d %b, %Y", "%d %B, %Y"):
        try:
            return datetime.strptime(translated.title(), pattern).date().isoformat()
        except ValueError:
            pass
    return None


def parse(appid, d):
    cats = {
        category["id"]
        for category in (d.get("categories") or [])
        if isinstance(category, dict) and "id" in category
    }
    p = d.get("platforms") or {}
    release = d.get("release_date") or {}
    release_date = parse_release_date(release.get("date", ""))
    price = d.get("price_overview") or {}
    price_usd = Decimal(str(price.get("final") or 0)) / 100
    developers = d.get("developers") or []
    publishers = d.get("publishers") or []
    genres = d.get("genres") or []
    return {
        "steam_appid": appid,
        "nombre": d.get("name", ""),
        "desarrollador": "; ".join(developers),
        "publisher": "; ".join(publishers),
        "fecha_lanzamiento": release_date or date.today().isoformat(),
        "fecha_provisional": release_date is None,
        "proximamente": release.get("coming_soon", False),
        "generos": "; ".join(g["description"] for g in genres if isinstance(g, dict) and g.get("description")),
        "windows": p.get("windows", False), "mac": p.get("mac", False), "linux": p.get("linux", False),
        **{k: bool(cats & ids) for k, ids in CAT.items()},
        "idiomas": "; ".join(parse_langs(d.get("supported_languages"))),
        "descripcion_corta": d.get("short_description", ""),
        "img_principal": d.get("header_image") or d.get("capsule_image", ""),
        "precio_usd": format(price_usd, ".2f"),
        "precio_gratis": bool(d.get("is_free", False)),
        "precio_descuento_pct": price.get("discount_percent", 0),
        "precio_usd_inicial": format(Decimal(str(price.get("initial") or 0)) / 100, ".2f"),
        "en_steam": True,
        "url_steam": f"https://store.steampowered.com/app/{appid}",
    }

SEARCH = "https://store.steampowered.com/api/storesearch/"

def norm(t):
    return re.sub(r"[^a-z0-9]", "", t.lower())

def resolve_appid(nombre):
    """Busca el appid por nombre. Solo acepta coincidencia exacta (ignorando mayúsculas y símbolos)."""
    r = requests.get(SEARCH, params={"term": nombre, "l": LANGUAGE, "cc": "ar"}, timeout=20)
    r.raise_for_status()
    results = r.json()
    if not isinstance(results, dict):
        raise ValueError("Respuesta inesperada al buscar el App ID")
    for it in results.get("items", []):
        if not isinstance(it, dict) or not it.get("id"):
            continue
        if norm(it.get("name", "")) == norm(nombre):
            return str(it["id"])
    return None

def fetch(appid):
    r = requests.get(API, params={"appids": appid, "l": LANGUAGE, "cc": CURRENCY_COUNTRY}, timeout=20)
    r.raise_for_status()
    results = r.json()
    if not isinstance(results, dict):
        raise ValueError("Respuesta inesperada de Steam AppDetails")
    entry = results.get(str(appid), {})
    if not isinstance(entry, dict) or not entry.get("success"):
        return None
    data = entry.get("data")
    if not isinstance(data, dict):
        return None
    return parse(appid, data)

def main():
    rows, fails = [], []
    with open(DATA_DIR / "juegos_argentinos_seed.csv", encoding="utf-8") as f:
        for s in csv.DictReader(f):
            appid = s["steam_appid"].strip()
            try:
                if not appid:                  # resolver por nombre
                    appid = resolve_appid(s["nombre"]); time.sleep(1.0)
                    if not appid:
                        rows.append({"nombre": s["nombre"], "en_steam": False, "revisar": "appid no resuelto"})
                        fails.append(s["nombre"]); print("SIN ID", s["nombre"]); continue
                row = fetch(appid)
            except (requests.RequestException, ValueError, KeyError) as ex:
                row = None
                print("ERROR", s["nombre"], ex)
            if row:
                row["estudio_fuente"] = s.get("estudio_fuente", "")
                # alerta si el estudio de la fuente no coincide con el desarrollador de Steam
                ef = norm(row["estudio_fuente"])
                row["revisar"] = "" if (not ef or ef in norm(row["desarrollador"])) else "estudio no coincide"
                rows.append(row); print("OK  ", row["nombre"])
            else: fails.append(s["nombre"]); print("FALLÓ", s["nombre"])
            time.sleep(1.6)                    # límite aprox. 200 req / 5 min
    cols = list(rows[0].keys()) if rows else ["nombre", "en_steam", "revisar"]
    for r in rows:
        for c in r:
            if c not in cols: cols.append(c)
    with open(DATA_DIR / "juegos_argentinos.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=cols); w.writeheader(); w.writerows(rows)
    with open(DATA_DIR / "juegos_argentinos.json", "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
    print(f"\n{len(rows)} juegos. Fallidos: {fails}")

if __name__ == "__main__":
    main()
