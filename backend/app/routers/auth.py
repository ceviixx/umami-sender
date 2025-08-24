from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.database import get_db
from app.models.user import User
import os

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

def authenticate_user(db: Session, username: str, password: str) -> User | None:
    user = db.query(User).filter(User.username == username).first()
    if user and pwd_context.verify(password, user.password):
        return user
    return None

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.username, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": str(user.id)})

    if user.is_initial_password: 
        refresh_token = 'CHANGE_ME'
    else: 
        refresh_token = create_refresh_token({"sub": str(user.id)})


    return {
        "account": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "language": user.language,
            "createdAt": user.created_at.isoformat() if user.created_at else None
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
    }

@router.post("/refresh")
def refresh_token(request: Request):
    try:
        token = request.headers.get("Authorization")
        if not token or not token.startswith("Bearer "):
            raise ValueError("Missing refresh token")
        refresh_token = token.split(" ")[1]
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Invalid token: missing subject")

        new_access_token = create_access_token({"sub": str(user_id)})
        return {"access_token": new_access_token}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Refresh failed: {str(e)}")


from app.utils.security import authenticated_user
from app.models.user import User

@router.get("/verify")
def login(
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "language": user.language,
        "createdAt": user.created_at.isoformat() if user.created_at else None
    }