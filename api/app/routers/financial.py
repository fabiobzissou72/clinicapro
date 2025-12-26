from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.core.supabase import supabase_admin

router = APIRouter()

class FinancialCreate(BaseModel):
    type: str
    category: Optional[str] = None
    amount: float
    date: Optional[str] = None
    description: Optional[str] = None
    status: str = "pending"

@router.post("/")
async def create_financial_record(record: FinancialCreate):
    result = supabase_admin.table("financeiro").insert(record.dict()).execute()
    return {"success": True, "record": result.data[0]}

@router.get("/")
async def list_financial_records(
    type: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    query = supabase_admin.table("financeiro").select("*, pacientes(*), agendamentos(*)")
    if type:
        query = query.eq("type", type)
    if status:
        query = query.eq("status", status)
    if start_date:
        query = query.gte("date", start_date)
    if end_date:
        query = query.lte("date", end_date)
    result = query.order("date", desc=True).execute()
    return {"success": True, "records": result.data}

@router.get("/summary")
async def get_financial_summary(month: Optional[str] = None):
    query = supabase_admin.table("financeiro").select("type, amount, status")
    if month:
        query = query.ilike("date", f"{month}%")
    result = query.execute()

    income = sum([r["amount"] for r in result.data if r["type"] == "income" and r["status"] == "paid"])
    expense = sum([r["amount"] for r in result.data if r["type"] == "expense" and r["status"] == "paid"])
    pending = sum([r["amount"] for r in result.data if r["status"] == "pending"])

    return {
        "success": True,
        "summary": {
            "income": income,
            "expense": expense,
            "balance": income - expense,
            "pending": pending
        }
    }
