from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class UserInDB(UserBase):
    id: int
    created_at: Optional[datetime] = None  # Изменено с str на datetime

    model_config = ConfigDict(from_attributes=True)  # Важно! Позволяет работать с SQLAlchemy моделями


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class CurrencyConversion(BaseModel):
    from_currency: str
    to_currency: str
    amount: float = 1.0


class CurrencyResponse(BaseModel):
    base: str
    rates: dict
    date: str