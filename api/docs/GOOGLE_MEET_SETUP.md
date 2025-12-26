# 🎥 Configurar Google Meet - Guia Completo

Este guia mostra como configurar a integração com Google Meet **GRATUITA** usando a API do Google Calendar.

## ✅ O que você vai conseguir:

- ✅ Criar links do Google Meet automaticamente
- ✅ Enviar convites por email para pacientes
- ✅ Sincronizar com Google Calendar
- ✅ 100% GRATUITO (não precisa Google Workspace)

## 📋 Pré-requisitos

- Conta Google gratuita (Gmail)
- 10 minutos para configurar

## 🚀 Passo a Passo

### 1. Criar Projeto no Google Cloud

1. Acesse: https://console.cloud.google.com/
2. Clique em **"Criar Projeto"** (canto superior direito)
3. Nome do projeto: `Clinica Estetica API`
4. Clique em **"Criar"**

### 2. Ativar Google Calendar API

1. No menu lateral, vá em: **APIs e Serviços > Biblioteca**
2. Pesquise por: `Google Calendar API`
3. Clique em **"Ativar"**

### 3. Configurar Tela de Consentimento OAuth

1. Vá em: **APIs e Serviços > Tela de consentimento OAuth**
2. Escolha: **Externo** (funciona com conta gratuita)
3. Clique em **"Criar"**
4. Preencha:
   - **Nome do app**: Clínica Estética Pro
   - **Email de suporte**: seu@email.com
   - **Logotipo**: (opcional)
   - **Domínio da página inicial**: `https://sua-api.vercel.app`
5. Em **"Escopos"**, clique em **"Adicionar ou remover escopos"**:
   - Busque e adicione: `https://www.googleapis.com/auth/calendar`
6. Em **"Usuários de teste"**:
   - Adicione seu email e dos profissionais que vão usar
7. Clique em **"Salvar e continuar"**

### 4. Criar Credenciais OAuth 2.0

1. Vá em: **APIs e Serviços > Credenciais**
2. Clique em: **"Criar credenciais"** > **"ID do cliente OAuth"**
3. Tipo de aplicativo: **"Aplicativo de computador"**
4. Nome: `Clinica API Client`
5. Clique em **"Criar"**
6. **BAIXE O ARQUIVO `credentials.json`** 📥

### 5. Instalar Dependências Python

```bash
cd api
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

### 6. Configurar no Servidor

#### Opção A: Desenvolvimento Local

1. Coloque o arquivo `credentials.json` na pasta `api/`
2. Na primeira execução, uma janela do navegador abrirá
3. Faça login com sua conta Google
4. Autorize o acesso ao Calendar
5. Um arquivo `token.pickle` será criado automaticamente

```bash
# Rodar API
cd api
python -m uvicorn app.main:app --reload

# Na primeira vez, abrirá o navegador para autorizar
```

#### Opção B: Produção (Vercel)

Para produção, você precisa criar uma **Service Account**:

1. No Google Cloud Console, vá em **IAM e Admin > Contas de serviço**
2. Clique em **"Criar conta de serviço"**
3. Nome: `clinica-api-service`
4. Clique em **"Criar e continuar"**
5. Função: **"Editor do Projeto"**
6. Clique em **"Concluir"**
7. Clique na conta criada
8. Vá em **"Chaves"** > **"Adicionar chave"** > **"Criar nova chave"**
9. Tipo: **JSON**
10. **Baixe o arquivo JSON**

No Vercel:
```bash
# Adicionar variável de ambiente
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

### 7. Atualizar Código da API

Descomente o código em `app/services/google_meet_service.py`:

```python
# Remover estas linhas:
return {
    "meet_link": f"https://meet.google.com/xxx-yyyy-zzz",
    # ...
}

# Descomentar as implementações reais:
def _get_credentials(self):
    # Descomentar todo o código aqui

def _create_calendar_event(self):
    # Descomentar todo o código aqui
```

