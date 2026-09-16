import os
import hashlib
import hmac
import jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.environ.get("JWT_SECRET", "agro-trades-karnataka-secure-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hash password using PBKDF2 HMAC SHA256 with a unique random salt."""
    salt = os.urandom(16).hex()
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}:{key}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored salt:hash string."""
    try:
        if ":" not in hashed_password:
            return False
        salt, key = hashed_password.split(":", 1)
        new_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return hmac.compare_digest(key, new_key)
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

try:
    from firebase_admin import auth as fb_auth
    from firebase_config import is_firebase_active
except ImportError:
    fb_auth = None
    def is_firebase_active():
        return False

def get_current_user_payload(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[dict]:
    if not credentials:
        return None
    token = credentials.credentials
    
    # 1. Try Firebase Auth verification if Firebase is active
    if is_firebase_active() and fb_auth:
        try:
            decoded = fb_auth.verify_id_token(token)
            return {
                "sub": decoded.get("email"),
                "email": decoded.get("email"),
                "uid": decoded.get("uid"),
                "role": decoded.get("role", "farmer"),
                "name": decoded.get("name", ""),
                "firebase": True
            }
        except Exception:
            # Fall back to custom JWT if token is not a Firebase token
            pass

    # 2. Fall back to local JWT decode
    jwt_payload = decode_access_token(token)
    if jwt_payload:
        return jwt_payload

    # 3. Support dev/offline base64 tokens (e.g. dev-token-...)
    if token.startswith("dev-token-"):
        try:
            import base64
            import json
            raw_b64 = token[len("dev-token-"):]
            data = json.loads(base64.b64decode(raw_b64).decode("utf-8"))
            return {
                "sub": data.get("email"),
                "email": data.get("email"),
                "role": data.get("role", "farmer"),
                "name": data.get("name", data.get("email", "").split("@")[0]),
                "dev": True
            }
        except Exception:
            pass

    return None

