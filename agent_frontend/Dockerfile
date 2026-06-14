FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Set env for backend endpoint during build time
ARG NEXT_PUBLIC_AGENT_API=http://localhost:8000
ENV NEXT_PUBLIC_AGENT_API=$NEXT_PUBLIC_AGENT_API

# Ensure Next.js binds to 0.0.0.0 and port 3000 inside the container
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
