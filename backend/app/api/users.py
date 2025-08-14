from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate, UserCreate
from app.utils.responses import send_status_response

from app.utils.security import Security
from app.utils.crypto import hash_password
import re

router = APIRouter(prefix="/users", tags=["users"])

@router.post("", response_model=UserOut)
def create_user(request: Request, data: UserCreate, db: Session = Depends(get_db)):
    user = Security(request).get_user()

    if user.role != "admin":
        return send_status_response(
            code="FORBIDDEN",
            message="You do not have permission to create users.",
            status=403,
            detail="Only admin users can create new users."
        )
    
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
def list_users(request: Request, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    
    if user.role != "admin":
        return send_status_response(
            code="FORBIDDEN",
            message="You do not have permission to view users.",
            status=403,
            detail="Only admin users can view the list of users."
        )
    
    return (db.query(User)
            .filter(User.id != user.id)
            .order_by(User.created_at.desc())
            .all())

@router.delete("/{user_id}")
def delete_user(request: Request, user_id: str, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    
    if user.role != "admin":
        return send_status_response(
            code="FORBIDDEN",
            message="You do not have permission to delete users.",
            status=403,
            detail="Only admin users can delete other users."
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return send_status_response(
            code="DELETE_FAILED",
            message="Cannot delete: user not found",
            status=404,
            detail=f"User with id {user_id} does not exist."
        )
    
    db.delete(user)
    db.commit()
    return {"success": True}

@router.get("/{user_id}", response_model=UserOut)
def get_user(request: Request, user_id: str, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    
    if user.role != "admin":
        return send_status_response(
            code="FORBIDDEN",
            message="You do not have permission to view this user.",
            status=403,
            detail="Only admin users can view other users' details."
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return send_status_response(
            code="NOT_FOUND",
            message="User not found",
            status=404,
            detail=f"No user with id {user_id} exists."
        )
    
    return user

@router.put("/{user_id}", response_model=UserOut)
def update_user(request: Request, user_id: str, data: UserUpdate, db: Session = Depends(get_db)):
    me = Security(request).get_user()

    if me.role != "admin":
        return send_status_response(
            code="FORBIDDEN",
            message="You do not have permission to update users.",
            status=403,
            detail="Only admin users can update other users."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return send_status_response(
            code="UPDATE_FAILED",
            message="Cannot update: user not found",
            status=404,
            detail=f"User with id {user_id} does not exist."
        )

    data_dict = data.dict(exclude_unset=True)

    raw_password = data_dict.pop("password", None)
    if raw_password:
        user.password = hash_password(raw_password)
        
    for key, value in data_dict.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user
