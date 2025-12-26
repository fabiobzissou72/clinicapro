"""
Serviço de integração com WhatsApp via Evolution API
Gerencia envio de mensagens, webhooks e automações
"""
import httpx
import json
from typing import Optional, Dict, List
from app.core.config import settings
from app.core.supabase import supabase_admin

class WhatsAppService:

    def __init__(self):
        self.base_url = settings.EVOLUTION_API_URL
        self.api_key = settings.EVOLUTION_API_KEY
        self.instance_name = settings.WHATSAPP_INSTANCE_NAME
        self.headers = {
            "apikey": self.api_key,
            "Content-Type": "application/json"
        }

    async def send_text_message(self, to: str, message: str) -> dict:
        """
        Envia mensagem de texto via WhatsApp
        """
        url = f"{self.base_url}/message/sendText/{self.instance_name}"

        payload = {
            "number": to,
            "text": message
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=self.headers)
                result = response.json()

                # Log no banco
                await self._log_message(to, message, "text", "outbound", result)

                return {
                    "success": response.status_code == 200,
                    "data": result
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def send_audio_message(self, to: str, audio_url: str) -> dict:
        """
        Envia áudio via WhatsApp
        """
        url = f"{self.base_url}/message/sendMedia/{self.instance_name}"

        payload = {
            "number": to,
            "mediatype": "audio",
            "media": audio_url
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=self.headers)
                result = response.json()

                await self._log_message(to, audio_url, "audio", "outbound", result)

                return {
                    "success": response.status_code == 200,
                    "data": result
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def send_button_message(self, to: str, text: str, buttons: List[Dict]) -> dict:
        """
        Envia mensagem com botões interativos
        """
        url = f"{self.base_url}/message/sendButtons/{self.instance_name}"

        payload = {
            "number": to,
            "title": text,
            "buttons": buttons
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=self.headers)
                return {
                    "success": response.status_code == 200,
                    "data": response.json()
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def send_appointment_confirmation(self, to: str, appointment_data: dict) -> dict:
        """
        Envia confirmação de agendamento
        """
        message = f"""
🗓️ *Agendamento Confirmado!*

Olá {appointment_data['patient_name']},

Seu agendamento foi confirmado com sucesso!

📋 *Detalhes:*
• Procedimento: {appointment_data['procedure']}
• Data: {appointment_data['date']}
• Horário: {appointment_data['time']}
• Profissional: {appointment_data['professional']}

📍 Local: {appointment_data.get('address', 'Endereço da clínica')}

💡 *Importante:*
• Chegue 10 minutos antes
• Traga documento com foto

Para reagendar ou cancelar, responda esta mensagem.

Até breve! ✨
        """

        return await self.send_text_message(to, message)

    async def send_appointment_reminder(self, to: str, appointment_data: dict) -> dict:
        """
        Envia lembrete de consulta
        """
        message = f"""
⏰ *Lembrete de Consulta*

Olá {appointment_data['patient_name']},

Lembramos que você tem consulta agendada:

📋 {appointment_data['procedure']}
📅 {appointment_data['date']} às {appointment_data['time']}
👩‍⚕️ Com {appointment_data['professional']}

Confirme sua presença respondendo SIM.

Para reagendar, entre em contato conosco.

Te esperamos! 💙
        """

        buttons = [
            {"buttonId": "confirm", "buttonText": {"displayText": "✅ Confirmar"}},
            {"buttonId": "reschedule", "buttonText": {"displayText": "📅 Reagendar"}},
            {"buttonId": "cancel", "buttonText": {"displayText": "❌ Cancelar"}}
        ]

        return await self.send_button_message(to, message, buttons)

    async def send_feedback_request(self, to: str, patient_name: str) -> dict:
        """
        Solicita feedback após atendimento
        """
        message = f"""
💬 *Como foi sua experiência?*

Olá {patient_name}!

Esperamos que tenha gostado do atendimento!

Sua opinião é muito importante para nós.
Avalie sua experiência de 1 a 5 estrelas:

⭐ ⭐ ⭐ ⭐ ⭐

Responda com um número de 1 a 5.

Obrigada! 💙
        """

        return await self.send_text_message(to, message)

    async def process_incoming_audio(self, audio_url: str, from_number: str, paciente_id: str) -> dict:
        """
        Processa áudio recebido via WhatsApp (prontuário da profissional)
        """
        from app.services.ai_service import AIService

        # Baixar áudio
        async with httpx.AsyncClient() as client:
            audio_response = await client.get(audio_url)
            audio_path = f"uploads/audio_{paciente_id}_{int(time.time())}.ogg"

            with open(audio_path, "wb") as f:
                f.write(audio_response.content)

        # Transcrever com Whisper
        transcription_result = await AIService.transcribe_audio(audio_path)

        if transcription_result["success"]:
            # Salvar no banco
            result = supabase_admin.table("medical_audio_records").insert({
                "paciente_id": paciente_id,
                "audio_url": audio_path,
                "transcription": transcription_result["transcription"],
                "transcription_status": "completed",
                "source": "whatsapp"
            }).execute()

            return {
                "success": True,
                "record_id": result.data[0]["id"],
                "transcription": transcription_result["transcription"]
            }

        return {"success": False, "error": "Transcription failed"}

    async def _log_message(self, to: str, content: str, msg_type: str, direction: str, response: dict):
        """
        Registra mensagem no banco de dados
        """
        try:
            supabase_admin.table("whatsapp_messages").insert({
                "to_number": to,
                "content": content,
                "message_type": msg_type,
                "direction": direction,
                "status": "sent" if response.get("success") else "failed",
                "metadata": response
            }).execute()
        except Exception as e:
            print(f"Error logging message: {e}")

    async def setup_webhook(self, webhook_url: str) -> dict:
        """
        Configura webhook para receber mensagens
        """
        url = f"{self.base_url}/webhook/set/{self.instance_name}"

        payload = {
            "webhook": {
                "url": webhook_url,
                "webhook_by_events": True,
                "events": [
                    "MESSAGES_UPSERT",
                    "MESSAGES_UPDATE",
                    "CONNECTION_UPDATE"
                ]
            }
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=self.headers)
                return {
                    "success": response.status_code == 200,
                    "data": response.json()
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

import time
whatsapp_service = WhatsAppService()
