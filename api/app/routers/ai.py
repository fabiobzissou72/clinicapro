"""
Router para serviços de IA
Transcrição de áudio e resumo de prontuários
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
import os
import uuid
from app.services.ai_service import AIService
from app.core.supabase import supabase_admin

router = APIRouter()

@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    paciente_id: str = Form(...),
    professional_id: str = Form(...),
    agendamento_id: Optional[str] = Form(None)
):
    """
    Transcreve áudio de prontuário usando Whisper
    """
    # Salvar arquivo temporário
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(audio.filename)[1]
    file_path = f"uploads/audio_{file_id}{file_ext}"

    with open(file_path, "wb") as f:
        content = await audio.read()
        f.write(content)

    # Obter informações do arquivo
    file_size = os.path.getsize(file_path)

    # Criar registro no banco
    record = supabase_admin.table("medical_audio_records").insert({
        "paciente_id": paciente_id,
        "professional_id": professional_id,
        "agendamento_id": agendamento_id,
        "audio_url": file_path,
        "file_size_bytes": file_size,
        "transcription_status": "processing"
    }).execute()

    record_id = record.data[0]["id"]

    # Transcrever
    result = await AIService.transcribe_audio(file_path)

    if result["success"]:
        # Atualizar registro
        supabase_admin.table("medical_audio_records").update({
            "transcription": result["transcription"],
            "transcription_status": "completed"
        }).eq("id", record_id).execute()

        return {
            "success": True,
            "record_id": record_id,
            "transcription": result["transcription"]
        }
    else:
        # Marcar como falhou
        supabase_admin.table("medical_audio_records").update({
            "transcription_status": "failed",
            "metadata": {"error": result["error"]}
        }).eq("id", record_id).execute()

        raise HTTPException(status_code=500, detail=result["error"])

@router.post("/summarize/{record_id}")
async def summarize_medical_record(record_id: str):
    """
    Cria resumo estruturado do prontuário a partir da transcrição
    """
    # Buscar registro
    record = supabase_admin.table("medical_audio_records")\
        .select("*, pacientes(*)")\
        .eq("id", record_id)\
        .single()\
        .execute()

    if not record.data:
        raise HTTPException(status_code=404, detail="Record not found")

    if not record.data.get("transcription"):
        raise HTTPException(status_code=400, detail="No transcription available")

    # Atualizar status
    supabase_admin.table("medical_audio_records").update({
        "summary_status": "processing"
    }).eq("id", record_id).execute()

    # Preparar contexto do paciente
    patient = record.data["pacientes"]
    patient_context = {
        "name": patient["full_name"],
        "age": None,  # Calcular se tiver birth_date
        "history": patient.get("medical_history", "")
    }

    # Gerar resumo
    result = await AIService.summarize_medical_record(
        record.data["transcription"],
        patient_context
    )

    if result["success"]:
        # Salvar resumo
        supabase_admin.table("medical_audio_records").update({
            "ai_summary": result["summary"],
            "summary_status": "completed"
        }).eq("id", record_id).execute()

        return {
            "success": True,
            "summary": result["summary"]
        }
    else:
        supabase_admin.table("medical_audio_records").update({
            "summary_status": "failed"
        }).eq("id", record_id).execute()

        raise HTTPException(status_code=500, detail=result["error"])

@router.get("/records/patient/{paciente_id}")
async def get_patient_audio_records(paciente_id: str):
    """
    Lista todos os registros de áudio de um paciente
    """
    records = supabase_admin.table("medical_audio_records")\
        .select("*, profiles(*)")\
        .eq("paciente_id", paciente_id)\
        .order("created_at", desc=True)\
        .execute()

    return {"success": True, "records": records.data}

@router.get("/records/{record_id}")
async def get_audio_record(record_id: str):
    """
    Obtém detalhes de um registro de áudio específico
    """
    record = supabase_admin.table("medical_audio_records")\
        .select("*, pacientes(*), profiles(*)")\
        .eq("id", record_id)\
        .single()\
        .execute()

    if not record.data:
        raise HTTPException(status_code=404, detail="Record not found")

    return {"success": True, "record": record.data}

@router.post("/extract-info/{record_id}")
async def extract_key_information(record_id: str):
    """
    Extrai informações estruturadas da transcrição
    """
    record = supabase_admin.table("medical_audio_records")\
        .select("*")\
        .eq("id", record_id)\
        .single()\
        .execute()

    if not record.data or not record.data.get("transcription"):
        raise HTTPException(status_code=400, detail="No transcription available")

    result = await AIService.extract_key_info(record.data["transcription"])

    if result["success"]:
        # Salvar informações extraídas no metadata
        current_metadata = record.data.get("metadata", {})
        current_metadata["extracted_info"] = result["data"]

        supabase_admin.table("medical_audio_records").update({
            "metadata": current_metadata
        }).eq("id", record_id).execute()

        return {
            "success": True,
            "extracted_info": result["data"]
        }
    else:
        raise HTTPException(status_code=500, detail=result["error"])
