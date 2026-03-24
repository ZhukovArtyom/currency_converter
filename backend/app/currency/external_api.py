import requests
from fastapi import HTTPException
from backend.app.config import settings


def get_exchange_rates(base_currency: str = "USD"):
    """
    Получение текущих курсов валют из внешнего API
    """
    try:
        url = f"{settings.EXCHANGE_API_URL}{base_currency}"

        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"External API error: {str(e)}")


def get_supported_currencies():
    """
    Получение списка поддерживаемых валют
    """
    try:
        data = get_exchange_rates()
        currencies = list(data.get("rates", {}).keys())
        currencies.append(data.get("base"))
        return sorted(currencies)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Could not fetch currencies: {str(e)}")


def convert_currency(from_currency: str, to_currency: str, amount: float = 1.0):
    """
    Конвертация валюты
    """
    try:
        rates_data = get_exchange_rates(from_currency)

        if to_currency not in rates_data.get("rates", {}):
            raise HTTPException(status_code=400, detail=f"Currency {to_currency} not supported")

        rate = rates_data["rates"][to_currency]
        converted_amount = amount * rate

        return {
            "from": from_currency,
            "to": to_currency,
            "amount": amount,
            "converted_amount": round(converted_amount, 2),
            "rate": rate
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion error: {str(e)}")