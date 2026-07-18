from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import os
import shutil

# Check if running in Vercel serverless environment
IS_VERCEL = "VERCEL" in os.environ or os.environ.get("VERCEL_ENV") is not None

if IS_VERCEL:
    db_path = "/tmp/stadiumops.db"
    # Copy seed database to writable /tmp
    src_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../stadiumops.db"))
    if not os.path.exists(db_path) and os.path.exists(src_path):
        shutil.copy(src_path, db_path)
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"
else:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./stadiumops.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
