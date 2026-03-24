from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .database import engine, Base
from .auth import users
from .currency import currency
from .logger import setup_logging, log
import time
import traceback

setup_logging(log_level="DEBUG", log_to_file=True, log_to_console=True)

log.info("🚀 Запуск Currency Converter API")

# Создание таблиц
try:
    log.info("🔄 Проверка/создание таблиц базы данных...")
    Base.metadata.create_all(bind=engine)
    log.info("✅ Таблицы созданы/проверены")
except Exception as e:
    log.error(f"❌ Ошибка при создании таблиц: {e}")
    log.error(traceback.format_exc())

app = FastAPI(
    title="Currency Converter API",
    description="API для конвертации валют с JWT аутентификацией",
    version="1.0.0"
)


# Middleware для логирования всех запросов
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Логирование всех входящих запросов"""
    start_time = time.time()

    # Логируем входящий запрос
    log.info(f"➡️ {request.method} {request.url.path} - Начало обработки")

    try:
        response = await call_next(request)

        # Логируем время выполнения
        process_time = time.time() - start_time
        log.info(
            f"⬅️ {request.method} {request.url.path} - "
            f"Статус: {response.status_code} - "
            f"Время: {process_time:.3f}с"
        )

        return response

    except Exception as e:
        log.error(f"❌ Ошибка при обработке {request.method} {request.url.path}: {e}")
        log.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )


# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(users.router)
app.include_router(currency.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Currency Converter API",
        "docs": "/docs",
        "endpoints": {
            "auth": ["/auth/register/", "/auth/login/"],
            "currency": ["/currency/list/", "/currency/exchange/", "/currency/convert/"]
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

log.info("✅ Приложение успешно запущено")