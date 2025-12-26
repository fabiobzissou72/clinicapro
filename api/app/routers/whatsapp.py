"""
Router para WhatsApp - Webhooks e envio de mensagens
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from typing import Dict, Any
from app.services.whatsapp_service import whatsapp_service
from app.services.ai_service import AIService
from app.core.supabase import supabase_admin

router = APIRouter()

@router.post("/webhook")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Recebe webhooks do Evolution API
    Processa mensagens recebidas (paciente e profissional)
    """
    try:
        payload = await request.json()
        event_type = payload.get("event")
        data = payload.get("data", {})

        # Mensagem recebida
        if event_type == "messages.upsert":
            message = data.get("message", {})
            from_number = message.get("key", {}).get("remoteJid", "").replace("@s.whatsapp.net", "")
            message_type = message.get("messageType")

            # Identificar se é paciente ou profissional
            paciente = supabase_admin.table("pacientes")\
                .select("*")\
                .eq("whatsapp_number", from_number)\
                .single()\
                .execute()

            professional = supabase_admin.table("profiles")\
                .select("*")\
                .eq("whatsapp_number", from_number)\
                .single()\
                .execute()

            # FLUXO PACIENTE
            if paciente.data:
                background_tasks.add_task(process_patient_message, message, paciente.data)

            # FLUXO PROFISSIONAL (Áudio de prontuário)
            elif professional.data:
                if message_type == "audioMessage":
                    background_tasks.add_task(process_professional_audio, message, professional.data)

            # Novo contato - criar lead
            else:
                background_tasks.add_task(create_lead_from_whatsapp, from_number, message)

        return {"status": "received"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_patient_message(message: dict, paciente: dict):
    """
    Processa mensagem do paciente (bot de agendamento)
    """
    from_number = paciente["whatsapp_number"]
    text = message.get("message", {}).get("conversation", "")

    # Comandos do bot
    if "agendar" in text.lower():
        # Mostrar procedimentos disponíveis
        procedures = supabase_admin.table("procedimentos")\
            .select("*")\
            .eq("active", True)\
            .eq("available_for_online_booking", True)\
            .execute()

        msg = "🗓️ *Agendar Consulta*\n\nEscolha o procedimento:\n\n"
        for idx, proc in enumerate(procedures.data, 1):
            msg += f"{idx}. {proc['name']} - R$ {proc['price']}\n"

        await whatsapp_service.send_text_message(from_number, msg)

    elif "horários" in text.lower() or text.isdigit():
        # Mostrar horários disponíveis
        await show_available_times(from_number, paciente["id"])

    elif "confirmar" in text.lower() or text.upper() == "SIM":
        # Confirmar agendamento pendente
        await confirm_pending_appointment(paciente["id"], from_number)

    else:
        # Resposta automática com IA
        context = "Você ajuda pacientes a agendar consultas, confirmar agendamentos e tirar dúvidas."
        response = await AIService.generate_whatsapp_response(context, text)
        await whatsapp_service.send_text_message(from_number, response)

async def process_professional_audio(message: dict, professional: dict):
    """
    Processa áudio enviado por profissional (prontuário)
    """
    audio_message = message.get("message", {}).get("audioMessage", {})
    audio_url = audio_message.get("url")

    if audio_url:
        # Perguntar sobre qual paciente é o prontuário
        from_number = professional["whatsapp_number"]

        msg = """
🎤 *Áudio de Prontuário Recebido*

Para qual paciente é este prontuário?
Digite o nome ou CPF do paciente:
        """

        await whatsapp_service.send_text_message(from_number, msg)

        # Salvar contexto temporário
        # (implementar sistema de state machine para conversas)

async def show_available_times(to: str, paciente_id: str):
    """
    Mostra horários disponíveis para agendamento
    """
    # Buscar horários disponíveis (próximos 7 dias)
    import datetime
    today = datetime.date.today()

    msg = "📅 *Horários Disponíveis*\n\n"
    msg += "Escolha um horário:\n\n"
    msg += "1. Amanhã 10:00\n"
    msg += "2. Amanhã 14:00\n"
    msg += "3. Sexta 09:00\n"
    msg += "4. Sexta 15:30\n\n"
    msg += "Digite o número do horário desejado."

    await whatsapp_service.send_text_message(to, msg)

async def confirm_pending_appointment(paciente_id: str, phone: str):
    """
    Confirma agendamento pendente
    """
    # Buscar agendamento pendente
    appointment = supabase_admin.table("agendamentos")\
        .select("*, procedimentos(*), profiles(*)")\
        .eq("paciente_id", paciente_id)\
        .eq("status", "pending")\
        .order("created_at", desc=True)\
        .limit(1)\
        .single()\
        .execute()

    if appointment.data:
        # Atualizar status
        supabase_admin.table("agendamentos")\
            .update({"status": "confirmed", "confirmation_sent": True})\
            .eq("id", appointment.data["id"])\
            .execute()

        msg = f"""
✅ *Agendamento Confirmado!*

Seu agendamento foi confirmado com sucesso!

📋 {appointment.data['procedimentos']['name']}
📅 {appointment.data['start_time']}

Até breve! ✨
        """

        await whatsapp_service.send_text_message(phone, msg)

async def create_lead_from_whatsapp(phone: str, message: dict):
    """
    Cria lead quando recebe mensagem de número desconhecido
    """
    text = message.get("message", {}).get("conversation", "Novo contato via WhatsApp")

    # Criar paciente como lead
    supabase_admin.table("pacientes").insert({
        "whatsapp_number": phone,
        "observations": f"Lead criado via WhatsApp: {text}",
        "tags": ["lead", "whatsapp"]
    }).execute()

    # Mensagem de boas-vindas
    welcome = """
👋 *Bem-vindo à Clínica Estética!*

Olá! Obrigada por entrar em contato.

Como posso te ajudar hoje?

1️⃣ Agendar consulta
2️⃣ Ver procedimentos
3️⃣ Falar com atendente

Digite o número da opção desejada.
    """

    await whatsapp_service.send_text_message(phone, welcome)

@router.post("/send/message")
async def send_message(to: str, message: str):
    """
    Endpoint para enviar mensagem manual
    """
    result = await whatsapp_service.send_text_message(to, message)
    return result

@router.post("/send/appointment-reminder/{appointment_id}")
async def send_appointment_reminder(appointment_id: str):
    """
    Envia lembrete de agendamento
    """
    appointment = supabase_admin.table("agendamentos")\
        .select("*, pacientes(*), procedimentos(*), profiles(*)")\
        .eq("id", appointment_id)\
        .single()\
        .execute()

    if not appointment.data:
        raise HTTPException(status_code=404, detail="Appointment not found")

    data = {
        "patient_name": appointment.data["pacientes"]["full_name"],
        "procedure": appointment.data["procedimentos"]["name"],
        "date": str(appointment.data["start_time"].split("T")[0]),
        "time": str(appointment.data["start_time"].split("T")[1]),
        "professional": appointment.data["profiles"]["full_name"]
    }

    result = await whatsapp_service.send_appointment_reminder(
        appointment.data["pacientes"]["whatsapp_number"],
        data
    )

    return result
