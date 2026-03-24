from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.auth.security import get_current_user
from backend.app.models.user import User
from backend.app.models.schemas import CurrencyConversion
from backend.app.currency.external_api import get_exchange_rates, get_supported_currencies, convert_currency
from backend.app.logger import log
import traceback

router = APIRouter(prefix="/currency", tags=["currency"])


@router.get("/list/")
async def get_currencies(current_user: User = Depends(get_current_user)):
    """
    Получение списка поддерживаемых валют
    """
    log.info(f"💰 Запрос списка валют: user={current_user.username}")

    try:
        currencies = get_supported_currencies()

        log.debug(f"✅ Получен список валют: {len(currencies)} валют")

        return {
            "supported_currencies": currencies,
            "count": len(currencies)
        }

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка получения списка валют: {e}")
        log.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error getting currencies: {str(e)}")


@router.get("/exchange/")
async def get_exchange_rates_endpoint(
        base: str = Query("USD", description="Базовая валюта"),
        current_user: User = Depends(get_current_user)
):
    """
    Получение текущих курсов обмена
    """
    log.info(f"📊 Запрос курсов валют: user={current_user.username}, base={base}")

    try:
        rates = get_exchange_rates(base)

        log.debug(f"✅ Получены курсы валют для {base}: {len(rates.get('rates', {}))} курсов")

        return rates

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка получения курсов валют (base={base}): {e}")
        log.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/convert/")
async def convert_currency_endpoint(
        conversion: CurrencyConversion,
        current_user: User = Depends(get_current_user)
):
    """
    Конвертация валюты
    """
    log.info(
        f"💱 Конвертация: user={current_user.username}, "
        f"{conversion.amount} {conversion.from_currency.upper()} -> {conversion.to_currency.upper()}"
    )

    try:
        result = convert_currency(
            conversion.from_currency.upper(),
            conversion.to_currency.upper(),
            conversion.amount
        )

        log.debug(
            f"✅ Результат конвертации: {result['converted_amount']} {result['to']}, "
            f"курс: {result['rate']}"
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка конвертации: {e}")
        log.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Conversion error: {str(e)}")