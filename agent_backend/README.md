# Peer Academy — AI Image Generation Agent (Backend)

This is a minimal external Python backend for the Peer Academy Image Generation Agent.

Core features:
- FastAPI HTTP endpoint at `POST /generate`
- 3-stage pipeline (Content Analyzer, Visual Planner, Prompt Generator)
- Environment variable support for `ANTHROPIC_API_KEY`
- Offline mock output when no API key is provided

Quick start (Windows PowerShell):

```powershell
cd agent_backend
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
# Optionally set your Anthropic key
$env:ANTHROPIC_API_KEY = "sk-ant-..."
uvicorn main:app --reload --port 8000
```

Example request:

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"course":"Intro to Python","module":"Vars","lesson":"What is a variable?","content":"A variable stores a value","objective":"Students will learn variables","level":"Beginner","purpose":"Lesson visual","style":"Flat illustration","placement":"Inline"}'
```

The service returns the 10-field structured JSON described in the project plan. If `ANTHROPIC_API_KEY` is not set, a deterministic mock response will be returned for testing.

Using Hugging Face Inference (recommended free option)

You can use the Hugging Face Inference API for analysis, planning, and prompt generation without Anthropic. Create a token at https://huggingface.co/settings/tokens and set it in `agent_backend/.env` as `HF_TOKEN` (or export the env var). Optionally set `HF_MODEL` to a preferred text model. The pipeline will prefer `HF_TOKEN` when present, then fall back to Anthropic, then to mock output.

Example `.env` (copy from `.env.example`):

```
HF_TOKEN=hf_...yourtoken...
HF_MODEL=google/flan-t5-large
ANTHROPIC_API_KEY=
```
