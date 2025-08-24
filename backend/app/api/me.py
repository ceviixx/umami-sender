from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserOut, UserUpdate, UserPasswordUpdate
from app.models.user import User
from app.utils.responses import send_status_response
from app.utils.crypto import verify_password, hash_password
import re

from app.utils.security import authenticated_user, ensure_is_owner, not_found_response
from app.models.user import User

router = APIRouter(prefix="/me", tags=["me"])

@router.get("", response_model=UserOut)
def get_me(
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    return db.query(User).filter(User.id == user.id).first()

@router.put("", response_model=UserOut)
def update_me(
    data: UserUpdate, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
    me = db.query(User).filter(User.id == user.id).first()

    if not me: return not_found_response(User, id)
    
    ensure_is_owner(user.id, me)
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(me, key, value)
    db.commit()
    db.refresh(me)
    return me

@router.put("/password")
def update_password(
    data: UserPasswordUpdate, 
    db: Session = Depends(get_db),
    user: User = Depends(authenticated_user)
):
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