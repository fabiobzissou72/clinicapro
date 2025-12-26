from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict
from app.core.supabase import supabase_admin

router = APIRouter()

class IntegrationCreate(BaseModel):
    name: str
    type: str
    provider: Optional[str] = None
    credentials: Dict
    settings: Optional[Dict] = None
    is_active: bool = False

class APIKeyCreate(BaseModel):
    name: str
    service: str
    api_key: str
    api_secret: Optional[str] = None
    additional_config: Optional[Dict] = None

@router.post("/")
async def create_integration(integration: IntegrationCreate):
    """
    Cria nova integração
    """
    result = supabase_admin.table("integrations").insert(integration.dict()).execute()
    return {"success": True, "integration": result.data[0]}

@router.get("/")
async def list_integrations(type: Optional[str] = None):
    """
    Lista integrações configuradas
    """
    query = supabase_admin.table("integrations").select("id, name, type, provider, is_active, last_sync")
    if type:
        query = query.eq("type", type)
    result = query.order("name").execute()
    return {"success": True, "integrations": result.data}

@router.patch("/{integration_id}/toggle")
async def toggle_integration(integration_id: str):
    """
    Ativa/desativa integração
    """
    integration = supabase_admin.table("integrations").select("is_active").eq("id", integration_id).single().execute()
    new_status = not integration.data["is_active"]

    result = supabase_admin.table("integrations").update({"is_active": new_status}).eq("id", integration_id).execute()
    return {"success": True, "is_active": new_status}

@router.post("/api-keys")
async def save_api_key(api_key: APIKeyCreate):
    """
    Salva chave de API
    """
    result = supabase_admin.table("api_keys").insert(api_key.dict()).execute()
    return {"success": True, "api_key": result.data[0]}

@router.get("/api-keys")
async def list_api_keys():
    """
    Lista chaves de API configuradas (sem expor as chaves)
    """
    result = supabase_admin.table("api_keys").select("id, name, service, is_active, usage_count, expires_at").execute()
    return {"success": True, "api_keys": result.data}

@router.get("/api-keys/{service}")
async def get_api_key_by_service(service: str):
    """
    Busca chave de API por serviço
    """
    result = supabase_admin.table("api_keys")\
        .select("*")\
        .eq("service", service)\
        .eq("is_active", True)\
        .single()\
        .execute()
    return {"success": True, "api_key": result.data}
