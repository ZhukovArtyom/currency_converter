from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.auth import users
from app.currency import currency

# Создание таблиц в базе данных
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Currency Converter API",
    description="API для конвертации валют с JWT аутентификацией",
    version="1.0.0"
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