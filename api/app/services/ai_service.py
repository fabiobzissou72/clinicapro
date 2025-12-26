"""
Serviço de IA para transcrição de áudio e resumo de prontuários
Usa OpenAI Whisper para transcrição e GPT-4 para resumo
"""
import openai
from openai import OpenAI
import os
from typing import Optional
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

class AIService:

    @staticmethod
    async def transcribe_audio(audio_file_path: str) -> dict:
        """
        Transcreve áudio para texto usando Whisper
        """
        try:
            with open(audio_file_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language="pt"
                )

            return {
                "success": True,
                "transcription": transcript.text,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "transcription": None,
                "error": str(e)
            }

    @staticmethod
    async def summarize_medical_record(transcription: str, patient_context: Optional[dict] = None) -> dict:
        """
        Cria resumo estruturado do prontuário usando GPT-4
        """
        try:
            context = ""
            if patient_context:
                context = f"""
                Dados do paciente:
                Nome: {patient_context.get('name', 'N/A')}
                Idade: {patient_context.get('age', 'N/A')}
                Histórico: {patient_context.get('history', 'N/A')}
                """

            prompt = f"""
            Você é um assistente médico especializado em clínica estética.
            Analise a transcrição do atendimento abaixo e crie um resumo estruturado do prontuário.

            {context}

            TRANSCRIÇÃO DO ATENDIMENTO:
            {transcription}

            Crie um resumo estruturado contendo:
            1. QUEIXA PRINCIPAL
            2. HISTÓRICO
            3. AVALIAÇÃO FÍSICA
            4. PROCEDIMENTO REALIZADO/RECOMENDADO
            5. ORIENTAÇÕES PÓS-TRATAMENTO
            6. PRÓXIMOS PASSOS

            Mantenha o formato profissional e objetivo.
            """

            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "Você é um assistente médico especializado em estética."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )

            summary = response.choices[0].message.content

            return {
                "success": True,
                "summary": summary,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "summary": None,
                "error": str(e)
            }

    @staticmethod
    async def extract_key_info(transcription: str) -> dict:
        """
        Extrai informações chave da transcrição (procedimentos, medicamentos, alergias, etc)
        """
        try:
            prompt = f"""
            Extraia as seguintes informações da transcrição médica abaixo em formato JSON:
            - procedimentos_mencionados: lista de procedimentos
            - medicamentos: lista de medicamentos
            - alergias: lista de alergias mencionadas
            - proxima_consulta: data mencionada para retorno (se houver)
            - recomendacoes: lista de recomendações

            TRANSCRIÇÃO:
            {transcription}

            Retorne apenas o JSON, sem texto adicional.
            """

            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "Você extrai informações estruturadas de transcrições médicas."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=500
            )

            import json
            extracted_info = json.loads(response.choices[0].message.content)

            return {
                "success": True,
                "data": extracted_info,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "error": str(e)
            }

    @staticmethod
    async def generate_whatsapp_response(context: str, user_message: str) -> str:
        """
        Gera resposta automática para mensagens do WhatsApp
        """
        try:
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": f"Você é a assistente virtual de uma clínica estética. {context}"},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7,
                max_tokens=300
            )

            return response.choices[0].message.content
        except Exception as e:
            return "Desculpe, não consegui processar sua mensagem. Por favor, entre em contato com nossa equipe."
