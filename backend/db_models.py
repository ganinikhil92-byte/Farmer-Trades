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
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True) # 'crop', 'vegetable', 'fruit'

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
        }

class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    category: Mapped[str] = mapped_column(String(50), default="crop", index=True)
    crop_name: Mapped[str] = mapped_column(String(255), nullable=False)
    crop_type: Mapped[str] = mapped_column(String(100), default="")
    quantity_kg: Mapped[float] = mapped_column(Float, nullable=False)
    price_per_kg: Mapped[float] = mapped_column(Float, nullable=False)
    farmer_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "category": self.category,
            "crop_name": self.crop_name,
            "crop_type": self.crop_type,
            "quantity_kg": self.quantity_kg,
            "price_per_kg": self.price_per_kg,
            "farmer_id": self.farmer_id,
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
    farmer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), default="")
    district: Mapped[str] = mapped_column(String(100), default="Mandya")
    taluk: Mapped[str] = mapped_column(String(100), default="")
    village: Mapped[str] = mapped_column(String(100), default="")
    land_acres: Mapped[float] = mapped_column(Float, default=2.0)
    status: Mapped[str] = mapped_column(String(100), default="Officer Assigned - Contacting You")
    created_at: Mapped[str] = mapped_column(String(100), default="Just now")
    officer_name: Mapped[str] = mapped_column(String(255), default="Santhosh Kumar (Agro Field Officer - Doorstep Visit)")
    report_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # JSON serialized report

    def to_dict(self):
        import json
        report = None
        if self.report_json:
            try:
                report = json.loads(self.report_json)
            except Exception:
                pass
        return {
            "id": self.id,
            "farmer_name": self.farmer_name,
            "phone": self.phone,
            "district": self.district,
            "taluk": self.taluk,
            "village": self.village,
            "land_acres": self.land_acres,
            "status": self.status,
            "created_at": self.created_at,
            "officer_name": self.officer_name,
            "report": report,
        }
