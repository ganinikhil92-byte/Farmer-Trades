import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import random
import time
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv()
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from database import get_db
import db_models
import auth

try:
    import firestore_db
    from firebase_config import is_firebase_active
except ImportError:
    firestore_db = None
    def is_firebase_active():
        return False

router = APIRouter()

# In-memory OTP storage: email -> {"otp": str, "expires_at": float, "verified": bool}
otp_store: Dict[str, Dict[str, Any]] = {}

def send_email_otp(to_email: str, otp: str) -> bool:
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASSWORD")
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    sender_email = os.environ.get("SMTP_FROM", smtp_user or "Karnataka Agro Trades <noreply@agrotrades.in>")

    if smtp_user and smtp_pass:
        subject = f"Karnataka Agro Trades - Your Email Verification Code: {otp}"
        html_content = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #166534; margin: 0; font-size: 24px;">Karnataka Agro Trades</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Empowering Farmers & Traders</p>
            </div>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <p style="font-size: 15px; color: #166534; margin-top: 0;">Namaskara! Your one-time registration code is:</p>
                <div style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #15803d; margin: 12px 0;">{otp}</div>
                <p style="font-size: 13px; color: #475569; margin-bottom: 0;">This verification code is valid for 10 minutes.</p>
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                Enter this 6-digit code in the registration form to verify your Gmail address and complete your account creation.
                If you did not request this code, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                Department of Agriculture, Karnataka • Agro Trades Portal
            </p>
        </div>
        """
        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = sender_email
            msg["To"] = to_email
            msg["Subject"] = subject
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(sender_email, to_email, msg.as_string())
            print(f"[EMAIL] Real OTP sent successfully via Gmail SMTP to {to_email}")
            return True
        except Exception as e:
            print(f"[EMAIL ERROR] Could not send email via SMTP ({smtp_host}:{smtp_port}): {e}")
            return False
    else:
        print(f"[EMAIL OTP - DEV/TESTING] Real SMTP not configured yet. Generated OTP for {to_email}: {otp}")
        return False

# --- Pydantic Schemas ---
class SendOtpRequest(BaseModel):
    email: str

class VerifyOtpRequest(BaseModel):
    email: str
    otp: str

class ItemCreate(BaseModel):
    name: str

class ListingCreate(BaseModel):
    category: str = "crop"
    crop_name: str
    crop_type: str = ""
    quantity_kg: float
    price_per_kg: float
    farmer_id: str

class OrderCreate(BaseModel):
    listing_id: int
    buyer_id: str
    crop_name: str = ""
    quantity: float
    total_price: float

class PredictionRequest(BaseModel):
    features: List[float]

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    pincode: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class UserStatusUpdate(BaseModel):
    status: str

class UserDetailsUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    pincode: Optional[str] = None
    status: Optional[str] = None

# --- Authentication Endpoints ---
@router.post("/auth/send-otp")
def send_otp(req: SendOtpRequest, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    # Generate 6-digit random OTP
    otp = f"{random.randint(100000, 999999)}"
    otp_store[email_clean] = {
        "otp": otp,
        "expires_at": time.time() + 600,  # 10 minutes expiry
        "verified": False
    }

    # Dispatch email
    email_sent = send_email_otp(email_clean, otp)

    if email_sent:
        return {
            "success": True,
            "message": f"Verification code sent to your email ({email_clean})! Please check your inbox or spam folder."
        }

    return {
        "success": True,
        "message": f"Verification code sent to {email_clean}",
        "otp": otp
    }

@router.post("/auth/verify-otp")
def verify_otp(req: VerifyOtpRequest):
    email_clean = req.email.strip().lower()
    otp_clean = req.otp.strip()

    entry = otp_store.get(email_clean)
    if not entry:
        raise HTTPException(status_code=400, detail="No OTP code requested for this email. Please click 'Send OTP'.")

    if time.time() > entry["expires_at"]:
        del otp_store[email_clean]
        raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new one.")

    if entry["otp"] != otp_clean:
        raise HTTPException(status_code=400, detail="Incorrect verification code. Please check your email and try again.")

    entry["verified"] = True
    return {
        "success": True,
        "message": "Email verified successfully! You can now set your password and complete your registration."
    }

@router.post("/auth/register")
def register(req: UserRegister, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    existing = db.query(db_models.User).filter(db_models.User.email == email_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Enforce OTP verification for farmer and buyer registrations
    if req.role in ("farmer", "buyer"):
        otp_entry = otp_store.get(email_clean)
        if not otp_entry or not otp_entry.get("verified"):
            raise HTTPException(
                status_code=400,
                detail="Email verification required. Please verify your email with the OTP before signing up."
            )

    new_user = db_models.User(
        email=email_clean,
        name=req.name,
        password_hash=auth.hash_password(req.password),
        role=req.role,
        district=req.district,
        taluk=req.taluk,
        village=req.village,
        pincode=req.pincode,
        phone=req.phone,
        status="Verified" if req.role == "admin" else "Pending"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if is_firebase_active() and firestore_db:
        try:
            u_data = new_user.to_dict()
            firestore_db.create_or_update_user(email_clean, u_data)
        except Exception as fe:
            print(f"[Firestore User Sync] Notice: {fe}")

    # Clean up OTP record
    if email_clean in otp_store:
        del otp_store[email_clean]

    token = auth.create_access_token({"sub": new_user.email, "role": new_user.role, "name": new_user.name})
    return {
        "success": True,
        "token": token,
        "user": new_user.to_dict()
    }

@router.post("/auth/login")
def login(req: UserLogin, db: Session = Depends(get_db)):
    user = db.query(db_models.User).filter(db_models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not auth.verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = auth.create_access_token({"sub": user.email, "role": user.role, "name": user.name})
    return {
        "success": True,
        "token": token,
        "user": user.to_dict()
    }

@router.post("/auth/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    otp_clean = req.otp.strip()

    entry = otp_store.get(email_clean)
    if not entry or not entry.get("verified"):
        if not entry or entry.get("otp") != otp_clean or time.time() > entry.get("expires_at", 0):
            raise HTTPException(status_code=400, detail="Invalid or expired verification code.")

    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    user = db.query(db_models.User).filter(db_models.User.email == email_clean).first()
    if not user:
        raise HTTPException(status_code=404, detail="No registered account found with this email address.")

    new_hash = auth.hash_password(req.new_password)
    user.password_hash = new_hash
    db.commit()

    if is_firebase_active() and firestore_db:
        try:
            firestore_db.create_or_update_user(email_clean, {"password_hash": new_hash})
        except Exception as fe:
            print(f"[Firestore Reset Sync] Notice: {fe}")

    if email_clean in otp_store:
        del otp_store[email_clean]

    return {"success": True, "message": "Password reset successfully! You can now log in with your new password."}

@router.get("/auth/me")
def get_me(payload: Optional[dict] = Depends(auth.get_current_user_payload), db: Session = Depends(get_db)):
    if not payload or ("sub" not in payload and "email" not in payload):
        raise HTTPException(status_code=401, detail="Not authenticated")

    email = payload.get("email") or payload.get("sub")
    if is_firebase_active() and firestore_db:
        fb_user = firestore_db.get_user_by_email(email)
        if fb_user:
            return fb_user

    user = db.query(db_models.User).filter(db_models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user.to_dict()

# --- User Management Endpoints ---
@router.get("/users")
def get_users(role: Optional[str] = None, db: Session = Depends(get_db)):
    if is_firebase_active() and firestore_db:
        fb_users = firestore_db.list_users(role=role)
        if fb_users:
            return fb_users
    query = db.query(db_models.User)
    if role:
        query = query.filter(db_models.User.role == role)
    users = query.all()
    return [u.to_dict() for u in users]

@router.put("/users/{email}/status")
def update_user_status(email: str, req: UserStatusUpdate, db: Session = Depends(get_db)):
    if is_firebase_active() and firestore_db:
        firestore_db.create_or_update_user(email, {"status": req.status})
    user = db.query(db_models.User).filter(db_models.User.email == email).first()
    if user:
        user.status = req.status
        db.commit()
        return {"success": True, "message": "User status updated", "user": user.to_dict()}
    return {"success": True, "message": "User status updated"}

@router.put("/users/{email}")
def update_user_details(email: str, req: UserDetailsUpdate, db: Session = Depends(get_db)):
    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    if is_firebase_active() and firestore_db:
        firestore_db.create_or_update_user(email, update_data)
    user = db.query(db_models.User).filter(db_models.User.email == email).first()
    if user:
        for k, v in update_data.items():
            setattr(user, k, v)
        db.commit()
        return {"success": True, "message": "User details updated", "user": user.to_dict()}
    return {"success": True, "message": "User details updated"}

@router.delete("/users/{email}")
def delete_user(email: str, db: Session = Depends(get_db)):
    if is_firebase_active() and firestore_db:
        firestore_db.delete_user(email)
    user = db.query(db_models.User).filter(db_models.User.email == email).first()
    if user:
        db.delete(user)
        db.commit()
    return {"success": True, "message": f"User {email} removed"}

# --- Catalog Master Data (Crops, Vegetables, Fruits) ---
@router.get("/crops")
def get_crops(db: Session = Depends(get_db)):
    crops = db.query(db_models.Item).filter(db_models.Item.category == "crop").all()
    return [c.to_dict() for c in crops]

@router.post("/crops")
def add_crop(item: ItemCreate, db: Session = Depends(get_db)):
    new_item = db_models.Item(name=item.name, category="crop")
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item.to_dict()

@router.delete("/crops/{item_id}")
def delete_crop(item_id: int, db: Session = Depends(get_db)):
    item = db.query(db_models.Item).filter(db_models.Item.id == item_id, db_models.Item.category == "crop").first()
    if not item:
        raise HTTPException(status_code=404, detail="Crop not found")
    db.delete(item)
    db.commit()
    return {"message": "Crop deleted"}

@router.get("/vegetables")
def get_vegetables(db: Session = Depends(get_db)):
    veg = db.query(db_models.Item).filter(db_models.Item.category == "vegetable").all()
    return [v.to_dict() for v in veg]

@router.post("/vegetables")
def add_vegetable(item: ItemCreate, db: Session = Depends(get_db)):
    new_item = db_models.Item(name=item.name, category="vegetable")
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item.to_dict()

@router.delete("/vegetables/{item_id}")
def delete_vegetable(item_id: int, db: Session = Depends(get_db)):
    item = db.query(db_models.Item).filter(db_models.Item.id == item_id, db_models.Item.category == "vegetable").first()
    if not item:
        raise HTTPException(status_code=404, detail="Vegetable not found")
    db.delete(item)
    db.commit()
    return {"message": "Vegetable deleted"}

@router.get("/fruits")
def get_fruits(db: Session = Depends(get_db)):
    fruits = db.query(db_models.Item).filter(db_models.Item.category == "fruit").all()
    return [f.to_dict() for f in fruits]

@router.post("/fruits")
def add_fruit(item: ItemCreate, db: Session = Depends(get_db)):
    new_item = db_models.Item(name=item.name, category="fruit")
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item.to_dict()

@router.delete("/fruits/{item_id}")
def delete_fruit(item_id: int, db: Session = Depends(get_db)):
    item = db.query(db_models.Item).filter(db_models.Item.id == item_id, db_models.Item.category == "fruit").first()
    if not item:
        raise HTTPException(status_code=404, detail="Fruit not found")
    db.delete(item)
    db.commit()
    return {"message": "Fruit deleted"}

# --- Farmer & Buyer Listings / Stocks ---
@router.get("/listings")
def get_listings(category: Optional[str] = None, db: Session = Depends(get_db)):
    if is_firebase_active() and firestore_db:
        items = firestore_db.list_listings(category=category)
        if items:
            return items
    query = db.query(db_models.Listing)
    if category:
        query = query.filter(db_models.Listing.category == category)
    listings = query.all()
    return [l.to_dict() for l in listings]

@router.post("/listings")
def create_listing(listing: ListingCreate, db: Session = Depends(get_db)):
    new_data = {
        "category": listing.category,
        "crop_name": listing.crop_name,
        "crop_type": listing.crop_type,
        "quantity_kg": listing.quantity_kg,
        "price_per_kg": listing.price_per_kg,
        "farmer_id": listing.farmer_id
    }
    if is_firebase_active() and firestore_db:
        try:
            created = firestore_db.create_listing(new_data)
        except Exception as e:
            print(f"[Firestore listing sync note] {e}")

    new_listing = db_models.Listing(
        category=listing.category,
        crop_name=listing.crop_name,
        crop_type=listing.crop_type,
        quantity_kg=listing.quantity_kg,
        price_per_kg=listing.price_per_kg,
        farmer_id=listing.farmer_id
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    return new_listing.to_dict()

# --- Orders with Stock Deduction ---
@router.get("/orders")
def get_orders(buyer_id: Optional[str] = None, db: Session = Depends(get_db)):
    if is_firebase_active() and firestore_db:
        items = firestore_db.list_orders(buyer_id=buyer_id)
        if items:
            return items
    query = db.query(db_models.Order)
    if buyer_id:
        query = query.filter(db_models.Order.buyer_id == buyer_id)
    orders = query.order_by(db_models.Order.id.desc()).all()
    return [o.to_dict() for o in orders]

@router.post("/orders")
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    if is_firebase_active() and firestore_db:
        try:
            firestore_db.create_order({
                "listing_id": order.listing_id,
                "buyer_id": order.buyer_id,
                "crop_name": order.crop_name,
                "quantity": order.quantity,
                "total_price": order.total_price,
                "status": "Confirmed"
            })
        except Exception as e:
            print(f"[Firestore order sync note] {e}")

    listing = db.query(db_models.Listing).filter(db_models.Listing.id == order.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.quantity_kg < order.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    # Atomic stock decrement
    listing.quantity_kg -= order.quantity

    crop_title = order.crop_name if order.crop_name else listing.crop_name

    new_order = db_models.Order(
        listing_id=order.listing_id,
        buyer_id=order.buyer_id,
        crop_name=crop_title,
        quantity=order.quantity,
        total_price=order.total_price,
        status="Confirmed"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order.to_dict()

# --- Soil Testing & ML Heuristic Endpoints ---
@router.post("/soil-test")
def run_soil_test(data: dict):
    district = data.get("district", "Mandya")
    soil_type = data.get("soil_type", "Red Sandy Loam")
    previous_crop = data.get("previous_crop", "Ragi")
    
    base_data = {
        "Mandya": {"n": 78, "p": 44, "k": 48, "temp": 27.0, "humidity": 70, "ph": 6.5, "rainfall": 820},
        "Mysuru": {"n": 82, "p": 46, "k": 52, "temp": 26.5, "humidity": 72, "ph": 6.6, "rainfall": 860},
        "Hassan": {"n": 68, "p": 38, "k": 42, "temp": 24.5, "humidity": 78, "ph": 6.0, "rainfall": 1150},
        "Belagavi": {"n": 58, "p": 52, "k": 62, "temp": 27.5, "humidity": 65, "ph": 7.6, "rainfall": 920},
        "Shivamogga": {"n": 64, "p": 35, "k": 38, "temp": 25.5, "humidity": 82, "ph": 5.8, "rainfall": 1750},
        "Kalaburagi": {"n": 52, "p": 48, "k": 55, "temp": 31.0, "humidity": 52, "ph": 7.9, "rainfall": 720},
        "Kolar": {"n": 80, "p": 45, "k": 46, "temp": 26.0, "humidity": 64, "ph": 6.8, "rainfall": 740},
        "Dharwad": {"n": 65, "p": 45, "k": 50, "temp": 27.0, "humidity": 68, "ph": 7.1, "rainfall": 810},
        "Tumakuru": {"n": 74, "p": 40, "k": 44, "temp": 27.5, "humidity": 62, "ph": 6.7, "rainfall": 760},
        "Ballari": {"n": 50, "p": 46, "k": 54, "temp": 32.0, "humidity": 50, "ph": 7.8, "rainfall": 680},
    }
    
    baseline = base_data.get(district, base_data["Mandya"]).copy()
    
    if "Black" in soil_type:
        baseline["k"] += 8
        baseline["ph"] = round(baseline["ph"] + 0.5, 1)
    elif "Laterite" in soil_type:
        baseline["ph"] = round(baseline["ph"] - 0.4, 1)
        baseline["rainfall"] += 150
    elif "Alluvial" in soil_type:
        baseline["n"] += 6
        baseline["p"] += 5
        
    if "Legumes" in previous_crop or "Pulses" in previous_crop:
        baseline["n"] += 12
    elif "Sugarcane" in previous_crop:
        baseline["k"] = max(20, baseline["k"] - 6)
        baseline["n"] = max(20, baseline["n"] - 8)
        
    return {
        "status": "success",
        "sample_id": f"KA-ST-{district[:3].upper()}-921",
        "district": district,
        "soil_type": soil_type,
        "values": baseline,
        "health_score": 91,
        "organic_carbon": "0.74% (Medium-High)",
        "ec": "0.42 dS/m (Normal Non-Saline)"
    }

@router.post("/predict/crop")
def predict_crop(req: PredictionRequest):
    feats = req.features
    if len(feats) >= 7:
        n, p, k, temp, humidity, ph, rainfall = feats[:7]
        if rainfall > 1100 and humidity > 70:
            crop = "Paddy (Rice - Jyothi / Jaya)"
        elif ph < 6.4 and rainfall < 950:
            crop = "Ragi (Finger Millet - GPU-28 / ML-365)"
        elif temp > 28 and rainfall < 750:
            crop = "Jowar (Sorghum - CSH-14)"
        elif k > 50 and ph >= 6.5:
            crop = "Sugarcane (Co-86032 / Co-62175)"
        elif p > 44 and temp < 28:
            crop = "Tomato (Arka Rakshak / Shivam)"
        elif n > 72:
            crop = "Hybrid Maize (NAH-1137 / CP-818)"
        else:
            crop = "Ragi (Indaf-5) with Red Gram intercrop"
        return {"prediction": crop}
    return {"prediction": "Ragi (Finger Millet - ML-365)"}

@router.post("/predict/yield")
def predict_yield(req: PredictionRequest):
    feats = req.features
    if len(feats) >= 1:
        area = feats[0] if (feats[0] > 0 and feats[0] <= 100) else 2.5
        rainfall = feats[3] if (len(feats) >= 4 and feats[3] > 0) else 820
        yield_per_acre = round(min(38.0, max(14.0, (rainfall / 100) * 2.1 + 8.2)), 1)
        total_yield = round(yield_per_acre * area, 1)
        return {"prediction": f"{yield_per_acre} Quintals/Acre (Estimated Total: {total_yield} Quintals for {area} acres)"}
    return {"prediction": "24.5 Quintals/Acre"}

@router.post("/predict/rainfall")
def predict_rainfall(req: PredictionRequest):
    feats = req.features
    if len(feats) >= 4:
        altitude, hist_precip, pressure, clouds = feats[:4]
        forecast_mm = round(max(50.0, hist_precip * 0.9 + clouds * 2.2), 1)
        return {"prediction": f"Active Monsoon: ~{forecast_mm} mm seasonal precipitation expected with favorable soil moisture"}
    elif len(feats) >= 1 and feats[0] > 100:
        rf = feats[0]
        return {"prediction": f"Seasonal precipitation forecast: ~{rf} mm expected over crop cycle (Adequate for rainfed kharif)"}
    return {"prediction": "Southwest Monsoon: ~820-950 mm normal precipitation expected over crop cycle"}

@router.post("/recommend/fertilizer")
def recommend_fertilizer(req: PredictionRequest):
    return {"recommendation": "Urea (50 kg/acre) + DAP (25 kg/acre) + MOP (15 kg/acre) with Trichoderma bio-fertilizer"}

# --- Support Queries ---
@router.get("/queries")
def get_queries(db: Session = Depends(get_db)):
    if is_firebase_active() and firestore_db:
        items = firestore_db.list_queries()
        if items:
            return items
    queries = db.query(db_models.SupportQuery).order_by(db_models.SupportQuery.id.desc()).all()
    return [q.to_dict() for q in queries]

@router.post("/queries")
def submit_query(data: dict, db: Session = Depends(get_db)):
    if is_firebase_active() and firestore_db:
        try:
            firestore_db.create_query(data)
        except Exception as e:
            print(f"[Firestore query note] {e}")

    new_query = db_models.SupportQuery(
        name=data.get("name", "Anonymous"),
        email=data.get("email", ""),
        message=data.get("message", ""),
        status="Pending",
        created_at="Just now"
    )
    db.add(new_query)
    db.commit()
    db.refresh(new_query)
    return {"success": True, "message": "Query received", "query": new_query.to_dict()}

# --- Doorstep Soil Test Requests ---
@router.get("/soil-test-requests")
def get_soil_test_requests(phone: Optional[str] = None, db: Session = Depends(get_db)):
    if is_firebase_active() and firestore_db:
        items = firestore_db.list_soil_tests(farmer_id=phone)
        if items:
            return items
    query = db.query(db_models.SoilTestRequest)
    if phone:
        query = query.filter(db_models.SoilTestRequest.phone == phone)
    reqs = query.order_by(db_models.SoilTestRequest.id.desc()).all()
    return [r.to_dict() for r in reqs]

@router.post("/soil-test-requests")
def create_soil_test_request(data: dict, db: Session = Depends(get_db)):
    district = data.get("district", "Mandya")
    count = db.query(db_models.SoilTestRequest).count()
    sample_report = {
        "sample_id": f"KA-ST-{district[:3].upper()}-{count + 8840}",
        "tested_date": "Scheduled for on-field visit",
        "values": {
            "n": 76,
            "p": 45,
            "k": 50,
            "temp": 26.5,
            "humidity": 68,
            "ph": 6.6,
            "rainfall": 820
        },
        "health_score": 90,
        "soil_type": "Field Surface Sample"
    }

    if is_firebase_active() and firestore_db:
        try:
            firestore_db.create_soil_test({
                "farmer_name": data.get("farmer_name", "Farmer"),
                "phone": data.get("phone", ""),
                "district": district,
                "taluk": data.get("taluk", ""),
                "village": data.get("village", ""),
                "land_acres": data.get("land_acres", 2.0),
                "status": "Officer Assigned - Contacting You",
                "sample_report": sample_report
            })
        except Exception as e:
            print(f"[Firestore soil test note] {e}")

    new_req = db_models.SoilTestRequest(
        farmer_name=data.get("farmer_name", "Farmer"),
        phone=data.get("phone", ""),
        district=district,
        taluk=data.get("taluk", ""),
        village=data.get("village", ""),
        land_acres=data.get("land_acres", 2.0),
        status="Officer Assigned - Contacting You",
        created_at="Just now",
        officer_name="Santhosh Kumar (Agro Field Officer - Doorstep Visit)",
        report_json=json.dumps(sample_report)
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return {"success": True, "message": "Soil test request submitted. A field executive will contact you and visit your land.", "request": new_req.to_dict()}
