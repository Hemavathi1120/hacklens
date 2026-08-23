import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load unified environment variables from backend or project root
_ROOT_DIR = Path(__file__).resolve().parent.parent
_BACKEND_ENV = _ROOT_DIR / "backend" / ".env"
_ROOT_ENV = _ROOT_DIR / ".env"

if _BACKEND_ENV.exists():
    load_dotenv(dotenv_path=_BACKEND_ENV)
if _ROOT_ENV.exists():
    load_dotenv(dotenv_path=_ROOT_ENV)
load_dotenv()

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    # Database Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://nglgwbmukbpmyqrazggm.supabase.co")
    SUPABASE_PUBLISHABLE_KEY: str = os.getenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_6SQuNyEM9zyCB7lcvsYhOw_RZ0kbEv9")
    SUPABASE_SECRET_KEY: str = os.getenv("SUPABASE_SECRET_KEY", "")
    SUPABASE_JWKS_URL: str = os.getenv("SUPABASE_JWKS_URL", "https://nglgwbmukbpmyqrazggm.supabase.co/auth/v1/.well-known/jwks.json")

    # AI & Embeddings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    STORAGE_BUCKET: str = "project-documents"
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()
