import os
import json
from typing import Optional
import firebase_admin
from firebase_admin import credentials, auth, firestore

_firebase_app: Optional[firebase_admin.App] = None
_firestore_db = None

def get_service_account_path() -> Optional[str]:
    """Find the Firebase service account JSON key if present."""
    env_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_KEY")
    if env_path and os.path.exists(env_path):
        return env_path
    
    # Check default common paths in backend folder
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(backend_dir, "firebase-key.json"),
        os.path.join(backend_dir, "serviceAccountKey.json"),
        os.path.join(backend_dir, "firebase-credentials.json"),
        os.path.join(os.path.dirname(backend_dir), "firebase-key.json"),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None

def init_firebase() -> Optional[firebase_admin.App]:
    """Initialize Firebase Admin SDK with service account credentials or default environment."""
    global _firebase_app, _firestore_db
    
    if _firebase_app:
        return _firebase_app

    try:
        cred_path = get_service_account_path()
        project_id = os.environ.get("FIREBASE_PROJECT_ID")

        if cred_path:
            cred = credentials.Certificate(cred_path)
            _firebase_app = firebase_admin.initialize_app(cred)
            print(f"[FIREBASE] Initialized with credentials from: {cred_path}")
        elif project_id:
            _firebase_app = firebase_admin.initialize_app(options={"projectId": project_id})
            print(f"[FIREBASE] Initialized with project ID: {project_id}")
        else:
            # Try default credentials
            try:
                _firebase_app = firebase_admin.initialize_app()
                print("[FIREBASE] Initialized with application default credentials")
            except Exception:
                print("[FIREBASE] Notice: No Firebase credentials found. Running in local fallback mode.")
                return None

        if _firebase_app:
            _firestore_db = firestore.client()
            return _firebase_app
    except Exception as e:
        print(f"[FIREBASE WARNING] Failed to initialize Firebase Admin: {e}")
        return None

def is_firebase_active() -> bool:
    """Check if Firebase is initialized and available."""
    if _firebase_app is None:
        init_firebase()
    return _firebase_app is not None

def get_firestore():
    """Return the Firestore client instance if available."""
    if _firestore_db is None:
        init_firebase()
    return _firestore_db
