from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate, UserCreate
from app.utils.responses import send_status_response
from app.utils.crypto import hash_password
import re

from app.utils.security import authenticated_admin, not_found_response
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])

@router.post("", response_model=UserOut)
def create_user(
    data: UserCreate, 
    db: Session = Depends(get_db),
    _user: User = Depends(authenticated_admin)
):
    if db.query(User).filter(User.username == data.username).first():
        return send_status_response(
            code="USERNAME_EXISTS",
            message="Username already exists",
            status=400,
            detail=f"User with username {data.username} already exists."
        )
    
    if len(data.password) < 8 \
       or not re.search(r'[A-Z]', data.password) \
       or not re.search(r'[a-z]', data.password) \
       or not re.search(r'[0-9]', data.password):
        return send_status_response(
            code="WEAK_PASSWORD",
            message="Password does not meet complexity requirements",
            status=400,
            detail="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
        )
    data.password = hash_password(data.password)
    
    user = User(**data.dict())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
    
@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _user: User = Depends(authenticated_admin)
):
    return (db.query(User)
            .filter(User.id != _user.id)
            .order_by(User.created_at.desc())
            .all())

@router.delete("/{id}")
def delete_user(
    id: str, 
    db: Session = Depends(get_db),
    _user: User = Depends(authenticated_admin)
):
    user = db.query(User).filter(User.id == id).first()

    if not user: return not_found_response(User, id)
    
    db.delete(user)
    db.commit()
    return {"success": True}

@router.get("/{id}", response_model=UserOut)
def get_user(
    id: str, 
    db: Session = Depends(get_db),
    _user: User = Depends(authenticated_admin)
):
    user = db.query(User).filter(User.id == id).first()

    if not user: return not_found_response(User, id)
    
    return user

@router.put("/{id}", response_model=UserOut)
def update_user(
    id: str, 
    data: UserUpdate, 
    db: Session = Depends(get_db),
    _user: User = Depends(authenticated_admin)
):
    user = db.query(User).filter(User.id == id).first()

    if not user: return not_found_response(User, id)

    data_dict = data.dict(exclude_unset=True)

    raw_password = data_dict.pop("password", None)
    if raw_password:
        user.password = hash_password(raw_password)
        
    for key, value in data_dict.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user
