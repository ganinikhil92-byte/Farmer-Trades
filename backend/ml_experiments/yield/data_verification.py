import os
import csv
import hashlib
import json
import urllib.request

DATA_URL = "https://raw.githubusercontent.com/ankitaS11/Crop-Yield-Prediction-in-India-using-ML/master/crop_production.csv"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CSV_PATH = os.path.join(DATA_DIR, "crop_production.csv")
METADATA_PATH = os.path.join(os.path.dirname(__file__), "dataset_metadata.json")

PLATFORM_CROPS = {
    "Ragi": "Ragi (Finger Millet)",
    "Rice": "Paddy (Rice)",
    "Jowar": "Jowar (Sorghum)",
    "Maize": "Maize",
    "Sugarcane": "Sugarcane"
}

def download_dataset():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(CSV_PATH) or os.path.getsize(CSV_PATH) == 0:
        print(f"Downloading dataset from {DATA_URL}...")
        req = urllib.request.Request(DATA_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as resp, open(CSV_PATH, "wb") as f:
            while True:
                chunk = resp.read(65536)
                if not chunk:
                    break
                f.write(chunk)
        print(f"Saved dataset to {CSV_PATH} ({os.path.getsize(CSV_PATH)} bytes)")
    else:
        print(f"Dataset already exists at {CSV_PATH} ({os.path.getsize(CSV_PATH)} bytes)")

def compute_sha256(filepath):
    sha = hashlib.sha256()
    with open(filepath, "rb") as f:
        while True:
            data = f.read(65536)
            if not data:
                break
            sha.update(data)
    return sha.hexdigest()

def verify_data():
    download_dataset()
    file_checksum = compute_sha256(CSV_PATH)
    file_size_bytes = os.path.getsize(CSV_PATH)

    total_records = 0
    karnataka_records = []
    headers = []

    with open(CSV_PATH, mode="r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        headers = [h.strip() for h in next(reader)]
        for row in reader:
            total_records += 1
            if not row or len(row) < len(headers):
                continue
            state = row[0].strip()
            if state.lower() == "karnataka":
                karnataka_records.append({
                    "State_Name": state,
                    "District_Name": row[1].strip(),
                    "Crop_Year": int(row[2].strip()) if row[2].strip().isdigit() else None,
                    "Season": row[3].strip(),
                    "Crop": row[4].strip(),
                    "Area_raw": row[5].strip(),
                    "Production_raw": row[6].strip() if len(row) > 6 else ""
                })

    karnataka_count = len(karnataka_records)
    print(f"Total records in dataset: {total_records}")
    print(f"Total records for Karnataka: {karnataka_count}")

    missing_year = 0
    missing_area = 0
    missing_prod = 0
    zero_area = 0
    zero_prod = 0
    negative_area = 0
    negative_prod = 0

    districts = set()
    crops = set()
    seasons = set()
    years = set()
    key_counts = {}

    for r in karnataka_records:
        d = r["District_Name"]
        c = r["Crop"]
        s = r["Season"]
        y = r["Crop_Year"]

        if d: districts.add(d)
        if c: crops.add(c)
        if s: seasons.add(s)
        if y is not None: years.add(y)
        else: missing_year += 1

        key = (d, y, s, c)
        key_counts[key] = key_counts.get(key, 0) + 1

        try:
            area_val = float(r["Area_raw"])
            if area_val <= 0:
                zero_area += 1
            if area_val < 0:
                negative_area += 1
        except (ValueError, TypeError):
            missing_area += 1

        prod_str = r["Production_raw"].strip()
        if not prod_str or prod_str.lower() in ("nan", "null", ""):
            missing_prod += 1
        else:
            try:
                prod_val = float(prod_str)
                if prod_val == 0:
                    zero_prod += 1
                elif prod_val < 0:
                    negative_prod += 1
            except (ValueError, TypeError):
                missing_prod += 1

    duplicate_keys = {k: v for k, v in key_counts.items() if v > 1}
    num_duplicate_entries = sum(v - 1 for v in duplicate_keys.values())

    print(f"Years: {sorted(list(years))}")
    print(f"Districts count: {len(districts)}")
    print(f"Crops count: {len(crops)}")
    print(f"Seasons: {sorted(list(seasons))}")
    print(f"Missing Production rows: {missing_prod}")
    print(f"Zero Production rows: {zero_prod}")
    print(f"Zero/negative Area rows: {zero_area}")
    print(f"Duplicate key groups: {len(duplicate_keys)} ({num_duplicate_entries} extra rows)")

    platform_crop_counts = {}
    for r in karnataka_records:
        c_name = r["Crop"]
        matched_plat = None
        for p_key in PLATFORM_CROPS:
            if c_name.lower() == p_key.lower():
                matched_plat = p_key
                break
        if matched_plat:
            platform_crop_counts[matched_plat] = platform_crop_counts.get(matched_plat, 0) + 1

    print("\nPlatform crops present in Karnataka records:")
    for p_key, cnt in platform_crop_counts.items():
        print(f"  - {p_key} ({PLATFORM_CROPS[p_key]}): {cnt} records")

    metadata = {
        "dataset_name": "District-wise Season-wise Crop Production Statistics (APY)",
        "source_authority": "Directorate of Economics and Statistics, Ministry of Agriculture & Farmers Welfare, Government of India",
        "ogd_catalog_url": "https://data.gov.in/catalog/district-wise-season-wise-crop-production-statistics",
        "download_url": DATA_URL,
        "license": "Government Open Data License - India (GODL)",
        "license_terms": "Permits non-exclusive, worldwide, royalty-free use, adaptation, and sharing for commercial and non-commercial purposes with attribution under NDSAP.",
        "file_sha256": file_checksum,
        "file_size_bytes": file_size_bytes,
        "total_records_all_states": total_records,
        "karnataka_total_records": karnataka_count,
        "karnataka_years": sorted(list(years)),
        "karnataka_districts": sorted(list(districts)),
        "karnataka_seasons": sorted(list(seasons)),
        "karnataka_missing_production": missing_prod,
        "karnataka_zero_production": zero_prod,
        "karnataka_zero_or_missing_area": zero_area + missing_area,
        "karnataka_duplicate_keys_count": len(duplicate_keys),
        "documented_units": {
            "area": "Hectares (ha)",
            "production_general_grains": "Metric Tonnes",
            "production_coconut": "Nuts / Thousands of Nuts (Excluded from weight-based cohort)",
            "production_cotton": "Bales (Excluded from primary weight cohort)",
            "yield_metric": "Tonnes per Hectare (Production Tonnes / Area Hectares)"
        },
        "platform_crops_evaluated": {
            k: {
                "common_name": PLATFORM_CROPS[k],
                "record_count_raw": platform_crop_counts.get(k, 0),
                "area_unit": "Hectares",
                "production_unit": "Metric Tonnes",
                "yield_unit": "Tonnes/Hectare"
            }
            for k in PLATFORM_CROPS
        },
        "district_notes": [
            "Karnataka has experienced district reorganizations: Ramanagara was carved from Bangalore Rural (2007), Chikkaballapur from Kolar (2007), and Yadgir from Gulbarga (2009).",
            "Official district names have also been re-anglicized (e.g. Belagavi for Belgaum, Kalaburagi for Gulbarga, Vijayapura for Bijapur, Mysuru for Mysore, Ballari for Bellary, Shivamogga for Shimoga, Tumakuru for Tumkur).",
            "Historical reporting preserves the administrative district designation at the time of recording without blind retroactive merging."
        ]
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nMetadata and verification results successfully written to {METADATA_PATH}")

if __name__ == "__main__":
    verify_data()
