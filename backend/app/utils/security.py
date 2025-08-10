from fastapi import Request, HTTPException
from jose import jwt, JWTError
from app.database import SessionLocal
from app.models.user import User
import os

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret")
ALGORITHM = "HS256"


class Security:
    def __init__(self, request: Request):
        self.request = request
        self._user = None

    def _get_token(self) -> str:
        """Extrahiert Bearer Token aus dem Authorization-Header."""
        auth_header = self.request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

        return auth_header.split(" ")[1]

    def _decode_token(self) -> dict:
        """Dekodiert JWT und validiert es."""
        token = self._get_token()
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

    def get_user_id(self) -> str:
        """Gibt die user_id aus dem JWT zurück."""
        payload = self._decode_token()
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token missing subject")
        return user_id

    def get_user(self) -> User:
        """Lädt den vollständigen User aus der DB."""
        if self._user:
            return self._user

        user_id = self.get_user_id()
        db = SessionLocal()
        user = db.query(User).filter(User.id == user_id).first()
        db.close()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        self._user = user
        return user
