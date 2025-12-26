# 🚀 Guia de Início Rápido - Clínica Estética Pro API

## Sumário
1. [Acesso à Documentação Interativa](#documentação-interativa)
2. [Autenticação](#autenticação)
3. [Primeiro Request](#primeiro-request)
4. [Exemplos Práticos](#exemplos-práticos)

## 📚 Documentação Interativa

A API possui 3 formas de visualizar a documentação:

### 1. Swagger UI (Recomendado)
Documentação interativa onde você pode testar os endpoints diretamente no navegador:

**Produção**: `https://sua-api.vercel.app/docs`
**Local**: `http://localhost:8000/docs`

### 2. ReDoc
Documentação alternativa com layout diferente:

**Produção**: `https://sua-api.vercel.app/redoc`
**Local**: `http://localhost:8000/redoc`

### 3. OpenAPI JSON
Schema OpenAPI para importar em ferramentas como Postman ou Insomnia:

**Produção**: `https://sua-api.vercel.app/openapi.json`
**Local**: `http://localhost:8000/openapi.json`

## 🔐 Autenticação

A API usa **JWT (JSON Web Tokens)** para autenticação.

### Passo 1: Fazer Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@clinica.com",
  "password": "sua-senha"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "123",
    "email": "admin@clinica.com",
    "name": "Admin"
  }
}
```

### Passo 2: Usar o Token

Em **todas as requisições protegidas**, adicione o header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 Primeiro Request

### Exemplo com cURL

```bash
# 1. Login
curl -X POST https://sua-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","password":"senha123"}'

# 2. Usar o token para buscar pacientes
curl https://sua-api.vercel.app/api/patients \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Exemplo com JavaScript (Fetch)

```javascript
// 1. Login
const loginResponse = await fetch('https://sua-api.vercel.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@clinica.com',
    password: 'senha123'
  })
});

const { access_token } = await loginResponse.json();

// 2. Buscar pacientes
const patientsResponse = await fetch('https://sua-api.vercel.app/api/patients', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

const patients = await patientsResponse.json();
console.log(patients);
```

### Exemplo com Python

```python
import requests

# 1. Login
login_response = requests.post(
    'https://sua-api.vercel.app/api/auth/login',
    json={
        'email': 'admin@clinica.com',
        'password': 'senha123'
    }
)

token = login_response.json()['access_token']

# 2. Buscar pacientes
patients_response = requests.get(
    'https://sua-api.vercel.app/api/patients',
    headers={'Authorization': f'Bearer {token}'}
)

patients = patients_response.json()
print(patients)
```

## 💡 Exemplos Práticos

### 1. Criar um Novo Paciente

```javascript
const createPatient = async (token) => {
  const response = await fetch('https://sua-api.vercel.app/api/patients', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      full_name: 'Maria Silva',
      cpf: '123.456.789-00',
      phone: '(11) 99999-9999',
      email: 'maria@email.com',
      birth_date: '1990-01-15',
      address: 'Rua das Flores, 123'
    })
  });

  return await response.json();
};
```

### 2. Criar um Agendamento

```javascript
const createAppointment = async (token) => {
  const response = await fetch('https://sua-api.vercel.app/api/appointments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      paciente_id: 'id-do-paciente',
      procedimento_id: 'id-do-procedimento',
      professional_id: 'id-do-profissional',
      start_time: '2025-01-10T14:00:00',
      end_time: '2025-01-10T15:00:00',
      status: 'confirmed',
      notes: 'Primeira sessão de limpeza de pele'
    })
  });

  return await response.json();
};
```

### 3. Buscar Estatísticas do Dashboard

```javascript
const getDashboardStats = async (token) => {
  const response = await fetch('https://sua-api.vercel.app/api/dashboard/stats', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};

// Retorna algo como:
// {
//   "appointments_today": 15,
//   "total_patients": 342,
//   "monthly_revenue": 45200.00,
//   "pending_appointments": 8
// }
```

### 4. Enviar Mensagem WhatsApp

```javascript
const sendWhatsApp = async (token) => {
  const response = await fetch('https://sua-api.vercel.app/api/whatsapp/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone: '5511999999999',
      message: 'Olá! Seu agendamento está confirmado para amanhã às 14h.'
    })
  });

  return await response.json();
};
```

### 5. Analisar Imagem com IA

```javascript
const analyzeImage = async (token, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('analysis_type', 'skin_analysis');

  const response = await fetch('https://sua-api.vercel.app/api/ai/analyze-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};
```

## 🔄 Paginação

Muitos endpoints suportam paginação:

```javascript
// Buscar pacientes com paginação
const getPatients = async (token, page = 1, limit = 20) => {
  const response = await fetch(
    `https://sua-api.vercel.app/api/patients?page=${page}&limit=${limit}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  return await response.json();
};

// Resposta:
// {
//   "data": [...],
//   "total": 342,
//   "page": 1,
//   "pages": 18,
//   "limit": 20
// }
```

## 🔍 Filtros e Busca

```javascript
// Buscar pacientes por nome
const searchPatients = async (token, search) => {
  const response = await fetch(
    `https://sua-api.vercel.app/api/patients?search=${encodeURIComponent(search)}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  return await response.json();
};

// Filtrar agendamentos por data
const getAppointmentsByDate = async (token, date) => {
  const response = await fetch(
    `https://sua-api.vercel.app/api/appointments?date=${date}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  return await response.json();
};
```

## ⚠️ Tratamento de Erros

A API retorna erros no seguinte formato:

```json
{
  "detail": "Mensagem de erro descritiva"
}
```

### Códigos de Status HTTP

- `200 OK` - Sucesso
- `201 Created` - Recurso criado com sucesso
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Token inválido ou ausente
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro no servidor

### Exemplo de Tratamento

```javascript
const handleRequest = async (token) => {
  try {
    const response = await fetch('https://sua-api.vercel.app/api/patients', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro desconhecido');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error.message);
    throw error;
  }
};
```

## 📱 Testando com Postman/Insomnia

1. Importe o schema OpenAPI: `https://sua-api.vercel.app/openapi.json`
2. Crie uma variável de ambiente para o `BASE_URL`
3. Crie uma variável para o `TOKEN`
4. Adicione o header `Authorization: Bearer {{TOKEN}}` nas requisições

## 🆘 Problemas Comuns

### 401 Unauthorized
- Verifique se o token está correto
- Verifique se o token não expirou
- Faça login novamente para obter um novo token

### 403 Forbidden
- Você não tem permissão para acessar esse recurso
- Verifique se seu usuário tem a role adequada

### 404 Not Found
- Verifique se a URL está correta
- Verifique se o recurso existe no banco de dados

### 500 Internal Server Error
- Erro no servidor
- Verifique os logs da Vercel
- Entre em contato com o suporte

## 📞 Próximos Passos

- [Documentação de Endpoints](./ENDPOINTS.md)
- [Guia de Deploy](./DEPLOY.md)
- [Exemplos Avançados](./ADVANCED.md)
- [Webhooks](./WEBHOOKS.md)
