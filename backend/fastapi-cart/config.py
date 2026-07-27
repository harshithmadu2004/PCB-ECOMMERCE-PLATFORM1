import os
from pydantic_settings import BaseSettings 
class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("MONGO_DATABASE", "pcb_cart_db")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "shared-jwt-secret-key-pcb-ecommerce-2026")
    ALGORITHM: str = "HS256"

settings = Settings()
