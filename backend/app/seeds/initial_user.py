from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
import bcrypt

def seed_admin_user():
    db: Session = SessionLocal()

    user_count = db.query(User).count()
    if user_count == 0:
        hashed_password = bcrypt.hashpw("sender".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        admin = User(
            username="admin",
            password=hashed_password,
            role="admin",
        )
        db.add(admin)
        db.commit()
        
    db.close()

if __name__ == "__main__":
    seed_admin_user()
