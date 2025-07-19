from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 🔐 Datenbank-URL aus Umgebungsvariable oder Default (für Entwicklung)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@db:5432/umamisender")

# 🚀 Engine erstellen
engine = create_engine(DATABASE_URL)

# 🧠 Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 🧬 Base-Klasse für Models
Base = declarative_base()


# Optional: Dependency für FastAPI-Routen
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
