from jose import jwt, JWTError
from app.database import SessionLocal
from app.models.user import User
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.responses import send_status_response
import os

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret")
ALGORITHM = "HS256"


_bearer = HTTPBearer(auto_error=True)

def _decode(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

# --- Basis-Dependencies ------------------------------------------------------

def authenticated_user(
    creds: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    payload = _decode(creds.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing subject")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def authenticated_admin(user: User = Depends(authenticated_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user

# --- Permission checks (depending on owner_id and role) -----------------------

def ensure_is_owner(owner_id: str | int, user: User) -> None:
    if str(user.id) != str(owner_id):
        raise HTTPException(status_code=403, detail="Forbidden (owner only)")

def ensure_is_admin(user: User) -> None:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden (admin only)")

def ensure_is_owner_or_admin(owner_id: str | int, user: User) -> None:
    if user.role == "admin":
        return
    if str(user.id) != str(owner_id):
        raise HTTPException(status_code=403, detail="Forbidden (owner or admin)")
    

# --- 404 Helper (Custom Response) --------------------------------------------

def not_found_response(model, object_id: str | int, *, action: str | None = None, code: str | None = None):
    if model is None:
        model_name = "Resource"
    else:
        if isinstance(model, type):
            model_name = model.__name__
        else:
            model_name = type(model).__name__

    code_val = code or (f"{action.upper()}_FAILED" if action else "NOT_FOUND")

    if action:
        message = f"Cannot {action}: {model_name} not found"
    else:
        message = f"{model_name} not found"

    return send_status_response(
        code=code_val,
        message=message,
        status=404,
        detail=f"{model_name} with id {object_id} does not exist.",
    )

def load_user_from_token(token: str, db: Session) -> User:
    payload = _decode(token)
    user_id = payload.get("sub") or payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing subject")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user