import re
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import traceback

from backend.app.database import get_db
from backend.app.models import user as models
from backend.app.models.schemas import UserCreate, UserInDB, Token
from backend.app.auth.security import verify_password, get_password_hash, create_access_token
from backend.app.config import settings
from backend.app.logger import log

router = APIRouter(prefix="/auth", tags=["authentication"])


def validate_username(username: str) -> tuple[bool, str]:
    """
    Валидация username.

    Правила:
    - Не пустая строка и не состоит только из пробелов
    - Минимум 6 символов
    - Только буквы, цифры, _ и -
    """
    # Проверка на пустую строку или только пробелы
    if not username or username.strip() == "":
        log.warning(f"⚠️ Ошибка валидации username: пустая строка или только пробелы")
        return False, "Username cannot be empty or consist only of spaces"

    # Проверка минимальной длины
    if len(username) < 6:
        log.warning(f"⚠️ Ошибка валидации username: {username} (слишком короткий)")
        return False, "Username must be at least 6 characters long"

    # Проверка допустимых символов (буквы, цифры, _, -)
    # Разрешаем буквы любого алфавита, цифры, нижнее подчеркивание и дефис
    if not re.match(r'^[a-zA-Z0-9_-]+$', username):
        log.warning(f"⚠️ Ошибка валидации username: {username} (недопустимые символы)")
        return False, "Username can only contain letters, numbers, underscores (_) and hyphens (-)"

    log.debug(f"✅ Username прошел валидацию: {username}")
    return True, "Username is valid"


def validate_password(password: str) -> tuple[bool, str]:
    """
    Валидация пароля.

    Правила:
    - Минимум 8 символов
    - Только буквы, цифры и специальные символы
    - Не пустая строка и не состоит только из пробелов
    - Минимум одна буква
    """
    # Проверка на пустую строку или только пробелы
    if not password or password.strip() == "":
        log.warning(f"⚠️ Ошибка валидации пароля: пустая строка или только пробелы")
        return False, "Password cannot be empty or consist only of spaces"

    # Проверка минимальной длины
    if len(password) < 8:
        log.warning(f"⚠️ Ошибка валидации пароля: слишком короткий (менее 8 символов)")
        return False, "Password must be at least 8 characters long"

    # Проверка наличия хотя бы одной буквы
    if not re.search(r'[a-zA-Z]', password):
        log.warning(f"⚠️ Ошибка валидации пароля: отсутствует буква")
        return False, "Password must contain at least one letter"

    # Проверка допустимых символов (буквы, цифры, спецсимволы)
    # Разрешаем буквы, цифры и распространенные спецсимволы
    if not re.match(r'^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:\'",.<>/?\\|`~]+$', password):
        log.warning(f"⚠️ Ошибка валидации пароля: недопустимые символы")
        return False, "Password contains invalid characters"

    log.debug(f"✅ Пароль прошел валидацию")
    return True, "Password is valid"


@router.post("/register/", response_model=UserInDB)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Регистрация нового пользователя с валидацией.

    Правила валидации:
    - **username**: минимум 6 символов, только буквы, цифры, _ и -
    - **password**: минимум 8 символов, минимум 1 буква и 1 цифра
    """
    log.info(f"📝 Попытка регистрации: username={user.username}")

    try:
        # Валидация username
        is_valid_username, username_error = validate_username(user.username)
        if not is_valid_username:
            log.warning(f"⚠️ Регистрация отклонена: {username_error} для username={user.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid username: {username_error}"
            )

        # Валидация password
        is_valid_password, password_error = validate_password(user.password)
        if not is_valid_password:
            log.warning(f"⚠️ Регистрация отклонена: {password_error} для username={user.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid password: {password_error}"
            )

        # Проверка существования пользователя
        db_user = db.query(models.User).filter(models.User.username == user.username).first()
        if db_user:
            log.warning(f"⚠️ Попытка регистрации с существующим username: {user.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )

        # Хеширование пароля
        hashed_password = get_password_hash(user.password)
        log.debug(f"🔐 Пароль захеширован для {user.username}")

        # Создание пользователя
        db_user = models.User(
            username=user.username,
            hashed_password=hashed_password
        )

        # Сохранение в базу данных
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        log.info(f"✅ Успешная регистрация: user_id={db_user.id}, username={db_user.username}")
        return db_user

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка регистрации {user.username}: {e}")
        log.error(traceback.format_exc())
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration error: {str(e)}"
        )


@router.post("/login/", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Вход в систему и получение JWT токена.

    Возвращает access_token для авторизации в защищенных эндпоинтах.
    """
    log.info(f"🔐 Попытка входа: username={form_data.username}")

    try:
        # Поиск пользователя
        user = db.query(models.User).filter(models.User.username == form_data.username).first()

        # Проверка учетных данных
        if not user or not verify_password(form_data.password, user.hashed_password):
            log.warning(f"⚠️ Неудачная попытка входа: пользователь {form_data.username} не найден или неверный пароль")
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

        log.info(f"✅ Успешный вход: user_id={user.id}, username={user.username}")

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"❌ Ошибка входа {form_data.username}: {e}")
        log.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )