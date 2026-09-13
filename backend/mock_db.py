# Mock database for MVP — scoped to Karnataka
from models import Item, Listing, Order

# Karnataka-specific crops
crops = [
    Item(id=1, name="Ragi (Finger Millet)"),
    Item(id=2, name="Paddy (Rice)"),
    Item(id=3, name="Jowar (Sorghum)"),
    Item(id=4, name="Maize"),
    Item(id=5, name="Sugarcane"),
]

# Karnataka-specific vegetables
vegetables = [
    Item(id=1, name="Tomato"),
    Item(id=2, name="Potato"),
    Item(id=3, name="Onion"),
    Item(id=4, name="Brinjal"),
    Item(id=5, name="Green Chilli"),
]

# Karnataka-specific fruits
fruits = [
    Item(id=1, name="Mango (Alphonso)"),
    Item(id=2, name="Banana"),
    Item(id=3, name="Sapota (Chikoo)"),
    Item(id=4, name="Pomegranate"),
    Item(id=5, name="Jackfruit"),
]

# Initial mock listings
listings = [
    Listing(id=1, category="crop", crop_name="Ragi (Finger Millet)", crop_type="Kharif", quantity_kg=200, price_per_kg=38, farmer_id="farmer@agro.com"),
    Listing(id=2, category="crop", crop_name="Paddy (Rice)", crop_type="Kharif", quantity_kg=350, price_per_kg=28, farmer_id="farmer@agro.com"),
    Listing(id=3, category="crop", crop_name="Jowar (Sorghum)", crop_type="Rabi", quantity_kg=150, price_per_kg=32, farmer_id="farmer@agro.com"),
    Listing(id=4, category="vegetable", crop_name="Tomato", crop_type="Root", quantity_kg=100, price_per_kg=45, farmer_id="farmer@agro.com"),
    Listing(id=5, category="fruit", crop_name="Mango (Alphonso)", crop_type="Tropical", quantity_kg=80, price_per_kg=120, farmer_id="farmer@agro.com"),
]

orders = [
    Order(id=1, listing_id=1, crop_name="Ragi (Finger Millet)", quantity=50, total_price=1900, buyer_id="buyer@agro.com"),
    Order(id=2, listing_id=2, crop_name="Paddy (Rice)", quantity=100, total_price=2800, buyer_id="buyer@agro.com")
]

# Farmers directory
farmers = [
    {"id": 1, "name": "Ramesh Gowda", "email": "farmer@agro.com", "phone": "+91 98450 12345", "district": "Mandya", "land_acres": 4.5, "status": "Verified"},
    {"id": 2, "name": "Basavaraj Patil", "email": "basavaraj@agro.com", "phone": "+91 94480 67890", "district": "Haveri", "land_acres": 8.0, "status": "Verified"},
    {"id": 3, "name": "Shivanand Hegde", "email": "shiva@agro.com", "phone": "+91 99010 44556", "district": "Shivamogga", "land_acres": 3.0, "status": "Pending"},
    {"id": 4, "name": "Mallikarjun Biradar", "email": "biradar@agro.com", "phone": "+91 97410 88990", "district": "Kalaburagi", "land_acres": 6.2, "status": "Verified"},
]

# Customers / Buyers directory
customers = [
    {"id": 1, "name": "Suresh Wholesale", "email": "buyer@agro.com", "phone": "+91 98800 23456", "district": "Bengaluru Urban", "company": "Suresh Traders", "status": "Active"},
    {"id": 2, "name": "Priya Supermarket", "email": "priya@retail.in", "phone": "+91 99450 34567", "district": "Mysuru", "company": "Priya Retail Chains", "status": "Active"},
    {"id": 3, "name": "Anand Food Processors", "email": "anand@agrofood.com", "phone": "+91 96320 89012", "district": "Hubballi-Dharwad", "company": "Anand Agro Ltd", "status": "Active"},
]

# Support Queries & Contact Messages
queries = [
    {"id": 1, "name": "Manjunath", "email": "manju@gmail.com", "message": "When will APMC Yeshwanthpur publish tomorrow's tomato modal prices?", "status": "Pending", "created_at": "Today, 10:30 AM"},
    {"id": 2, "name": "Deepak Kumar", "email": "deepak@agrobuyers.in", "message": "Need bulk supply of organic Ragi (500 kg). Can I arrange direct transport from Mandya?", "status": "Resolved", "created_at": "Yesterday, 4:15 PM"},
    {"id": 3, "name": "Sunitha Reddy", "email": "sunitha@karnatakaagri.org", "message": "Query regarding subsidy application for drip irrigation in Kolar district.", "status": "Pending", "created_at": "2 days ago"}
]

# Soil test doorstep requests from farmers
soil_test_requests = [
    {
        "id": 1,
        "farmer_name": "Ramesh Gowda",
        "phone": "+91 98450 12345",
        "district": "Mandya",
        "taluk": "Pandavapura",
        "village": "Holenarasipura Cross",
        "land_acres": 4.5,
        "status": "Completed",
        "created_at": "3 days ago",
        "officer_name": "Dr. Anand Kulkarni (Field Agronomist)",
        "report": {
            "sample_id": "KA-ST-MAN-8841",
            "tested_date": "Yesterday",
            "values": {"n": 78, "p": 44, "k": 48, "temp": 27.0, "humidity": 70, "ph": 6.5, "rainfall": 820},
            "health_score": 92,
            "soil_type": "Red Sandy Loam"
        }
    }
]

