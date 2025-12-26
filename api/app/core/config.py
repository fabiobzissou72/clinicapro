from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API
    API_SECRET_KEY: str
    API_ALGORITHM: str = "HS256"
    API_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # OpenAI
    OPENAI_API_KEY: str

    # Claude
    CLAUDE_API_KEY: str = ""

    # WhatsApp Evolution API
    EVOLUTION_API_URL: str
    EVOLUTION_API_KEY: str
    WHATSAPP_INSTANCE_NAME: str

    # Payment Gateways
    MERCADOPAGO_ACCESS_TOKEN: str = ""
    MERCADOPAGO_PUBLIC_KEY: str = ""
    ASAAS_API_KEY: str = ""
    ASAAS_WALLET_ID: str = ""

    # NFe
    NFE_API_KEY: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
