from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict
from app.core.supabase import supabase_admin

router = APIRouter()

class AutomationRuleCreate(BaseModel):
    name: str
    trigger_type: str
    trigger_time_offset: Optional[int] = None
    channel: str = "whatsapp"
    message_template: str
    webhook_url: Optional[str] = None
    is_active: bool = True

@router.post("/rules")
async def create_automation_rule(rule: AutomationRuleCreate):
    """
    Cria regra de automação
    """
    result = supabase_admin.table("automation_rules").insert(rule.dict()).execute()
    return {"success": True, "rule": result.data[0]}

@router.get("/rules")
async def list_automation_rules(active_only: bool = True):
    """
    Lista regras de automação
    """
    query = supabase_admin.table("automation_rules").select("*")
    if active_only:
        query = query.eq("is_active", True)
    result = query.order("name").execute()
    return {"success": True, "rules": result.data}

@router.get("/rules/{rule_id}")
async def get_automation_rule(rule_id: str):
    result = supabase_admin.table("automation_rules").select("*").eq("id", rule_id).single().execute()
    return {"success": True, "rule": result.data}

@router.patch("/rules/{rule_id}")
async def update_automation_rule(rule_id: str, updates: dict):
    result = supabase_admin.table("automation_rules").update(updates).eq("id", rule_id).execute()
    return {"success": True, "rule": result.data[0]}

@router.delete("/rules/{rule_id}")
async def delete_automation_rule(rule_id: str):
    supabase_admin.table("automation_rules").delete().eq("id", rule_id).execute()
    return {"success": True}

@router.get("/logs")
async def get_automation_logs(rule_id: Optional[str] = None, limit: int = 100):
    """
    Lista logs de automação
    """
    query = supabase_admin.table("automation_logs").select("*, automation_rules(name)")
    if rule_id:
        query = query.eq("rule_id", rule_id)
    result = query.order("created_at", desc=True).limit(limit).execute()
    return {"success": True, "logs": result.data}

@router.post("/test/{rule_id}")
async def test_automation_rule(rule_id: str, test_data: Dict):
    """
    Testa regra de automação
    """
    from app.services.whatsapp_service import whatsapp_service

    rule = supabase_admin.table("automation_rules").select("*").eq("id", rule_id).single().execute()

    if not rule.data:
        return {"success": False, "error": "Rule not found"}

    # Substituir variáveis na mensagem
    message = rule.data["message_template"]
    for key, value in test_data.items():
        message = message.replace(f"{{{key}}}", str(value))

    # Enviar para número de teste
    if test_data.get("phone"):
        result = await whatsapp_service.send_text_message(test_data["phone"], message)
        return {"success": True, "result": result}

    return {"success": True, "message": message}
