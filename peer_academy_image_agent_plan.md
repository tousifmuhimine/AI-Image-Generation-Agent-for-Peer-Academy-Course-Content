# Peer Academy AI Image Generation Agent Plan

## Goal
Build an external AI agent that analyzes Peer Academy course content and generates structured image plans for educational visuals.

## Recommended Architecture
- External Python backend for the agent logic
- FastAPI for the API layer
- Environment variables for all API keys and configuration
- Optional lightweight frontend only if an admin UI is needed
- Later integration into the existing site through API, iframe, or embed script

## Core Pipeline
### Stage 1: Content Analyzer
Analyze the lesson content, learning objective, learner level, and image purpose.

### Stage 2: Visual Planner
Choose the best visual concept, visual style, placement, and aspect ratio.

### Stage 3: Prompt Generator
Generate the final image prompt, negative prompt, alt text, safety check, and relevance score.

## Expected Input Fields
1. Course title
2. Module title
3. Lesson title
4. Lesson content
5. Learning objective
6. Target learner level
7. Image purpose
8. Preferred visual style
9. Platform placement

## Expected Output Fields
1. Image concept
2. Image prompt
3. Negative prompt
4. Image purpose
5. Recommended aspect ratio
6. Suggested placement
7. Alt text
8. Safety check result
9. Course relevance score
10. Optional generated image URL

## Implementation Phases
### Phase 1: External Agent Backend
- Set up Python project structure
- Add API endpoint for agent requests
- Store secrets in environment variables
- Return structured JSON output only

### Phase 2: Safety and Scoring
- Validate educational suitability
- Compute relevance score from lesson alignment
- Keep output format stable

### Phase 3: Optional Image API
- Connect DALL·E, Stable Diffusion, Replicate, or Fal.ai
- Return image URL when enabled

### Phase 4: Optional Admin UI
- Build a simple review interface only if needed
- Keep the main agent API independent from the UI

## Recommendation
Build the agent externally first. Do not hardcode it into the existing site until the backend and pipeline are stable.
