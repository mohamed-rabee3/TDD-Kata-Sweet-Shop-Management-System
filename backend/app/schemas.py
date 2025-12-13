# backend/app/schemas.py
from pydantic import BaseModel, EmailStr, ConfigDict # <-- Import ConfigDict
from typing import Optional
# Base schema for shared data
class UserBase(BaseModel):
    email: EmailStr

# Schema for receiving data (Registration)
class UserCreate(UserBase):
    password: str

# Schema for returning data (Reading)
class UserResponse(UserBase):
    id: int
    is_active: bool
    # We DO NOT include password here
    model_config = ConfigDict(from_attributes=True)

    # class Config:
    #     from_attributes = True # Allows Pydantic to read from SQLAlchemy models


# Add to backend/app/schemas.py

class Token(BaseModel):
    access_token: str
    token_type: str



# --- SWEET SCHEMAS ---

class SweetBase(BaseModel):
    name: str
    category: str
    price: float
    quantity: int
    image_url: Optional[str] = None

class SweetCreate(SweetBase):
    pass

class SweetUpdate(BaseModel):
    # All fields optional for updates
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    image_url: Optional[str] = None

class SweetResponse(SweetBase):
    id: int

    model_config = ConfigDict(from_attributes=True)