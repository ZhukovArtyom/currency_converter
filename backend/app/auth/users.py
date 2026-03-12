import re
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from backend.app.database import get_db
from backend.app.models import user as models
from backend.app.models.schemas import UserCreate, UserInDB, Token
from backend.app.auth.security import verify_password, get_password_hash, create_access_token
from backend.app.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])


def validate_username(username: str) -> tuple[bool, str]:

    # Проверка на пустую строку или только пробелы
    if not username or username.strip() == "":
        return False, "Username cannot be empty or consist only of spaces"

    # Проверка минимальной длины
    if len(username) < 6:
        return False, "Username must be at least 6 characters long"

    # Проверка допустимых символов (буквы, цифры, _, -)
    # Разрешаем буквы любого алфавита, цифры, нижнее подчеркивание и дефис
    if not re.match(r'^[a-zA-Z0-9_-]+$', username):
        return False, "Username can only contain letters, numbers, underscores (_) and hyphens (-)"

    return True, "Username is valid"


def validate_password(password: str) -> tuple[bool, str]:
    """
    Валидация пароля.

    Правила:
    - Минимум 8 символов
    - Только буквы, цифры и специальные символы
    - Не пустая строка и не состоит только из пробелов
    """
    # Проверка на пустую строку или только пробелы
    if not password or password.strip() == "":
        return False, "Password cannot be empty or consist only of spaces"

    # Проверка минимальной длины
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    # Проверка наличия хотя бы одной буквы и одной цифры (опционально)
    # Можно добавить для усиления безопасности
    if not re.search(r'[a-zA-Z]', password):
        return False, "Password must contain at least one letter"


    # Проверка допустимых символов (буквы, цифры, спецсимволы)
    # Разрешаем буквы, цифры и распространенные спецсимволы
    if not re.match(r'^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:\'",.<>/?\\|`~]+$', password):
        return False, "Password contains invalid characters"

    return True, "Password is valid"


@router.post("/register/", response_model=UserInDB)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Регистрация нового пользователя с валидацией.

    Правила валидации:
    - **username**: минимум 6 символов, только буквы, цифры, _ и -
    - **password**: минимум 8 символов, минимум 1 буква и 1 цифра
    """
    # Валидация username
    is_valid_username, username_error = validate_username(user.username)
    if not is_valid_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid username: {username_error}"
        )

    # Валидация password
    is_valid_password, password_error = validate_password(user.password)
    if not is_valid_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid password: {password_error}"
        )

    # Проверка существования пользователя
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Хеширование пароля
    hashed_password = get_password_hash(user.password)

    # Создание пользователя
    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password
    )

    # Сохранение в базу данных
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@router.post("/login/", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Вход в систему и получение JWT токена.

    Возвращает access_token для авторизации в защищенных эндпоинтах.
    """
    # Поиск пользователя
    user = db.query(models.User).filter(models.User.username == form_data.username).first()

    # Проверка учетных данных
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Создание токена
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }