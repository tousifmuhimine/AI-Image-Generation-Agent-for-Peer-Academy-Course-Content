from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from fastapi.concurrency import run_in_threadpool
from agent.pipeline import generate_visual_plan_sync

class RequestModel(BaseModel):
    course: str
    module: str
    lesson: str
    content: str
    objective: str
    level: str
    purpose: str
    style: str
    placement: str
    provider: Optional[str] = "mock"
    gemini_key: Optional[str] = None
    gemini_model: Optional[str] = None
    gemini_image_model: Optional[str] = None
    openai_key: Optional[str] = None
    openai_model: Optional[str] = None
    openai_image_model: Optional[str] = None
    groq_key: Optional[str] = None
    anthropic_key: Optional[str] = None
    hf_token: Optional[str] = None
    openrouter_key: Optional[str] = None
    nvidia_key: Optional[str] = None
    seed: Optional[int] = None

app = FastAPI(title="Peer Academy Image Agent")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/generate")
async def generate(req: RequestModel):
    try:
        result = await run_in_threadpool(generate_visual_plan_sync, req.dict())
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

