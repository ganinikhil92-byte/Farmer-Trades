import os
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Database configuration
# Can connect to MySQL if configured, otherwise defaults to reliable persistent SQLite
DEFAULT_SQLITE_URL = "sqlite:///./agro_trades.db"
DATABASE_URL = os.environ.get("DATABASE_URL", DEFAULT_SQLITE_URL)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    import db_models
    import auth

def map_legacy_listing_category(crop_name: str, category: str = "") -> str:
    name_l = (crop_name or "").strip().lower()
    cat_l = (category or "").strip().lower()
    if cat_l in ("vegetable", "vegetables") or "VEGETABLES" in (category or ""):
        return "VEGETABLES"
    if cat_l in ("fruit", "fruits") or "FRUITS" in (category or ""):
        return "FRUITS"
    if cat_l == "pulses" or "PULSES" in (category or ""):
        return "PULSES"
    if cat_l == "oilseeds" or "OILSEEDS" in (category or ""):
        return "OILSEEDS"
    if cat_l == "spices" or "SPICES" in (category or ""):
        return "SPICES"
    if cat_l == "commercial_crops" or "COMMERCIAL_CROPS" in (category or ""):
        return "COMMERCIAL_CROPS"
    if cat_l == "plantation_crops" or "PLANTATION_CROPS" in (category or ""):
        return "PLANTATION_CROPS"

    # Produce name keyword matching
    if any(k in name_l for k in ["sugarcane", "cotton", "tobacco"]):
        return "COMMERCIAL_CROPS"
    if any(k in name_l for k in ["coffee", "arecanut", "coconut", "cashew"]):
        return "PLANTATION_CROPS"
    if any(k in name_l for k in ["pepper", "cardamom", "turmeric", "ginger", "dry chilli", "chilli", "menasu"]):
        return "SPICES"
    if any(k in name_l for k in ["groundnut", "peanut", "sunflower", "soybean", "sesame", "safflower", "castor", "niger", "flax"]):
        return "OILSEEDS"
    if any(k in name_l for k in ["pigeon pea", "tur", "togari", "bengal gram", "chickpea", "kadale", "green gram", "moong", "black gram", "urad", "horse gram", "field bean", "avare", "cowpea"]):
        return "PULSES"
    if any(k in name_l for k in ["tomato", "potato", "onion", "brinjal", "green chilli", "bhendi", "ladies finger", "cabbage", "cauliflower", "carrot", "beans", "capsicum", "cucumber"]):
        return "VEGETABLES"
    if any(k in name_l for k in ["mango", "banana", "sapota", "chikoo", "pomegranate", "jackfruit", "papaya", "guava", "grapes", "watermelon"]):
        return "FRUITS"
    return "CEREALS_MILLETS"

