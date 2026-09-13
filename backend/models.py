from pydantic import BaseModel
from typing import Optional, List

class Item(BaseModel):
    id: Optional[int] = None
    name: str

class Listing(BaseModel):
    id: Optional[int] = None
    category: str = "crop"
    crop_name: str
    crop_type: str = ""
    quantity_kg: float
    price_per_kg: float
    farmer_id: str

class PredictionRequest(BaseModel):
    features: List[float]

class Order(BaseModel):
    id: Optional[int] = None
    listing_id: int
    buyer_id: str
    crop_name: str = ""
    quantity: float
    total_price: float
