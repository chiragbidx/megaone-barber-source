FROM node:20-alpine

# Install git (needed for repo syncing)
RUN apk add --no-cache git

WORKDIR /app

# Copy only what we need for runtime (static files + scripts)
COPY . .

EXPOSE 8080

CMD ["node", "scripts/static-supervisor.js"]
