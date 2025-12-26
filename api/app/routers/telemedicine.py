from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import uuid
from app.core.supabase import supabase_admin
from app.services.google_meet_service import google_meet_service

router = APIRouter()

class TelemedicineSessionCreate(BaseModel):
    agendamento_id: str
    paciente_id: str
    professional_id: str
    summary: str = "Consulta de Telemedicina"
    start_time: datetime
    duration_minutes: int = 60
    patient_email: Optional[str] = None
    professional_email: Optional[str] = None

@router.post("/sessions")
async def create_telemedicine_session(session: TelemedicineSessionCreate):
    """
    Cria sessão de telemedicina com Google Meet

    Cria um evento no Google Calendar com link do Meet e salva no banco.
    Envia convites para paciente e profissional.
    """
    # Buscar emails se não fornecidos
    if not session.patient_email:
        patient = supabase_admin.table("pacientes").select("email").eq("id", session.paciente_id).single().execute()
        session.patient_email = patient.data.get("email") if patient.data else None

    if not session.professional_email:
        professional = supabase_admin.table("profiles").select("email").eq("id", session.professional_id).single().execute()
        session.professional_email = professional.data.get("email") if professional.data else None

    # Criar reunião no Google Meet
    attendees = []
    if session.patient_email:
        attendees.append(session.patient_email)
    if session.professional_email:
        attendees.append(session.professional_email)

    meet_data = google_meet_service.create_meeting(
        summary=session.summary,
        start_time=session.start_time,
        duration_minutes=session.duration_minutes,
        attendees=attendees,
        description=f"Consulta de telemedicina - Agendamento #{session.agendamento_id}"
    )

    # Salvar no banco
    result = supabase_admin.table("telemedicine_sessions").insert({
        "agendamento_id": session.agendamento_id,
        "paciente_id": session.paciente_id,
        "professional_id": session.professional_id,
        "meet_link": meet_data["meet_link"],
        "google_event_id": meet_data["event_id"],
        "start_time": meet_data["start_time"],
        "end_time": meet_data["end_time"],
        "status": "scheduled"
    }).execute()

    return {
        "success": True,
        "session": result.data[0],
        "meet_link": meet_data["meet_link"],
        "start_time": meet_data["start_time"],
        "end_time": meet_data["end_time"],
        "message": "Link do Google Meet criado! Os participantes receberão convite por email."
    }

@router.get("/sessions/{session_id}")
async def get_telemedicine_session(session_id: str):
    result = supabase_admin.table("telemedicine_sessions")\
        .select("*, pacientes(*), profiles(*)")\
        .eq("id", session_id)\
        .single()\
        .execute()
    return {"success": True, "session": result.data}

@router.patch("/sessions/{session_id}/start")
async def start_telemedicine_session(session_id: str):
    from datetime import datetime

    result = supabase_admin.table("telemedicine_sessions").update({
        "status": "in_progress",
        "started_at": datetime.now().isoformat()
    }).eq("id", session_id).execute()

    return {"success": True, "session": result.data[0]}

@router.patch("/sessions/{session_id}/end")
async def end_telemedicine_session(session_id: str, notes: Optional[str] = None):
    from datetime import datetime

    # Calcular duração
    session = supabase_admin.table("telemedicine_sessions").select("started_at").eq("id", session_id).single().execute()

    if session.data and session.data.get("started_at"):
        started = datetime.fromisoformat(session.data["started_at"])
        ended = datetime.now()
        duration_minutes = int((ended - started).total_seconds() / 60)
    else:
        duration_minutes = 0

    result = supabase_admin.table("telemedicine_sessions").update({
        "status": "completed",
        "ended_at": datetime.now().isoformat(),
        "duration_minutes": duration_minutes,
        "notes": notes
    }).eq("id", session_id).execute()

    return {"success": True, "session": result.data[0]}

# WebRTC Signaling (simplificado)
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)

    async def broadcast(self, room_id: str, message: dict, sender: WebSocket):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if connection != sender:
                    await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """
    WebSocket para sinalização WebRTC
    """
    await manager.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Repassar sinais WebRTC para outros participantes
            await manager.broadcast(room_id, data, websocket)
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
