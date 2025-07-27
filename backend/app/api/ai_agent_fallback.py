from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

# Fallback router for when AI service is not available
router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    temperature: float = 0.6

class ChatResponse(BaseModel):
    response: str
    full_history: List[ChatMessage]

class AgentRequest(BaseModel):
    task: str
    context: str = ""
    temperature: float = 0.6

class AgentResponse(BaseModel):
    result: str
    reasoning: str
    suggestions: List[str] = []

@router.post("/chat", response_model=ChatResponse)
async def chat_fallback(request: ChatRequest):
    """Fallback chat endpoint when AI service is not configured"""
    response_text = "I'm currently not configured properly. Please check that the KIMI_API_KEY is set in the environment variables. Contact your administrator to enable AI functionality."
    
    updated_history = request.history + [
        ChatMessage(role="user", content=request.message),
        ChatMessage(role="assistant", content=response_text)
    ]
    
    return ChatResponse(
        response=response_text,
        full_history=updated_history
    )

@router.post("/agent", response_model=AgentResponse)
async def agent_fallback(request: AgentRequest):
    """Fallback agent endpoint when AI service is not configured"""
    return AgentResponse(
        result="AI Agent service is currently not configured. Please set up the KIMI_API_KEY environment variable to enable AI functionality.",
        reasoning="Service configuration required",
        suggestions=[
            "Contact your administrator to configure AI service",
            "Check that KIMI_API_KEY is properly set in environment variables"
        ]
    )

@router.get("/health")
async def health_fallback():
    """Fallback health check"""
    return {
        "status": "service_unavailable",
        "error": "AI service not configured",
        "api_connection": "not_configured",
        "message": "Please set KIMI_API_KEY environment variable"
    } 