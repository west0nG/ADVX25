# AI Agent Setup Guide

This guide explains how to set up and deploy the AI Agent feature for BarsHelpBars.

## Features

- **Chat Mode**: Interactive conversation with Kimi AI
- **Agent Mode**: Task-oriented AI assistance with reasoning and suggestions
- **Modern UI**: Responsive chat interface with real-time messaging
- **Separate Deployment**: Backend and frontend can be deployed on different subdomains

## Backend Setup

### 1. Environment Configuration

Create a `.env` file in the `backend/` directory with your Kimi API key:

```env
# Database Configuration
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=barshelpbars_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# IPFS Configuration (Pinata)
PINATA_JWT=your_pinata_jwt_token
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret

# AI Agent Configuration (Kimi API)
KIMI_API_KEY=sk-UqeJ0B8kNqr2zVAEckNiZ6NATeN8YMXCFmCdou1kk15g0XhQ
KIMI_BASE_URL=https://api.moonshot.cn/v1
KIMI_MODEL=kimi-k2-0711-preview

# Other Configuration
DEBUG=True
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Run Backend Server

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at `http://localhost:8000`

## Frontend Setup

### 1. Update API Configuration

Edit `frontend/pages/ai-agent.html` and update the `apiBaseUrl` on line 301:

For local development:
```javascript
this.apiBaseUrl = 'http://localhost:8000/api/ai';
```

For production deployment:
```javascript
this.apiBaseUrl = 'https://your-backend-subdomain.com/api/ai';
```

### 2. Serve Frontend

```bash
cd frontend
python -m http.server 8000
```

Or deploy to your frontend subdomain.

## API Endpoints

### Chat Endpoint
- **URL**: `/api/ai/chat`
- **Method**: `POST`
- **Purpose**: Interactive conversation with AI

**Request Body**:
```json
{
  "message": "Hello, how are you?",
  "history": [],
  "temperature": 0.6
}
```

**Response**:
```json
{
  "response": "AI response message",
  "full_history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "AI response"}
  ]
}
```

### Agent Endpoint
- **URL**: `/api/ai/agent`
- **Method**: `POST`
- **Purpose**: Task-oriented AI assistance

**Request Body**:
```json
{
  "task": "Help me create a marketing plan",
  "context": "For a cocktail NFT marketplace",
  "temperature": 0.6
}
```

**Response**:
```json
{
  "result": "Detailed task response",
  "reasoning": "AI reasoning process",
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}
```

### Health Check
- **URL**: `/api/ai/health`
- **Method**: `GET`
- **Purpose**: Check AI service status

## Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   Subdomain     │    │   Subdomain     │
│                 │    │                 │
│ ai.yoursite.com │───▶│api.yoursite.com │
│                 │    │                 │
│  Static Files   │    │  FastAPI + AI   │
└─────────────────┘    └─────────────────┘
```

## Features Overview

### Chat Mode
- Real-time conversation with Kimi AI
- Conversation history maintained
- Adjustable temperature settings
- Responsive chat interface

### Agent Mode
- Task-oriented AI assistance
- Structured responses with reasoning
- Actionable suggestions
- Complex problem solving

### UI Features
- Modern, responsive design
- Real-time typing indicators
- Message history
- Temperature control
- Mode switching (Chat/Agent)
- Mobile-friendly interface

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure `KIMI_API_KEY` is properly set in your `.env` file
2. **CORS Issues**: Backend is configured to allow requests from common development ports
3. **Connection Issues**: Check that both frontend and backend are running and accessible

### Debug Mode

Set `DEBUG=True` in your `.env` file for detailed error messages.

### Health Check

Visit `http://your-backend-url/api/ai/health` to verify the AI service is working correctly.

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for production deployment
- Consider rate limiting for production use
- Implement authentication for sensitive deployments

## Dependencies

### Backend
- FastAPI
- OpenAI Python client
- LangChain (optional, for advanced features)
- Python-dotenv
- Uvicorn

### Frontend
- Pure HTML/CSS/JavaScript (no framework dependencies)
- Modern browser with ES6+ support
- Fetch API support 