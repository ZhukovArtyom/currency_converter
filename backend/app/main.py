from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .auth import users
from .currency import currency
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Currency Converter API",
    description="API для конвертации валют с JWT аутентификацией",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
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