from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.auth.security import get_current_user
from app.models.user import User
from app.models.schemas import CurrencyConversion
from app.currency.external_api import get_exchange_rates, get_supported_currencies, convert_currency

router = APIRouter(prefix="/currency", tags=["currency"])

@router.get("/list/")
async def get_currencies(current_user: User = Depends(get_current_user)):
    """
    Получение списка поддерживаемых валют
    """
    currencies = get_supported_currencies()
    return {
        "supported_currencies": currencies,
        "count": len(currencies)
    }

@router.get("/exchange/")
async def get_exchange_rates_endpoint(
    base: str = Query("USD", description="Базовая валюта"),
    current_user: User = Depends(get_current_user)
):
    """
    Получение текущих курсов обмена
    """
    try:
        rates = get_exchange_rates(base)
        return rates
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/convert/")
async def convert_currency_endpoint(
    conversion: CurrencyConversion,
    current_user: User = Depends(get_current_user)
):
    """
    Конвертация валюты
    """
    result = convert_currency(
        conversion.from_currency.upper(),
        conversion.to_currency.upper(),
        conversion.amount
    )
    return result