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

    if not username or username.strip() == "":
        return False, "Username cannot be empty or consist only of spaces"

    if len(username) < 6:
        return False, "Username must be at least 6 characters long"

    if not re.match(r'^[a-zA-Z0-9_-]+$', username):
        return False, "Username can only contain letters, numbers, underscores (_) and hyphens (-)"

    return True, "Username is valid"


def validate_password(password: str) -> tuple[bool, str]:

    if not password or password.strip() == "":
        return False, "Password cannot be empty or consist only of spaces"


    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not re.search(r'[a-zA-Z]', password):
        return False, "Password must contain at least one letter"


    if not re.match(r'^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:\'",.<>/?\\|`~]+$', password):
        return False, "Password contains invalid characters"

    return True, "Password is valid"


@router.post("/register/", response_model=UserInDB)
def register_user(user: UserCreate, db: Session = Depends(get_db)):

    is_valid_username, username_error = validate_username(user.username)
    if not is_valid_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid username: {username_error}"
        )


    is_valid_password, password_error = validate_password(user.password)
    if not is_valid_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid password: {password_error}"
        )

    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )


    hashed_password = get_password_hash(user.password)

    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@router.post("/login/", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user = db.query(models.User).filter(models.User.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }