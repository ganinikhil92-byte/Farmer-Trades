from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float, Text, DateTime
from database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False) # 'admin', 'farmer', 'buyer'
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    taluk: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    village: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Verified") # 'Verified', 'Pending', 'Suspended'
    registered_at: Mapped[str] = mapped_column(String(50), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "district": self.district,
            "taluk": self.taluk,
            "village": self.village,
            "pincode": self.pincode,
            "phone": self.phone,
            "status": self.status,
            "registeredAt": self.registered_at,
        }

class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True) # 'crop', 'vegetable', 'fruit', or category_id
    category_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    name_kn: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    varieties: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # JSON list of varieties
    is_active: Mapped[int] = mapped_column(Integer, default=1)

    def to_dict(self):
        import json
        vars_list = []
        if self.varieties:
            try:
                vars_list = json.loads(self.varieties)
            except Exception:
                vars_list = [v.strip() for v in self.varieties.split(",") if v.strip()]
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "category_id": self.category_id or self.category,
            "name_kn": self.name_kn or "",
            "varieties": vars_list,
            "is_active": bool(self.is_active),
        }

class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    category: Mapped[str] = mapped_column(String(50), default="CEREALS_MILLETS", index=True)
    category_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    produce_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    crop_name: Mapped[str] = mapped_column(String(255), nullable=False)
    crop_type: Mapped[str] = mapped_column(String(100), default="")
    produce_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    produce_name_kn: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    variety: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    quantity_kg: Mapped[float] = mapped_column(Float, nullable=False)
    price_per_kg: Mapped[float] = mapped_column(Float, nullable=False)
    farmer_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        cat_id = self.category_id or self.category or "CEREALS_MILLETS"
        p_name = self.produce_name or self.crop_name
        var = self.variety or self.crop_type or ""
        return {
            "id": self.id,
            "category": self.category,
            "category_id": cat_id,
            "produce_id": self.produce_id or "",
            "crop_name": self.crop_name,
            "crop_type": self.crop_type,
            "produce_name": p_name,
            "produce_name_kn": self.produce_name_kn or "",
            "variety": var,
            "quantity_kg": self.quantity_kg,
            "price_per_kg": self.price_per_kg,
            "farmer_id": self.farmer_id,
            "image_url": self.image_url,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
        }

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    listing_id: Mapped[int] = mapped_column(Integer, nullable=False)
    buyer_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    crop_name: Mapped[str] = mapped_column(String(255), default="")
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Confirmed")
    payment_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "listing_id": self.listing_id,
            "buyer_id": self.buyer_id,
            "crop_name": self.crop_name,
            "quantity": self.quantity,
            "total_price": self.total_price,
            "status": self.status,
            "payment_id": self.payment_id or "",
            "image_url": self.image_url or "",
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else "",
        }

class SupportQuery(Base):
    __tablename__ = "queries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), default="Anonymous")
    email: Mapped[str] = mapped_column(String(255), default="")
    message: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="Pending")
    created_at: Mapped[str] = mapped_column(String(100), default="Just now")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at,
        }

class SoilTestRequest(Base):
    __tablename__ = "soil_test_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    farmer_id: Mapped[str] = mapped_column(String(255), default="", index=True)
    farmer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), default="")
    district: Mapped[str] = mapped_column(String(100), default="Mandya")
    taluk: Mapped[str] = mapped_column(String(100), default="")
    village: Mapped[str] = mapped_column(String(255), default="")
    field_name: Mapped[str] = mapped_column(String(255), default="")
    land_acres: Mapped[float] = mapped_column(Float, default=1.0)
    land_unit: Mapped[str] = mapped_column(String(50), default="Acres")
    preferred_date: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(100), default="Submitted")
    created_at: Mapped[str] = mapped_column(String(100), default="")

    # Provider & Appointment fields (Admin managed)
    provider_name: Mapped[str] = mapped_column(String(255), default="")
    provider_contact: Mapped[str] = mapped_column(String(100), default="")
    officer_name: Mapped[str] = mapped_column(String(255), default="")
    officer_phone: Mapped[str] = mapped_column(String(100), default="")
    appointment_date: Mapped[str] = mapped_column(String(50), default="")
    appointment_time: Mapped[str] = mapped_column(String(50), default="")
    sample_id: Mapped[str] = mapped_column(String(100), default="")
    sample_collected_date: Mapped[str] = mapped_column(String(50), default="")
    rejection_reason: Mapped[str] = mapped_column(Text, default="")

    # Reports & Attachments
    report_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # JSON serialized report
    attachment_filename: Mapped[str] = mapped_column(String(255), default="")
    attachment_path: Mapped[str] = mapped_column(String(255), default="")
    is_farmer_upload: Mapped[int] = mapped_column(Integer, default=0)
    review_status: Mapped[str] = mapped_column(String(100), default="")
    reviewer_name: Mapped[str] = mapped_column(String(255), default="")
    review_date: Mapped[str] = mapped_column(String(50), default="")

    # Payment details (Razorpay ₹1,000 fixed fee: ₹500 soil test + ₹500 results)
    payment_id: Mapped[str] = mapped_column(String(100), default="")
    payment_status: Mapped[str] = mapped_column(String(50), default="Pending")
    payment_amount: Mapped[float] = mapped_column(Float, default=1000.0)
    razorpay_order_id: Mapped[str] = mapped_column(String(255), default="")
    razorpay_payment_id: Mapped[str] = mapped_column(String(255), default="")
    razorpay_signature: Mapped[str] = mapped_column(String(255), default="")

    def get_canonical_status(self) -> str:
        import json
        s = (self.status or "").strip()
        valid = {"Submitted", "Accepted", "Rejected", "Scheduled", "Sample Collected", "Testing in Progress", "Report Available", "Cancelled"}
        if s in valid:
            return s
        # Map legacy statuses without losing information
        s_lower = s.lower()
        if s_lower in ("pending", "submitted"):
            return "Submitted"
        if s_lower in ("accepted", "approved"):
            return "Accepted"
        if s_lower == "rejected":
            return "Rejected"
        if s_lower == "cancelled":
            return "Cancelled"
        if s_lower == "scheduled":
            return "Scheduled"
        if "officer assigned" in s_lower:
            return "Scheduled" if self.appointment_date else "Accepted"
        if s_lower == "completed":
            if self.report_json:
                try:
                    rep = json.loads(self.report_json)
                    if rep and (rep.get("parameters_12") or rep.get("parameters") or rep.get("tested_date")):
                        return "Report Available"
                except Exception:
                    pass
            return "Testing in Progress"
        return "Submitted"

    def to_dict(self):
        import json
        report = None
        if self.report_json:
            try:
                report = json.loads(self.report_json)
            except Exception:
                pass

        disp_provider = (self.provider_name or "").strip()
        if not disp_provider and self.officer_name and "Doorstep Visit" not in self.officer_name:
            disp_provider = self.officer_name.strip()

        disp_contact = (self.provider_contact or "").strip()
        if not disp_contact and self.officer_phone and "Official" not in self.officer_phone:
            disp_contact = self.officer_phone.strip()

        canonical_status = self.get_canonical_status()

        return {
            "id": self.id,
            "request_ref": f"STR-{self.id:04d}",
            "farmer_id": self.farmer_id,
            "farmer_name": self.farmer_name,
            "phone": self.phone,
            "district": self.district,
            "taluk": self.taluk,
            "village": self.village,
            "field_name": self.field_name or "Main Plot",
            "land_acres": self.land_acres,
            "land_unit": self.land_unit or "Acres",
            "preferred_date": self.preferred_date,
            "status": canonical_status,
            "raw_status": self.status,
            "created_at": self.created_at,
            "provider_name": disp_provider or "Not assigned",
            "provider_contact": disp_contact or "Not assigned",
            "appointment_date": self.appointment_date or "Not confirmed",
            "appointment_time": self.appointment_time,
            "sample_id": self.sample_id,
            "sample_collected_date": self.sample_collected_date,
            "rejection_reason": self.rejection_reason,
            "has_attachment": bool(self.attachment_path),
            "attachment_filename": self.attachment_filename,
            "is_farmer_upload": bool(self.is_farmer_upload),
            "review_status": self.review_status,
            "reviewer_name": self.reviewer_name,
            "review_date": self.review_date,
            "report": report,
            "payment_id": self.payment_id or "",
            "payment_status": self.payment_status or "Pending",
            "payment_amount": self.payment_amount if self.payment_amount is not None else 1000.0,
            "fee_breakdown": {
                "soil_test": 500.0,
                "results": 500.0,
                "total": 1000.0,
            },
            "razorpay_order_id": self.razorpay_order_id or "",
            "razorpay_payment_id": self.razorpay_payment_id or "",
            "razorpay_signature": self.razorpay_signature or "",
        }


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    email: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    otp: Mapped[str] = mapped_column(String(10), nullable=False)
    expires_at: Mapped[float] = mapped_column(Float, nullable=False)
    verified: Mapped[int] = mapped_column(Integer, default=0)


