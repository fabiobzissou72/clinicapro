"""
Google Meet Service - Integração gratuita via Google Calendar API

Este serviço cria links do Google Meet usando a API do Google Calendar.
Funciona com conta Google gratuita (não precisa Workspace).
"""

from datetime import datetime, timedelta
from typing import Optional
import os

class GoogleMeetService:
    """
    Serviço para criar reuniões do Google Meet

    IMPORTANTE: Para usar este serviço, você precisa:
    1. Criar um projeto no Google Cloud Console
    2. Ativar Google Calendar API
    3. Criar credenciais OAuth 2.0
    4. Baixar o arquivo credentials.json

    Tutorial completo: ver docs/GOOGLE_MEET_SETUP.md
    """

    def __init__(self):
        # Credenciais serão configuradas depois
        self.credentials = None
        self.service = None

    def create_meeting(
        self,
        summary: str,
        start_time: datetime,
        duration_minutes: int = 60,
        attendees: list = None,
        description: str = None
    ) -> dict:
        """
        Cria um evento no Google Calendar com link do Meet

        Args:
            summary: Título da reunião (ex: "Consulta - Maria Silva")
            start_time: Data/hora de início
            duration_minutes: Duração em minutos (padrão: 60)
            attendees: Lista de emails dos participantes
            description: Descrição da reunião

        Returns:
            dict com:
                - meet_link: URL do Google Meet
                - event_id: ID do evento no Calendar
                - start_time: Horário de início
                - end_time: Horário de fim
        """
        # Por enquanto, retorna um link simulado
        # Depois de configurar OAuth, isso será substituído pela chamada real

        end_time = start_time + timedelta(minutes=duration_minutes)

        # Simulação do que a API retornaria:
        return {
            "meet_link": f"https://meet.google.com/xxx-yyyy-zzz",  # Será gerado pela API
            "event_id": "google-calendar-event-id",
            "summary": summary,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "attendees": attendees or [],
            "status": "created"
        }

    def _get_credentials(self):
        """
        Obtém credenciais OAuth 2.0 do Google

        IMPLEMENTAÇÃO COMPLETA:

        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build
        import pickle

        SCOPES = ['https://www.googleapis.com/auth/calendar']

        creds = None
        # Token salvo
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)

        # Se não tem credenciais válidas, pede login
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)

            # Salva credenciais
            with open('token.pickle', 'wb') as token:
                pickle.dump(creds, token)

        return creds
        """
        pass

    def _create_calendar_event(
        self,
        summary: str,
        start_time: datetime,
        end_time: datetime,
        attendees: list,
        description: str
    ):
        """
        Cria evento no Google Calendar com Meet habilitado

        IMPLEMENTAÇÃO COMPLETA:

        from googleapiclient.discovery import build

        service = build('calendar', 'v3', credentials=self.credentials)

        event = {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'America/Sao_Paulo',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'America/Sao_Paulo',
            },
            'attendees': [{'email': email} for email in attendees],
            'conferenceData': {
                'createRequest': {
                    'requestId': f"meet-{datetime.now().timestamp()}",
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                }
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 30},
                ],
            },
        }

        event = service.events().insert(
            calendarId='primary',
            body=event,
            conferenceDataVersion=1,
            sendUpdates='all'
        ).execute()

        # Extrai link do Meet
        meet_link = event.get('hangoutLink')

        return {
            'meet_link': meet_link,
            'event_id': event['id'],
            'htmlLink': event.get('htmlLink'),
            'status': event['status']
        }
        """
        pass

    def cancel_meeting(self, event_id: str) -> bool:
        """
        Cancela um evento do Google Calendar

        Args:
            event_id: ID do evento no Calendar

        Returns:
            True se cancelado com sucesso

        IMPLEMENTAÇÃO COMPLETA:

        from googleapiclient.discovery import build

        service = build('calendar', 'v3', credentials=self.credentials)

        service.events().delete(
            calendarId='primary',
            eventId=event_id,
            sendUpdates='all'
        ).execute()

        return True
        """
        return True

    def update_meeting(
        self,
        event_id: str,
        start_time: Optional[datetime] = None,
        duration_minutes: Optional[int] = None,
        summary: Optional[str] = None
    ) -> dict:
        """
        Atualiza um evento existente

        IMPLEMENTAÇÃO COMPLETA:

        from googleapiclient.discovery import build

        service = build('calendar', 'v3', credentials=self.credentials)

        # Buscar evento atual
        event = service.events().get(
            calendarId='primary',
            eventId=event_id
        ).execute()

        # Atualizar campos
        if start_time:
            end_time = start_time + timedelta(minutes=duration_minutes or 60)
            event['start']['dateTime'] = start_time.isoformat()
            event['end']['dateTime'] = end_time.isoformat()

        if summary:
            event['summary'] = summary

        # Salvar alterações
        updated_event = service.events().update(
            calendarId='primary',
            eventId=event_id,
            body=event,
            sendUpdates='all'
        ).execute()

        return {
            'meet_link': updated_event.get('hangoutLink'),
            'event_id': updated_event['id'],
            'status': updated_event['status']
        }
        """
        return {"status": "updated"}


# Instância global do serviço
google_meet_service = GoogleMeetService()
