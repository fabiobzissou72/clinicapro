from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional
import uuid
from app.core.supabase import supabase_admin

router = APIRouter()

class TelemedicineSessionCreate(BaseModel):
    agendamento_id: str
    paciente_id: str
    professional_id: str

@router.post("/sessions")
async def create_telemedicine_session(session: TelemedicineSessionCreate):
    """
    Cria sessão de telemedicina
    """
    room_id = str(uuid.uuid4())

    result = supabase_admin.table("telemedicine_sessions").insert({
        "agendamento_id": session.agendamento_id,
        "paciente_id": session.paciente_id,
        "professional_id": session.professional_id,
        "room_id": room_id,
        "status": "scheduled"
    }).execute()

    return {
        "success": True,
        "session": result.data[0],
        "join_url_patient": f"/telemedicine/join/{room_id}?role=patient",
        "join_url_professional": f"/telemedicine/join/{room_id}?role=professional"
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
