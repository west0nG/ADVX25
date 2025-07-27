from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os
from typing import List, Dict, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor
from app.config import KIMI_API_KEY, KIMI_BASE_URL, KIMI_MODEL

router = APIRouter()

# Initialize OpenAI client for Kimi API
client = None
if KIMI_API_KEY:
    client = OpenAI(
        api_key=KIMI_API_KEY,
        base_url=KIMI_BASE_URL,
    )
else:
    print("⚠️  Warning: KIMI_API_KEY not found. AI Agent endpoints will not work until configured.")

# Pydantic models for request/response
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

# Thread pool for running blocking operations
executor = ThreadPoolExecutor(max_workers=4)

def _call_kimi_api(messages: List[Dict], temperature: float = 0.6) -> str:
    """Synchronous function to call Kimi API"""
    if not client:
        raise HTTPException(status_code=503, detail="AI service not configured. Please set KIMI_API_KEY in environment variables.")
    
    try:
        completion = client.chat.completions.create(
            model=KIMI_MODEL,
            messages=messages,
            temperature=temperature,
        )
        return completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI API Error: {str(e)}")

async def call_kimi_api_async(messages: List[Dict], temperature: float = 0.6) -> str:
    """Async wrapper for Kimi API call"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _call_kimi_api, messages, temperature)

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """
    Simple chat endpoint for conversing with the AI agent
    """
    try:
        # Prepare messages for API
        messages = [
            {
                "role": "system", 
                "content": "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。"
            }
        ]
        
        # Add conversation history
        for msg in request.history:
            messages.append({"role": msg.role, "content": msg.content})
        
        # Add current user message
        messages.append({"role": "user", "content": request.message})
        
        # Call AI API
        response = await call_kimi_api_async(messages, request.temperature)
        
        # Build response with updated history
        updated_history = request.history + [
            ChatMessage(role="user", content=request.message),
            ChatMessage(role="assistant", content=response)
        ]
        
        return ChatResponse(
            response=response,
            full_history=updated_history
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@router.post("/agent", response_model=AgentResponse)
async def run_agent_task(request: AgentRequest):
    """
    Advanced agent endpoint that can perform complex tasks with reasoning
    """
    try:
        # Enhanced system prompt for agent-like behavior
        system_prompt = """你是一个高级AI助手，具有以下能力：
1. 分析复杂任务并制定解决方案
2. 提供详细的推理过程
3. 给出实用的建议和后续步骤
4. 支持中英文对话

请对用户的任务进行分析，提供解决方案，并说明你的推理过程。"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"任务: {request.task}\n上下文: {request.context}"}
        ]
        
        # Call AI API
        response = await call_kimi_api_async(messages, request.temperature)
        
        # Parse response to extract reasoning and suggestions
        # This is a simple implementation - you could make it more sophisticated
        lines = response.split('\n')
        reasoning = ""
        suggestions = []
        
        for line in lines:
            if line.strip().startswith(('建议:', '建议：', 'Suggestion:', 'Suggestions:')):
                suggestions.append(line.strip())
            elif line.strip().startswith(('推理:', '推理：', 'Reasoning:', 'Analysis:')):
                reasoning = line.strip()
        
        if not reasoning:
            reasoning = "基于提供的信息进行分析和处理"
        
        return AgentResponse(
            result=response,
            reasoning=reasoning,
            suggestions=suggestions if suggestions else ["继续探索相关主题", "寻求更多具体信息"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

@router.get("/health")
async def health_check():
    """
    Health check endpoint for the AI agent service
    """
    try:
        # Test API connection with a simple message
        test_messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello"}
        ]
        
        response = await call_kimi_api_async(test_messages)
        
        return {
            "status": "healthy",
            "api_connection": "active",
            "test_response_length": len(response)
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "api_connection": "failed"
        } 