def init_db():
    import db_models
    import auth

    Base.metadata.create_all(bind=engine)

    try:
        with engine.connect() as conn:
            # 1. Soil test requests migration
            res = conn.execute(text("PRAGMA table_info(soil_test_requests)")).fetchall()
            existing_cols = {row[1] for row in res}
            cols_to_add = [
                ('farmer_id', 'TEXT DEFAULT ""'),
                ('field_name', 'TEXT DEFAULT ""'),
                ('land_unit', 'TEXT DEFAULT "Acres"'),
                ('preferred_date', 'TEXT DEFAULT ""'),
                ('provider_name', 'TEXT DEFAULT ""'),
                ('provider_contact', 'TEXT DEFAULT ""'),
                ('sample_id', 'TEXT DEFAULT ""'),
                ('sample_collected_date', 'TEXT DEFAULT ""'),
                ('attachment_filename', 'TEXT DEFAULT ""'),
                ('attachment_path', 'TEXT DEFAULT ""'),
                ('is_farmer_upload', 'INTEGER DEFAULT 0'),
                ('review_status', 'TEXT DEFAULT ""'),
                ('reviewer_name', 'TEXT DEFAULT ""'),
                ('review_date', 'TEXT DEFAULT ""'),
                ('payment_id', 'TEXT DEFAULT ""'),
                ('payment_status', 'TEXT DEFAULT "Pending"'),
                ('payment_amount', 'REAL DEFAULT 1000.0'),
                ('razorpay_order_id', 'TEXT DEFAULT ""'),
                ('razorpay_payment_id', 'TEXT DEFAULT ""'),
                ('razorpay_signature', 'TEXT DEFAULT ""')
            ]
            for c_name, c_type in cols_to_add:
                if c_name not in existing_cols:
                    conn.execute(text(f"ALTER TABLE soil_test_requests ADD COLUMN {c_name} {c_type}"))
            conn.commit()



            # 2. Orders migration (payment_id and image_url)
            res_orders = conn.execute(text("PRAGMA table_info(orders)")).fetchall()
            existing_order_cols = {row[1] for row in res_orders}
            if "payment_id" not in existing_order_cols:
                conn.execute(text("ALTER TABLE orders ADD COLUMN payment_id TEXT DEFAULT ''"))
                conn.commit()


            if "image_url" not in existing_order_cols:
                conn.execute(text("ALTER TABLE orders ADD COLUMN image_url TEXT DEFAULT ''"))
                conn.commit()



            # 3. Listings migration (produce classification columns)
            res_listings = conn.execute(text("PRAGMA table_info(listings)")).fetchall()
            existing_listing_cols = {row[1] for row in res_listings}
            listing_cols_to_add = [
                ('category_id', 'TEXT DEFAULT ""'),
                ('produce_id', 'TEXT DEFAULT ""'),
                ('produce_name', 'TEXT DEFAULT ""'),
                ('produce_name_kn', 'TEXT DEFAULT ""'),
                ('variety', 'TEXT DEFAULT ""'),
            ]
            for c_name, c_type in listing_cols_to_add:
                if c_name not in existing_listing_cols:
                    conn.execute(text(f"ALTER TABLE listings ADD COLUMN {c_name} {c_type}"))
            conn.commit()



            # 4. Items migration (category_id, name_kn, varieties, is_active)
            res_items = conn.execute(text("PRAGMA table_info(items)")).fetchall()
            existing_item_cols = {row[1] for row in res_items}
            item_cols_to_add = [
                ('category_id', 'TEXT DEFAULT ""'),
                ('name_kn', 'TEXT DEFAULT ""'),
                ('varieties', 'TEXT DEFAULT ""'),
                ('is_active', 'INTEGER DEFAULT 1'),
            ]
            for c_name, c_type in item_cols_to_add:
                if c_name not in existing_item_cols:
                    conn.execute(text(f"ALTER TABLE items ADD COLUMN {c_name} {c_type}"))
            conn.commit()



            # 5. One-time safe data migration: backfill category_id, produce_name, variety for existing listings
            rows = conn.execute(text("SELECT id, category, crop_name, crop_type, category_id FROM listings")).fetchall()
            for r in rows:
                row_id, old_cat, c_name, c_type, cur_cat_id = r[0], r[1], r[2], r[3], r[4]
                if not cur_cat_id or cur_cat_id.strip() == "":
                    new_cat_id = map_legacy_listing_category(c_name, old_cat)
                    conn.execute(
                        text("UPDATE listings SET category_id = :cat_id, produce_name = :p_name, variety = :var WHERE id = :id"),
                        {"cat_id": new_cat_id, "p_name": c_name, "var": c_type or "", "id": row_id}
                    )
            conn.commit()



            # 6. Farmer subscriptions table migration check
            res_subs = conn.execute(text("PRAGMA table_info(farmer_subscriptions)")).fetchall()
            if res_subs:
                existing_sub_cols = {row[1] for row in res_subs}
                sub_cols_to_add = [
                    ('farmer_name', 'TEXT DEFAULT ""'),
                    ('farmer_phone', 'TEXT DEFAULT ""'),
                    ('razorpay_order_id', 'TEXT DEFAULT ""'),
                    ('razorpay_payment_id', 'TEXT DEFAULT ""'),
                    ('razorpay_signature', 'TEXT DEFAULT ""'),
                ]
                for c_name, c_type in sub_cols_to_add:
                    if c_name not in existing_sub_cols:
                        conn.execute(text(f"ALTER TABLE farmer_subscriptions ADD COLUMN {c_name} {c_type}"))
                conn.commit()

    except Exception as ex:
        print(f"[DB migration note] {ex}")

    db = SessionLocal()

    try:
        # Seed Users
        if db.query(db_models.User).count() == 0:
            seed_users = [
                db_models.User(
                    email="nikhilgani987@gmail.com",
                    name="Nikhil Gani",
                    password_hash=auth.hash_password("Nikhil@2005"),
                    role="admin",
                    district="Bengaluru Urban",
                    taluk="Bengaluru South",
                    village="Jayanagar",
                    pincode="560041",
                    phone="8660416257",
                    status="Verified",
                    registered_at="2026-08-01"
                ),
                db_models.User(
                    email="admin@agro.com",
                    name="Admin Officer",
                    password_hash=auth.hash_password("Admin@123"),
                    role="admin",
                    status="Verified",
                    registered_at="2026-08-01"
                ),
                db_models.User(
                    email="farmer@agro.com",
                    name="Ramesh Gowda",
                    password_hash=auth.hash_password("Farmer@123"),
                    role="farmer",
                    district="Mandya",
                    taluk="Pandavapura",
                    village="Holenarasipura Cross",
                    pincode="571434",
                    phone="+91 98450 12345",
                    status="Verified",
                    registered_at="2026-08-01"
                ),
                db_models.User(
                    email="buyer@agro.com",
                    name="Suresh Wholesale",
                    password_hash=auth.hash_password("Buyer@123"),
                    role="buyer",
                    district="Bengaluru Urban",
                    taluk="Bengaluru North",
                    village="Yeshwanthpur",
                    pincode="560022",
                    phone="+91 98800 23456",
                    status="Verified",
                    registered_at="2026-08-01"
                )
            ]
            db.add_all(seed_users)
            db.commit()

        # Seed Items (Categories, Produce and Varieties)
        if db.query(db_models.Item).count() == 0:
            seed_items = [
                # Cereals & Millets
                db_models.Item(name="Paddy / Rice", category="crop", category_id="CEREALS_MILLETS", name_kn="ಭತ್ತ", varieties='["Gangavathi Sona", "KMP-220", "MSN-99", "Daksha (KMP-175)", "KRH-2", "KRH-4", "MAS-26", "Sharada", "Thanu", "BR-2655"]'),
                db_models.Item(name="Finger Millet / Ragi", category="crop", category_id="CEREALS_MILLETS", name_kn="ರಾಗಿ", varieties='["GPU-28", "GPU-48", "GPU-66", "GPU-67", "ML-365", "MR-1", "MR-6", "Indaf-7", "Indaf-9", "KMR-204", "KMR-301", "KMR-316", "KMR-340", "KMR-630"]'),
                db_models.Item(name="Sorghum / Jowar", category="crop", category_id="CEREALS_MILLETS", name_kn="ಜೋಳ", varieties='["CSV-4", "CSH-5", "CSH-9", "Other / Local Variety"]'),
                db_models.Item(name="Maize", category="crop", category_id="CEREALS_MILLETS", name_kn="ಮೆಕ್ಕೆ ಜೋಳ", varieties='["Hema (NAH-1137)", "Nithyashree (NAH-2049)", "MAH-14-5", "MAH-14-138"]'),
                # Pulses
                db_models.Item(name="Pigeon Pea / Red Gram / Tur", category="pulses", category_id="PULSES", name_kn="ತೊಗರಿ", varieties='["BRG-1", "BRG-2", "BRG-3", "BRG-4", "BRG-5", "BRG-10-2", "TTB-7", "ICP-7035"]'),
                db_models.Item(name="Bengal Gram / Chickpea", category="pulses", category_id="PULSES", name_kn="ಕಡಲೆ", varieties='["JG-11", "JAKI-9218", "Annigeri-1", "Other / Local Variety"]'),
                # Oilseeds
                db_models.Item(name="Groundnut / Peanut", category="oilseeds", category_id="OILSEEDS", name_kn="ಕಡಲೆಕಾಯಿ / ಶೇಂಗಾ", varieties='["GKVK-5", "GKVK-27", "KCG-6", "GPBD-4", "JL-24", "TMV-2"]'),
                db_models.Item(name="Sunflower", category="oilseeds", category_id="OILSEEDS", name_kn="ಸೂರ್ಯಕಾಂತಿ", varieties='["KBSH-41", "KBSH-42", "KBSH-44", "KBSH-53", "Other / Local Variety"]'),
                # Commercial Crops
                db_models.Item(name="Sugarcane", category="commercial_crops", category_id="COMMERCIAL_CROPS", name_kn="ಕಬ್ಬು", varieties='["CoVC-18061", "CoVC-16061", "CoVC-16062", "VCF-0517", "CoVC-99463"]'),
                db_models.Item(name="Cotton", category="commercial_crops", category_id="COMMERCIAL_CROPS", name_kn="ಹತ್ತಿ", varieties='["Bt Bollgard-II", "DHH-11", "RCH-2", "Other / Local Variety"]'),
                # Plantation Crops
                db_models.Item(name="Coffee", category="plantation_crops", category_id="PLANTATION_CROPS", name_kn="ಕಾಫಿ", varieties='["Arabica", "S.795", "Robusta", "Other / Local Variety"]'),
                db_models.Item(name="Arecanut", category="plantation_crops", category_id="PLANTATION_CROPS", name_kn="ಅಡಿಕೆ", varieties='["Shatamangala", "Mangala", "Other / Local Variety"]'),
                # Spices
                db_models.Item(name="Black Pepper", category="spices", category_id="SPICES", name_kn="ಕರಿಮೆಣಸು", varieties='["Panniyur selections", "Panniyur-1", "Other / Local Variety"]'),
                db_models.Item(name="Turmeric", category="spices", category_id="SPICES", name_kn="ಅರಿಶಿನ", varieties='["IISR Pratibha", "Salem / Erode", "Other / Local Variety"]'),
                db_models.Item(name="Dry Chilli", category="spices", category_id="SPICES", name_kn="ಒಣ ಮೆಣಸಿನಕಾಯಿ", varieties='["Byadgi Kaddi", "Byadgi Dabbi", "Guntur", "Other / Local Variety"]'),
                # Vegetables
                db_models.Item(name="Tomato", category="vegetable", category_id="VEGETABLES", name_kn="ಟೊಮ್ಯಾಟೊ", varieties='["Kashi Vishesh", "Arka Rakshak", "Arka Saurabh"]'),
                db_models.Item(name="Potato", category="vegetable", category_id="VEGETABLES", name_kn="ಆಲೂಗಡ್ಡೆ", varieties='["Kufri Jyoti", "Kufri Pukhraj", "Other / Local Variety"]'),
                db_models.Item(name="Onion", category="vegetable", category_id="VEGETABLES", name_kn="ಈರುಳ್ಳಿ", varieties='["Bellary Red", "Arka Kalyan", "Bangalore Rose"]'),
                db_models.Item(name="Brinjal", category="vegetable", category_id="VEGETABLES", name_kn="ಬದನೆಕಾಯಿ", varieties='["Mattu Gulla", "Arka Kusumakar", "Other / Local Variety"]'),
                db_models.Item(name="Green Chilli", category="vegetable", category_id="VEGETABLES", name_kn="ಹಸಿಮೆಣಸಿನಕಾಯಿ", varieties='["Arka Meghana", "G-4", "Other / Local Variety"]'),
                db_models.Item(name="Ladies Finger / Bhendi", category="vegetable", category_id="VEGETABLES", name_kn="ಬೆಂಡೆಕಾಯಿ", varieties='["Arka Anamika", "Pusa Sawani", "Other / Local Variety"]'),
                # Fruits
                db_models.Item(name="Mango", category="fruit", category_id="FRUITS", name_kn="ಮಾವಿನ ಹಣ್ಣು", varieties='["Alphonso (Badami)", "Totapuri", "Raspuri", "Mallika"]'),
                db_models.Item(name="Banana", category="fruit", category_id="FRUITS", name_kn="ಬಾಳೆಹಣ್ಣು", varieties='["Grand Naine (G-9)", "Robusta", "Elakki (Yellaki)"]'),
                db_models.Item(name="Pomegranate", category="fruit", category_id="FRUITS", name_kn="ದಾಳಿಂಬೆ", varieties='["Bhagwa", "Arakta", "Ganesh"]'),
                db_models.Item(name="Sapota / Chikoo", category="fruit", category_id="FRUITS", name_kn="ಸಪೋಟ / ಚಿಕ್ಕು", varieties='["Kalipatti", "Cricket Ball"]'),
                db_models.Item(name="Jackfruit", category="fruit", category_id="FRUITS", name_kn="ಹಲಸಿನ ಹಣ್ಣು", varieties='["Tubagere Selection", "Swarna"]'),
            ]
            db.add_all(seed_items)
            db.commit()

        # No seed listings — all listings created fresh via the app

        # Seed Queries
        if db.query(db_models.SupportQuery).count() == 0:
            seed_queries = [
                db_models.SupportQuery(name="Manjunath", email="manju@gmail.com", message="When will APMC Yeshwanthpur publish tomorrow's tomato modal prices?", status="Pending", created_at="Today, 10:30 AM"),
                db_models.SupportQuery(name="Deepak Kumar", email="deepak@agrobuyers.in", message="Need bulk supply of organic Ragi (500 kg). Can I arrange direct transport from Mandya?", status="Resolved", created_at="Yesterday, 4:15 PM"),
                db_models.SupportQuery(name="Sunitha Reddy", email="sunitha@karnatakaagri.org", message="Query regarding subsidy application for drip irrigation in Kolar district.", status="Pending", created_at="2 days ago"),
            ]
            db.add_all(seed_queries)
            db.commit()

        # Seed Soil Test Request
        if db.query(db_models.SoilTestRequest).count() == 0:
            sample_report = {
                "sample_id": "KA-ST-MAN-8841",
                "tested_date": "Yesterday",
                "values": {"n": 78, "p": 44, "k": 48, "temp": 27.0, "humidity": 70, "ph": 6.5, "rainfall": 820},
                "health_score": 92,
                "soil_type": "Red Sandy Loam"
            }
            db.add(db_models.SoilTestRequest(
                farmer_name="Ramesh Gowda",
                phone="+91 98450 12345",
                district="Mandya",
                taluk="Pandavapura",
                village="Holenarasipura Cross",
                land_acres=4.5,
                status="Completed",
                created_at="3 days ago",
                officer_name="Dr. Anand Kulkarni (Field Agronomist)",
                report_json=json.dumps(sample_report)
            ))
            db.commit()

    finally:
        db.close()
