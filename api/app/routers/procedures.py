from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.core.supabase import supabase_admin

router = APIRouter()

class ProcedureCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    duration: Optional[int] = 60
    price: Optional[float] = 0
    available_for_online_booking: bool = True

@router.get("/")
async def list_procedures(active_only: bool = True):
    query = supabase_admin.table("procedimentos").select("*")
    if active_only:
        query = query.eq("active", True)
    result = query.order("name").execute()
    return {"success": True, "procedures": result.data}

@router.post("/")
async def create_procedure(procedure: ProcedureCreate):
    result = supabase_admin.table("procedimentos").insert(procedure.dict()).execute()
    return {"success": True, "procedure": result.data[0]}

@router.get("/categories")
async def get_categories():
    result = supabase_admin.table("procedimentos").select("category").execute()
    categories = list(set([p["category"] for p in result.data if p.get("category")]))
    return {"success": True, "categories": categories}
