from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserOut, UserUpdate, UserPasswordUpdate
from app.models.user import User
from app.utils.responses import send_status_response
from app.utils.crypto import verify_password, hash_password
import re
from app.utils.security import Security

router = APIRouter(prefix="/me", tags=["me"])

@router.get("", response_model=UserOut)
def get_me(request: Request, db: Session = Depends(get_db)):
    user = Security(request).get_user()
    return db.query(User).filter(User.id == user.id).first()

@router.put("", response_model=UserOut)
def update_me(request: Request, data: UserUpdate, db: Session = Depends(get_db)):
    user = Security(request).get_user()

    me = db.query(User).filter(User.id == user.id).first()

    if not me:
        return send_status_response(
            code="UPDATE_FAILED",
            message="Cannot update: User not found",
            status=404,
            detail=f"User with id {user.id} does not exist."
        )
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(me, key, value)
    db.commit()
    db.refresh(me)
    return me

@router.put("/password")
def update_password(request: Request, data: UserPasswordUpdate, db: Session = Depends(get_db)):
    user = Security(request).get_user()

    if user is None:
        return send_status_response(
            code="NOT_AUTHENTICATED",
            message="Authentication required",
            status=401,
            detail="No valid user session found."
        )

    if data.newPassword != data.confirmPassword:
        return send_status_response(
            code="PASSWORD_MISMATCH",
            message="New password and confirmation do not match",
            status=400,
            detail="The new password and confirmation password must match."
        )
    
    if not verify_password(data.currentPassword, user.password):
        return send_status_response(
            code="INVALID_PASSWORD",
            message="Current password is incorrect",
            status=400,
            detail="The provided current password does not match our records."
        )

    password = data.newPassword
    if len(password) < 8 \
       or not re.search(r'[A-Z]', password) \
       or not re.search(r'[a-z]', password) \
       or not re.search(r'[0-9]', password):
        return send_status_response(
            code="WEAK_PASSWORD",
            message="New password does not meet complexity requirements",
            status=400,
            detail="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
        )

    user.password = hash_password(data.newPassword)
    user.is_initial_password = False
    db.add(user)
    db.commit()

    return {"success": True}