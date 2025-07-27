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

The AI agent page now uses a centralized configuration system. Edit `frontend/config/api-config.js` to update the API URLs:

For production deployment, update the production section:
```javascript
production: {
    AI_API_BASE_URL: 'https://your-backend-subdomain.com/api/ai',
    MAIN_API_BASE_URL: 'https://your-backend-subdomain.com/api',
    ENVIRONMENT: 'production'
}
```

The system automatically detects the environment based on the hostname.

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
- **Consistent Design**: Matches the site's white-blue theme and layout patterns
- **Responsive Layout**: Mobile-friendly with proper breakpoints
- **Hero Section**: Clean introduction with status indicator
- **Panel-based Layout**: Follows the site's card/panel design system
- **Form Integration**: Uses the site's standard form styling
- **Navigation Integration**: Properly integrated with site header and footer
- **Mode Switching**: Toggle between Chat and Agent modes
- **Real-time Interface**: Smooth animations and loading states

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure `KIMI_API_KEY` is properly set in your `.env` file
2. **CORS Issues**: Backend is configured to allow requests from common development ports
3. **Connection Issues**: Check that both frontend and backend are running and accessible
4. **Deployment Errors**: The system now gracefully handles missing API keys during deployment

### Deployment-Safe Architecture

The AI agent system is designed to be deployment-safe:

- **Graceful Degradation**: If `KIMI_API_KEY` is not set, the service loads fallback endpoints
- **Lazy Loading**: OpenAI client is only initialized when actually needed
- **Error Handling**: Import errors won't crash the entire application
- **Fallback Service**: Provides informative responses when AI service is not configured

### Debug Mode

Set `DEBUG=True` in your `.env` file for detailed error messages.

### Health Check

Visit `http://your-backend-url/api/ai/health` to verify the AI service is working correctly.

### Deployment Status Messages

The backend will show one of these messages on startup:

- `✅ AI Agent service loaded successfully` - Full AI functionality available
- `✅ AI Agent fallback service loaded` - Fallback mode (configuration needed)
- `⚠️ Warning: KIMI_API_KEY not found` - Service available but needs configuration

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for production deployment
- Consider rate limiting for production use
- Implement authentication for sensitive deployments

## Dependencies

### Backend
- FastAPI
- OpenAI Python client (v1.51.2+)
- LangChain (optional, for advanced features)
- Python-dotenv
- Uvicorn

**Note**: The system is designed to work even if the OpenAI library is not available or if the API key is not configured.

### Frontend
- Pure HTML/CSS/JavaScript (no framework dependencies)
- Modern browser with ES6+ support
- Fetch API support 