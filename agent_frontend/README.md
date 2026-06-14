# Peer Academy Image Agent — Frontend (Next.js)

Minimal Next.js scaffold to interact with the external Python agent.

Quick start (from the `agent_frontend` folder):

```bash
# install deps
pnpm install    # or npm install
# run dev server
pnpm dev        # or npm run dev
```

The frontend provides a small form and posts to the backend `POST /generate` endpoint. Update `NEXT_PUBLIC_AGENT_API` or use a proxy during development.
