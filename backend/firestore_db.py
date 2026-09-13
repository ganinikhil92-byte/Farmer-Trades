"""
Firestore database service layer for Karnataka Agro Trades.
Provides CRUD helpers mapping to Firestore collections.
"""
import time
from typing import List, Optional, Dict, Any
from firebase_config import get_firestore, is_firebase_active

def get_db():
    return get_firestore()

# --- Users Collection ---
def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    if not db:
        return None
    doc = db.collection("users").document(email.lower().strip()).get()
    if doc.exists:
        return doc.to_dict()
    return None

def create_or_update_user(email: str, data: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    clean_email = email.lower().strip()
    data["email"] = clean_email
    if "updated_at" not in data:
        data["updated_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
    db.collection("users").document(clean_email).set(data, merge=True)
    return data

def list_users(role: Optional[str] = None) -> List[Dict[str, Any]]:
    db = get_db()
    if not db:
        return []
    coll = db.collection("users")
    if role:
        docs = coll.where("role", "==", role).stream()
    else:
        docs = coll.stream()
    return [d.to_dict() for d in docs]

def delete_user(email: str) -> bool:
    db = get_db()
    if not db:
        return False
    db.collection("users").document(email.lower().strip()).delete()
    return True

# --- Listings Collection (Crops, Fruits, Vegetables) ---
def create_listing(data: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    if "created_at" not in data:
        data["created_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
    doc_ref = db.collection("listings").document()
    data["id"] = doc_ref.id
    doc_ref.set(data)
    return data

def list_listings(category: Optional[str] = None) -> List[Dict[str, Any]]:
    db = get_db()
    if not db:
        return []
    coll = db.collection("listings")
    if category:
        docs = coll.where("category", "==", category).stream()
    else:
        docs = coll.stream()
    
    results = []
    for d in docs:
        item = d.to_dict()
        item["id"] = d.id
        results.append(item)
    return results

def delete_listing(listing_id: str) -> bool:
    db = get_db()
    if not db:
        return False
    db.collection("listings").document(str(listing_id)).delete()
    return True

# --- Orders Collection ---
def create_order(data: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    if "order_date" not in data:
        data["order_date"] = time.strftime("%Y-%m-%d")
    if "status" not in data:
        data["status"] = "Confirmed"
    doc_ref = db.collection("orders").document()
    data["id"] = doc_ref.id
    doc_ref.set(data)
    return data

def list_orders(buyer_id: Optional[str] = None) -> List[Dict[str, Any]]:
    db = get_db()
    if not db:
        return []
    coll = db.collection("orders")
    if buyer_id:
        docs = coll.where("buyer_id", "==", buyer_id).stream()
    else:
        docs = coll.stream()
    
    results = []
    for d in docs:
        item = d.to_dict()
        item["id"] = d.id
        results.append(item)
    return results

# --- Queries (Contact Us) Collection ---
def create_query(data: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    if "created_at" not in data:
        data["created_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
    doc_ref = db.collection("queries").document()
    data["id"] = doc_ref.id
    doc_ref.set(data)
    return data

def list_queries() -> List[Dict[str, Any]]:
    db = get_db()
    if not db:
        return []
    docs = db.collection("queries").stream()
    results = []
    for d in docs:
        item = d.to_dict()
        item["id"] = d.id
        results.append(item)
    return results

# --- Soil Test Requests Collection ---
def create_soil_test(data: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    if "request_date" not in data:
        data["request_date"] = time.strftime("%Y-%m-%d")
    if "status" not in data:
        data["status"] = "Pending"
    doc_ref = db.collection("soil_tests").document()
    data["id"] = doc_ref.id
    doc_ref.set(data)
    return data

def list_soil_tests(farmer_id: Optional[str] = None) -> List[Dict[str, Any]]:
    db = get_db()
    if not db:
        return []
    coll = db.collection("soil_tests")
    if farmer_id:
        docs = coll.where("farmer_id", "==", farmer_id).stream()
    else:
        docs = coll.stream()
    results = []
    for d in docs:
        item = d.to_dict()
        item["id"] = d.id
        results.append(item)
    return results
