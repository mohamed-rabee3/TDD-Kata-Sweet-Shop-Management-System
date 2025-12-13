# backend/app/schemas.py
from pydantic import BaseModel, EmailStr, ConfigDict # <-- Import ConfigDict

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