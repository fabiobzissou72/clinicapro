from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.supabase import supabase, supabase_admin

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class SignUpRequest(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None

@router.post("/login")
async def login(request: LoginRequest):
    try:
        result = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        return {
            "success": True,
            "session": result.session.__dict__,
            "user": result.user.__dict__
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/signup")
async def signup(request: SignUpRequest):
    try:
        # Criar usuário no Supabase Auth
        result = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })

        # Criar profile
        if result.user:
            supabase_admin.table("profiles").insert({
                "id": result.user.id,
                "full_name": request.full_name,
                "phone": request.phone,
                "role": "client"
            }).execute()

        return {"success": True, "user": result.user.__dict__}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout")
async def logout():
    supabase.auth.sign_out()
    return {"success": True}

@router.get("/me")
async def get_current_user():
    user = supabase.auth.get_user()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    profile = supabase_admin.table("profiles").select("*").eq("id", user.user.id).single().execute()
    return {"success": True, "user": profile.data}
