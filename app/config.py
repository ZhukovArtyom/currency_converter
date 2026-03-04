from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()


class Settings(BaseSettings):
    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "secret-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database Settings
    DATABASE_URL: str = "sqlite:///./currency_converter.db"

    # External API Settings
    EXCHANGE_API_KEY: str = os.getenv("e0f98be44a16fb2b0f1a4ecc")
    EXCHANGE_API_URL: str = "https://api.exchangerate-api.com/v4/latest/"

    class Config:
        env_file = ".env"


settings = Settings()