"""
Migration script: Migrates data from local SQLite database (agro_trades.db) into Cloud Firestore.
Run this after placing your firebase-key.json in the backend/ folder or setting FIREBASE_SERVICE_ACCOUNT_KEY.
"""
import os
import sys
from firebase_config import init_firebase, is_firebase_active, get_firestore
from database import SessionLocal
import db_models

def migrate():
    print("Connecting to Firebase...")
    init_firebase()
    if not is_firebase_active():
        print("ERROR: Firebase credentials not found or initialization failed.")
        print("Please place your service account JSON file in backend/firebase-key.json")
        print("or set the FIREBASE_SERVICE_ACCOUNT_KEY environment variable.")
        sys.exit(1)

    db = get_firestore()
    session = SessionLocal()

    try:
        # 1. Migrate Users
        users = session.query(db_models.User).all()
        print(f"Migrating {len(users)} users to Firestore 'users' collection...")
        for u in users:
            u_dict = u.to_dict()
            clean_email = u.email.strip().lower()
            db.collection("users").document(clean_email).set(u_dict, merge=True)
            print(f"  [OK] User synced: {clean_email} ({u.role})")

        # 2. Migrate Listings
        listings = session.query(db_models.Listing).all()
        print(f"Migrating {len(listings)} listings to Firestore 'listings' collection...")
        for l in listings:
            l_dict = l.to_dict()
            doc_id = str(l.id)
            db.collection("listings").document(doc_id).set(l_dict, merge=True)
            print(f"  [OK] Listing synced: {l.crop_name} ({l.category})")

        # 3. Migrate Orders
        orders = session.query(db_models.Order).all()
        print(f"Migrating {len(orders)} orders to Firestore 'orders' collection...")
        for o in orders:
            o_dict = o.to_dict()
            doc_id = str(o.id)
            db.collection("orders").document(doc_id).set(o_dict, merge=True)
            print(f"  [OK] Order synced: #{o.id} for {o.buyer_id}")

        # 4. Migrate Contact Queries
        queries = session.query(db_models.SupportQuery).all()
        print(f"Migrating {len(queries)} queries to Firestore 'queries' collection...")
        for q in queries:
            q_dict = q.to_dict()
            doc_id = str(q.id)
            db.collection("queries").document(doc_id).set(q_dict, merge=True)

        # 5. Migrate Soil Test Requests
        soil_tests = session.query(db_models.SoilTestRequest).all()
        print(f"Migrating {len(soil_tests)} soil test requests to Firestore 'soil_tests' collection...")
        for st in soil_tests:
            st_dict = st.to_dict()
            doc_id = str(st.id)
            db.collection("soil_tests").document(doc_id).set(st_dict, merge=True)

        print("\nAll data successfully migrated to Cloud Firestore!")

    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    migrate()
