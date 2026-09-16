import os
import json
from sqlalchemy import create_engine
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

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Seed Users
        if db.query(db_models.User).count() == 0:
            seed_users = [
                db_models.User(
                    email="nikhilgani987@gmail.com",
                    name="Nikhil Gani",
                    password_hash=auth.hash_password("Admin@123"),
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
                    district="Bengaluru Urban",
                    taluk="Bengaluru North",
                    village="Jakkur",
                    pincode="560064",
                    phone="9845012345",
                    status="Verified",
                    registered_at="2026-08-15"
                ),
                db_models.User(
                    email="patil@agro.com",
                    name="Basavaraj Patil",
                    password_hash=auth.hash_password("Farmer@123"),
                    role="farmer",
                    district="Belagavi",
                    taluk="Athani",
                    village="Hulagabal",
                    pincode="591304",
                    phone="9845023456",
                    status="Pending",
                    registered_at="2026-09-02"
                ),
                db_models.User(
                    email="ningappa@agro.com",
                    name="Ningappa Hegde",
                    password_hash=auth.hash_password("Farmer@123"),
                    role="farmer",
                    district="Shivamogga",
                    taluk="Sagar",
                    village="Anandapura",
                    pincode="577412",
                    phone="9845034567",
                    status="Verified",
                    registered_at="2026-09-05"
                ),
                db_models.User(
                    email="buyer@agro.com",
                    name="Suresh Kumar (Mysuru Traders)",
                    password_hash=auth.hash_password("Buyer@123"),
                    role="buyer",
                    district="Mysuru",
                    taluk="Mysuru",
                    village="Jayalakshmipuram",
                    pincode="570012",
                    phone="9845045678",
                    status="Verified",
                    registered_at="2026-08-20"
                ),
                db_models.User(
                    email="trader@agro.com",
                    name="Hubballi Wholesale APMC",
                    password_hash=auth.hash_password("Buyer@123"),
                    role="buyer",
                    district="Dharwad",
                    taluk="Hubballi Urban",
                    village="APMC Yard",
                    pincode="580025",
                    phone="9845056789",
                    status="Verified",
                    registered_at="2026-09-01"
                ),
                db_models.User(
                    email="retail@agro.com",
                    name="Bangalore Fresh Mart",
                    password_hash=auth.hash_password("Buyer@123"),
                    role="buyer",
                    district="Bengaluru Urban",
                    taluk="Bengaluru South",
                    village="Jayanagar",
                    pincode="560041",
                    phone="9845067890",
                    status="Pending",
                    registered_at="2026-09-08"
                ),
            ]
            db.add_all(seed_users)
            db.commit()

        # Seed Items (Crops, Vegetables, Fruits)
        if db.query(db_models.Item).count() == 0:
            seed_items = [
                # Crops
                db_models.Item(name="Ragi (Finger Millet)", category="crop"),
                db_models.Item(name="Paddy (Rice)", category="crop"),
                db_models.Item(name="Jowar (Sorghum)", category="crop"),
                db_models.Item(name="Maize", category="crop"),
                db_models.Item(name="Sugarcane", category="crop"),
                # Vegetables
                db_models.Item(name="Tomato", category="vegetable"),
                db_models.Item(name="Potato", category="vegetable"),
                db_models.Item(name="Onion", category="vegetable"),
                db_models.Item(name="Brinjal", category="vegetable"),
                db_models.Item(name="Green Chilli", category="vegetable"),
                # Fruits
                db_models.Item(name="Mango (Alphonso)", category="fruit"),
                db_models.Item(name="Banana", category="fruit"),
                db_models.Item(name="Sapota (Chikoo)", category="fruit"),
                db_models.Item(name="Pomegranate", category="fruit"),
                db_models.Item(name="Jackfruit", category="fruit"),
            ]
            db.add_all(seed_items)
            db.commit()

        # Seed Listings
        if db.query(db_models.Listing).count() == 0:
            seed_listings = [
                db_models.Listing(category="crop", crop_name="Ragi (Finger Millet)", crop_type="Kharif", quantity_kg=200, price_per_kg=38, farmer_id="farmer@agro.com"),
                db_models.Listing(category="crop", crop_name="Paddy (Rice)", crop_type="Kharif", quantity_kg=350, price_per_kg=28, farmer_id="farmer@agro.com"),
                db_models.Listing(category="crop", crop_name="Jowar (Sorghum)", crop_type="Rabi", quantity_kg=150, price_per_kg=32, farmer_id="farmer@agro.com"),
                db_models.Listing(category="vegetable", crop_name="Tomato", crop_type="Root", quantity_kg=100, price_per_kg=45, farmer_id="farmer@agro.com"),
                db_models.Listing(category="fruit", crop_name="Mango (Alphonso)", crop_type="Tropical", quantity_kg=80, price_per_kg=120, farmer_id="farmer@agro.com"),
            ]
            db.add_all(seed_listings)
            db.commit()

        # Seed Orders
        if db.query(db_models.Order).count() == 0:
            seed_orders = [
                db_models.Order(listing_id=1, crop_name="Ragi (Finger Millet)", quantity=50, total_price=1900, buyer_id="buyer@agro.com"),
                db_models.Order(listing_id=2, crop_name="Paddy (Rice)", quantity=100, total_price=2800, buyer_id="buyer@agro.com")
            ]
            db.add_all(seed_orders)
            db.commit()

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