class FarmerSubscription(Base):
    __tablename__ = "farmer_subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    farmer_id: Mapped[str] = mapped_column(String(255), index=True, nullable=False) # farmer's email
    farmer_name: Mapped[str] = mapped_column(String(255), default="")
    farmer_phone: Mapped[str] = mapped_column(String(50), default="")
    plan_tier: Mapped[str] = mapped_column(String(50), default="1_YEAR") # '1_YEAR', '3_YEAR', '5_YEAR'
    duration_years: Mapped[int] = mapped_column(Integer, default=1)
    amount_paid: Mapped[float] = mapped_column(Float, default=500.0)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE") # 'ACTIVE', 'EXPIRED'
    start_date: Mapped[str] = mapped_column(String(50), default="")
    end_date: Mapped[str] = mapped_column(String(50), default="")
    payment_id: Mapped[str] = mapped_column(String(100), default="")
    razorpay_order_id: Mapped[str] = mapped_column(String(255), default="")
    razorpay_payment_id: Mapped[str] = mapped_column(String(255), default="")
    razorpay_signature: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[str] = mapped_column(String(100), default="")

    def to_dict(self):
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        is_active = self.status == "ACTIVE" and (self.end_date >= today_str if self.end_date else True)
        days_remaining = 0
        if self.end_date:
            try:
                end_dt = datetime.strptime(self.end_date, "%Y-%m-%d")
                curr_dt = datetime.utcnow()
                days_remaining = max(0, (end_dt.date() - curr_dt.date()).days)
            except Exception:
                pass

        plan_labels = {
            "1_YEAR": "1 Year Pass (₹500)",
            "3_YEAR": "3 Years Pass (₹1,300)",
            "5_YEAR": "5 Years Pass (₹2,000)"
        }

        return {
            "id": self.id,
            "farmer_id": self.farmer_id,
            "farmer_name": self.farmer_name,
            "farmer_phone": self.farmer_phone,
            "plan_tier": self.plan_tier,
            "plan_label": plan_labels.get(self.plan_tier, f"{self.duration_years} Year Pass"),
            "duration_years": self.duration_years,
            "amount_paid": self.amount_paid,
            "status": "ACTIVE" if is_active else "EXPIRED",
            "start_date": self.start_date,
            "end_date": self.end_date,
            "days_remaining": days_remaining,
            "payment_id": self.payment_id or self.razorpay_payment_id or "",
            "razorpay_order_id": self.razorpay_order_id or "",
            "razorpay_payment_id": self.razorpay_payment_id or "",
            "created_at": self.created_at,
            "is_active": is_active,
        }

