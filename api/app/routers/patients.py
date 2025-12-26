from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.supabase import supabase_admin

router = APIRouter()

class PatientCreate(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    cpf: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    observations: Optional[str] = None

@router.post("/")
async def create_patient(patient: PatientCreate):
    result = supabase_admin.table("pacientes").insert(patient.dict()).execute()
    return {"success": True, "patient": result.data[0]}

@router.get("/")
async def list_patients(search: Optional[str] = None):
    query = supabase_admin.table("pacientes").select("*")
    if search:
        query = query.or_(f"full_name.ilike.%{search}%,cpf.ilike.%{search}%,phone.ilike.%{search}%")
    result = query.order("full_name").execute()
    return {"success": True, "patients": result.data}

@router.get("/{patient_id}")
async def get_patient(patient_id: str):
    result = supabase_admin.table("pacientes").select("*").eq("id", patient_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"success": True, "patient": result.data}

@router.patch("/{patient_id}")
async def update_patient(patient_id: str, patient: dict):
    result = supabase_admin.table("pacientes").update(patient).eq("id", patient_id).execute()
    return {"success": True, "patient": result.data[0]}

@router.delete("/{patient_id}")
async def delete_patient(patient_id: str):
    supabase_admin.table("pacientes").delete().eq("id", patient_id).execute()
    return {"success": True, "message": "Patient deleted"}
