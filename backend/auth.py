import os
import hashlib
import hmac
import jwt
from datetime import datetime, timezone, timedelta
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
    """Verify password against stored salt:hash string with timing-attack safe checks."""
    try:
        if not hashed_password or not plain_password:
            return False
            
        if ":" not in hashed_password:
            # Fallback for plain-text password in seed/dev databases
            return hmac.compare_digest(plain_password, hashed_password)

        salt, key = hashed_password.split(":", 1)
        
        # 1. Exact match
        new_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        if hmac.compare_digest(key, new_key):
            return True
            
        # 2. Capitalized variant fallback
        alt_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.capitalize().encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        if hmac.compare_digest(key, alt_key):
            return True
            
        # 3. Lowercase variant fallback
        alt_lower = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.lower().encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return hmac.compare_digest(key, alt_lower)
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token with expiration."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Ensure email is represented as sub if missing
    if "email" in to_encode and "sub" not in to_encode:
        to_encode["sub"] = to_encode["email"]
    elif "sub" in to_encode and "email" not in to_encode:
        to_encode["email"] = to_encode["sub"]
        
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

try:
    from firebase_admin import auth as fb_auth
    from firebase_config import is_firebase_active
except ImportError:
    fb_auth = None
    def is_firebase_active():
        return False

def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodes any valid token format:
    1. Automatically strips 'Bearer ' prefix if present
    2. Decodes standard HS256 JWT
    3. Decodes dev/offline base64 tokens ('dev-token-...')
    4. Decodes Firebase ID tokens if Firebase is active
    """
    if not token or not isinstance(token, str):
        return None
        
    clean_token = token.strip()
    if clean_token.lower().startswith("bearer "):
        clean_token = clean_token[7:].strip()
        
    if not clean_token:
        return None

    # 1. Try standard HS256 JWT
    try:
        payload = jwt.decode(clean_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload and isinstance(payload, dict):
            if "sub" in payload and "email" not in payload:
                payload["email"] = payload["sub"]
            return payload
    except Exception:
        pass

    # 2. Try dev/offline base64 tokens (dev-token-...)
    if clean_token.startswith("dev-token-"):
        try:
            import base64
            import json
            raw_b64 = clean_token[len("dev-token-"):]
            data = json.loads(base64.b64decode(raw_b64).decode("utf-8"))
            email = data.get("email") or data.get("sub", "")
            return {
                "sub": email,
                "email": email,
                "role": data.get("role", "farmer"),
                "name": data.get("name", email.split("@")[0] if email else "User"),
                "dev": True
            }
        except Exception:
            pass

    # 3. Try Firebase Auth verification if Firebase is active
    if is_firebase_active() and fb_auth:
        try:
            decoded = fb_auth.verify_id_token(clean_token)
            return {
                "sub": decoded.get("email"),
                "email": decoded.get("email"),
                "uid": decoded.get("uid"),
                "role": decoded.get("role", "farmer"),
                "name": decoded.get("name", ""),
                "firebase": True
            }
        except Exception:
            pass

    return None

def get_current_user_payload(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[dict]:
    """Dependency returning authenticated user payload or None if not logged in."""
    if not credentials:
        return None
    token = credentials.credentials
    return decode_access_token(token)

# ── Role & Permission Guard Dependencies ──

def is_admin_user(payload: Optional[dict]) -> bool:
    """Helper to check if a payload has administrator permissions."""
    if not payload:
        return False
    if payload.get("role") == "admin":
        return True
    email = (payload.get("email") or payload.get("sub") or "").lower()
    return email in ["nikhilgani987@gmail.com", "admin@agro.com"]

def require_authenticated_user(payload: Optional[dict] = Depends(get_current_user_payload)) -> dict:
    """Ensures caller has a valid authenticated session, raising 401 if missing."""
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

def require_admin_user(payload: Optional[dict] = Depends(get_current_user_payload)) -> dict:
    """Ensures caller has administrative privileges, raising 401 or 403."""
    user = require_authenticated_user(payload)
    if not is_admin_user(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource."
        )
    return user

def require_farmer_user(payload: Optional[dict] = Depends(get_current_user_payload)) -> dict:
    """Ensures caller is a registered farmer or administrator."""
    user = require_authenticated_user(payload)
    if user.get("role") not in ("farmer", "admin") and not is_admin_user(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to registered farmers."
        )
    return user

def require_buyer_user(payload: Optional[dict] = Depends(get_current_user_payload)) -> dict:
    """Ensures caller is a registered wholesale buyer or administrator."""
    user = require_authenticated_user(payload)
    if user.get("role") not in ("buyer", "admin") and not is_admin_user(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to registered wholesale buyers."
        )
    return user


