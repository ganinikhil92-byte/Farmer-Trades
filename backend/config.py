"""
Farmer Trades — Central Configuration & Security Settings
Reads all sensitive credentials and security parameters from backend/.env.
"""

import os
from typing import Optional
from dotenv import load_dotenv

# Explicitly load backend/.env using absolute path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DOTENV_PATH = os.path.join(BACKEND_DIR, ".env")
load_dotenv(dotenv_path=DOTENV_PATH, override=True)


class Settings:
    # Environment & Server
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development").strip()
    PORT: int = int(os.getenv("PORT", "8000"))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BACKEND_DIR, 'agro_trades.db')}").strip()

    # JWT Authentication & Session Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "c8d92f7a4e61b3058a90d81e345fc219760a5d4e1293b745f62089c1e7a3b4d2").strip()
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256").strip()
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))

    # Razorpay Payment Gateway
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "").strip()
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "").strip()

    # SMTP Real Email OTP Delivery
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "").strip()
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "").strip()
    SMTP_FROM: str = os.getenv("SMTP_FROM", "Karnataka Agro Trades <nikhilgani987@gmail.com>").strip()

    # AI & LLM APIs
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "").strip()
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()

    # Firebase Admin SDK Credentials
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "farmers-trades").strip()
    FIREBASE_SERVICE_ACCOUNT_KEY: str = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY", "firebase-key.json").strip()

    # Initial Admin Seed
    ADMIN_INITIAL_EMAIL: str = os.getenv("ADMIN_INITIAL_EMAIL", "nikhilgani987@gmail.com").strip()
    ADMIN_INITIAL_PASSWORD: str = os.getenv("ADMIN_INITIAL_PASSWORD", "Nikhil@2005").strip()

    def get_firebase_cred_path(self) -> Optional[str]:
        """Resolves the service account JSON key file path."""
        if not self.FIREBASE_SERVICE_ACCOUNT_KEY:
            return None
        candidate = os.path.join(BACKEND_DIR, self.FIREBASE_SERVICE_ACCOUNT_KEY)
        if os.path.exists(candidate):
            return candidate
        if os.path.exists(self.FIREBASE_SERVICE_ACCOUNT_KEY):
            return self.FIREBASE_SERVICE_ACCOUNT_KEY
        return None


settings = Settings()