## 🧪 Testar a Integração

### Via Swagger (http://localhost:8000/docs)

1. Abra `/docs`
2. Vá em `POST /api/telemedicine/sessions`
3. Clique em **"Try it out"**
4. Preencha:
```json
{
  "agendamento_id": "123",
  "paciente_id": "456",
  "professional_id": "789",
  "summary": "Consulta - Maria Silva",
  "start_time": "2025-01-15T14:00:00",
  "duration_minutes": 60,
  "patient_email": "paciente@email.com",
  "professional_email": "profissional@email.com"
}
```
5. Clique em **"Execute"**

### Via JavaScript (Frontend)

```javascript
const createMeetLink = async () => {
  const response = await fetch('/api/telemedicine/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agendamento_id: '123',
      paciente_id: '456',
      professional_id: '789',
      summary: 'Consulta - Maria Silva',
      start_time: '2025-01-15T14:00:00',
      duration_minutes: 60,
      patient_email: 'paciente@email.com',
      professional_email: 'profissional@email.com'
    })
  });

  const data = await response.json();
  console.log('Link do Meet:', data.meet_link);
  // Exemplo: https://meet.google.com/abc-defg-hij

  // Exibir para o usuário ou salvar no banco
  window.open(data.meet_link, '_blank');
};
```

## 📊 O que Acontece Quando Você Cria uma Reunião:

1. ✅ **Evento criado** no Google Calendar
2. ✅ **Link do Meet gerado** automaticamente
3. ✅ **Convites enviados** por email para os participantes
4. ✅ **Lembretes configurados** (30 min antes e 24h antes)
5. ✅ **Sincronizado** com o calendário de todos

## 🎯 Usar no Dashboard

### Atualizar Página de Agendamentos

```typescript
// src/pages/Appointments.tsx

const handleCreateTelemedicine = async (agendamentoId: string) => {
  const response = await fetch('/api/telemedicine/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agendamento_id: agendamentoId,
      paciente_id: selectedPatient.id,
      professional_id: currentUser.id,
      summary: `Consulta - ${selectedPatient.name}`,
      start_time: appointmentDate,
      duration_minutes: 60,
      patient_email: selectedPatient.email,
      professional_email: currentUser.email
    })
  });

  const data = await response.json();

  // Exibir link do Meet
  alert(`Link criado: ${data.meet_link}`);

  // Ou copiar para clipboard
  navigator.clipboard.writeText(data.meet_link);
};
```

## 🔒 Segurança e Limites

### Limites da API Google Calendar (Gratuito):
- ✅ **Ilimitadas** reuniões
- ✅ **Ilimitados** participantes por reunião
- ✅ **1 milhão** de requisições/dia (mais que suficiente)

### Boas Práticas:
- ✅ Não commitar `credentials.json` no Git (já está no .gitignore)
- ✅ Não compartilhar `token.pickle`
- ✅ Usar Service Account em produção
- ✅ Renovar tokens expirados automaticamente

## ❓ Troubleshooting

### Erro: "The caller does not have permission"
**Solução**: Certifique-se de que adicionou seu email em "Usuários de teste" na tela de consentimento OAuth.

### Erro: "Token has been expired or revoked"
**Solução**: Delete o arquivo `token.pickle` e refaça a autenticação.

### Erro: "API not enabled"
**Solução**: Ative a Google Calendar API no Cloud Console.

### Link do Meet não aparece
**Solução**: Verifique se usou `conferenceDataVersion=1` na criação do evento.

## 📞 Suporte

Problemas na configuração?
- Email: suporte@fbzsistemas.com.br
- Documentação Google: https://developers.google.com/calendar/api/guides/overview

## 🎉 Pronto!

Agora você tem integração completa com Google Meet **100% gratuita**! 🚀

Os pacientes receberão:
- ✅ Email com convite
- ✅ Link direto para o Meet
- ✅ Lembretes automáticos
- ✅ Evento no calendário deles
