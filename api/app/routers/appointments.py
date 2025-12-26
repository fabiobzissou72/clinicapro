"""
Router para Agendamentos
"""
from fastapi import APIRouter, HTTPException
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.core.supabase import supabase_admin
from app.services.whatsapp_service import whatsapp_service

router = APIRouter()

class AppointmentCreate(BaseModel):
    paciente_id: str
    procedimento_id: str
    professional_id: str
    start_time: str
    end_time: str
    notes: Optional[str] = None
    source: Optional[str] = "manual"

class AppointmentUpdate(BaseModel):
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

@router.post("/")
async def create_appointment(appointment: AppointmentCreate):
    """
    Cria novo agendamento
    """
    # Verificar conflitos de horário
    conflicts = supabase_admin.table("agendamentos")\
        .select("*")\
        .eq("professional_id", appointment.professional_id)\
        .gte("start_time", appointment.start_time)\
        .lte("start_time", appointment.end_time)\
        .neq("status", "cancelled")\
        .execute()

    if conflicts.data:
        raise HTTPException(status_code=400, detail="Horário indisponível")

    # Criar agendamento
    result = supabase_admin.table("agendamentos").insert({
        "paciente_id": appointment.paciente_id,
        "procedimento_id": appointment.procedimento_id,
        "professional_id": appointment.professional_id,
        "start_time": appointment.start_time,
        "end_time": appointment.end_time,
        "notes": appointment.notes,
        "source": appointment.source,
        "status": "pending"
    }).execute()

    appointment_id = result.data[0]["id"]

    # Enviar confirmação por WhatsApp
    paciente = supabase_admin.table("pacientes").select("*").eq("id", appointment.paciente_id).single().execute()
    procedimento = supabase_admin.table("procedimentos").select("*").eq("id", appointment.procedimento_id).single().execute()
    professional = supabase_admin.table("profiles").select("*").eq("id", appointment.professional_id).single().execute()

    if paciente.data and paciente.data.get("whatsapp_number"):
        start_dt = datetime.fromisoformat(appointment.start_time.replace("Z", "+00:00"))

        await whatsapp_service.send_appointment_confirmation(
            paciente.data["whatsapp_number"],
            {
                "patient_name": paciente.data["full_name"],
                "procedure": procedimento.data["name"],
                "date": start_dt.strftime("%d/%m/%Y"),
                "time": start_dt.strftime("%H:%M"),
                "professional": professional.data["full_name"]
            }
        )

    return {"success": True, "appointment": result.data[0]}

@router.get("/")
async def list_appointments(
    professional_id: Optional[str] = None,
    paciente_id: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """
    Lista agendamentos com filtros
    """
    query = supabase_admin.table("agendamentos").select("*, pacientes(*), procedimentos(*), profiles(*)")

    if professional_id:
        query = query.eq("professional_id", professional_id)
    if paciente_id:
        query = query.eq("paciente_id", paciente_id)
    if status:
        query = query.eq("status", status)
    if start_date:
        query = query.gte("start_time", start_date)
    if end_date:
        query = query.lte("start_time", end_date)

    result = query.order("start_time").execute()

    return {"success": True, "appointments": result.data}

@router.get("/{appointment_id}")
async def get_appointment(appointment_id: str):
    """
    Obtém detalhes de um agendamento
    """
    result = supabase_admin.table("agendamentos")\
        .select("*, pacientes(*), procedimentos(*), profiles(*)")\
        .eq("id", appointment_id)\
        .single()\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Appointment not found")

    return {"success": True, "appointment": result.data}

@router.patch("/{appointment_id}")
async def update_appointment(appointment_id: str, update: AppointmentUpdate):
    """
    Atualiza agendamento
    """
    update_data = {k: v for k, v in update.dict().items() if v is not None}

    result = supabase_admin.table("agendamentos")\
        .update(update_data)\
        .eq("id", appointment_id)\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Appointment not found")

    return {"success": True, "appointment": result.data[0]}

@router.delete("/{appointment_id}")
async def cancel_appointment(appointment_id: str):
    """
    Cancela agendamento
    """
    result = supabase_admin.table("agendamentos")\
        .update({"status": "cancelled"})\
        .eq("id", appointment_id)\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Notificar paciente
    appointment = result.data[0]
    paciente = supabase_admin.table("pacientes").select("*").eq("id", appointment["paciente_id"]).single().execute()

    if paciente.data and paciente.data.get("whatsapp_number"):
        msg = f"""
❌ *Agendamento Cancelado*

Olá {paciente.data['full_name']},

Seu agendamento foi cancelado.

Para reagendar, entre em contato conosco.
        """
        await whatsapp_service.send_text_message(paciente.data["whatsapp_number"], msg)

    return {"success": True, "message": "Appointment cancelled"}

@router.get("/available-slots/{professional_id}")
async def get_available_slots(
    professional_id: str,
    date: str,
    procedimento_id: str
):
    """
    Retorna horários disponíveis para agendamento
    """
    # Buscar configuração de disponibilidade
    target_date = datetime.strptime(date, "%Y-%m-%d")
    day_of_week = target_date.weekday()

    availability = supabase_admin.table("availability_settings")\
        .select("*")\
        .eq("professional_id", professional_id)\
        .eq("day_of_week", day_of_week)\
        .eq("is_available", True)\
        .execute()

    if not availability.data:
        return {"success": True, "slots": []}

    # Buscar duração do procedimento
    procedimento = supabase_admin.table("procedimentos")\
        .select("duration")\
        .eq("id", procedimento_id)\
        .single()\
        .execute()

    duration = procedimento.data.get("duration", 60)

    # Buscar agendamentos existentes
    existing = supabase_admin.table("agendamentos")\
        .select("start_time, end_time")\
        .eq("professional_id", professional_id)\
        .gte("start_time", f"{date}T00:00:00")\
        .lte("start_time", f"{date}T23:59:59")\
        .neq("status", "cancelled")\
        .execute()

    # Gerar slots disponíveis
    slots = []
    for av in availability.data:
        start_hour, start_min = map(int, av["start_time"].split(":"))
        end_hour, end_min = map(int, av["end_time"].split(":"))

        current = target_date.replace(hour=start_hour, minute=start_min)
        end = target_date.replace(hour=end_hour, minute=end_min)

        while current + timedelta(minutes=duration) <= end:
            slot_start = current.isoformat()
            slot_end = (current + timedelta(minutes=duration)).isoformat()

            # Verificar se está livre
            is_free = True
            for appt in existing.data:
                appt_start = datetime.fromisoformat(appt["start_time"].replace("Z", "+00:00"))
                appt_end = datetime.fromisoformat(appt["end_time"].replace("Z", "+00:00"))

                if not (current >= appt_end or current + timedelta(minutes=duration) <= appt_start):
                    is_free = False
                    break

            if is_free:
                slots.append({
                    "start_time": slot_start,
                    "end_time": slot_end,
                    "display": current.strftime("%H:%M")
                })

            current += timedelta(minutes=30)  # Intervalo de 30 min entre slots

    return {"success": True, "slots": slots}
