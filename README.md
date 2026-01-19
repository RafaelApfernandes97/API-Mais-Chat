# API Mais Chat Wrapper

API simplificada para envio de mensagens via Mais Chat sem exposição de credenciais sensíveis (tokens Meta, appId, etc).

## Funcionalidades

- Envio de mensagens usando templates do WhatsApp
- Autenticação via token do tenant (Bearer token)
- Busca automática de credenciais no backend
- Listagem de templates disponíveis
- Proteção contra credenciais expostas

## Instalação

```bash
npm install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`

## Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

O servidor estará disponível em: `http://localhost:3000`

## Endpoints

### 1. Health Check
Verifica se a API está funcionando

**Endpoint:** `GET /api/v1/health`

**Resposta:**
```json
{
  "success": true,
  "message": "API funcionando corretamente",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

---

### 2. Listar Templates
Lista todos os templates disponíveis para o tenant

**Endpoint:** `GET /api/v1/templates`

**Headers:**
```
Authorization: bearer {TENANT_TOKEN}
Content-Type: application/json
```

**Resposta:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "name": "redefinicao_senha",
      "language": "pt_BR",
      "status": "APPROVED",
      "category": "UTILITY",
      "components": [...]
    }
  ]
}
```

---

### 3. Enviar Mensagem com Template
Envia uma mensagem usando um template aprovado

**Endpoint:** `POST /api/v1/send-template`

**Headers:**
```
Authorization: bearer {TENANT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "source": "5511986879746",
  "destination": "5511911761633",
  "template": {
    "name": "redefinicao_senha",
    "language": "pt_BR",
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "123456"
          }
        ]
      },
      {
        "type": "button",
        "sub_type": "url",
        "index": "0",
        "parameters": [
          {
            "type": "text",
            "text": "123456"
          }
        ]
      }
    ]
  }
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "messageId": "wamid.HBgMNTUxMTk4Njg3OTc0NjUQABIYDzIwMjQtMDYtMDYgMTE6NTc6MTcgKzAxOjAwKgA=",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "source": "5511986879746",
    "destination": "5511911761633",
    "templateName": "redefinicao_senha"
  }
}
```

## Exemplo de Uso com cURL

### Listar Templates
```bash
curl --location 'http://localhost:3000/api/v1/templates' \
--header 'Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
--header 'Content-Type: application/json'
```

### Enviar Mensagem
```bash
curl --location 'http://localhost:3000/api/v1/send-template' \
--header 'Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
--header 'Content-Type: application/json' \
--data '{
  "source": "5511986879746",
  "destination": "5511911761633",
  "template": {
    "name": "redefinicao_senha",
    "language": "pt_BR",
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "123456"
          }
        ]
      }
    ]
  }
}'
```

## Segurança

- Todas as credenciais sensíveis (tokens Meta, appId, wabaId) são buscadas automaticamente no backend
- O cliente só precisa fornecer o token do tenant
- Rate limiting configurado para prevenir abuso
- Helmet.js para segurança de headers HTTP
- CORS habilitado

## Estrutura do Projeto

```
src/
├── controllers/       # Controladores das rotas
├── services/          # Serviços de integração com APIs externas
├── middlewares/       # Middlewares (autenticação, etc)
├── routes/            # Definição de rotas
├── config/            # Configurações
└── server.js          # Arquivo principal
```

## Tratamento de Erros

A API retorna erros em formato JSON padronizado:

```json
{
  "success": false,
  "error": "Descrição do erro",
  "message": "Mensagem detalhada"
}
```

## Códigos de Status HTTP

- `200` - Sucesso
- `400` - Requisição inválida (parâmetros faltando ou inválidos)
- `401` - Não autorizado (token inválido ou ausente)
- `404` - Rota não encontrada
- `429` - Muitas requisições (rate limit excedido)
- `500` - Erro interno do servidor

## Licença

ISC
