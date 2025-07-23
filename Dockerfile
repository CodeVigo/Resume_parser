# ----------------------------
#  Base image with Node.js 20
# ----------------------------
FROM node:20-slim

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install any extra system deps (if needed)
# RUN apt-get update && apt-get install -y --no-install-recommends <your-packages> && rm -rf /var/lib/apt/lists/*

# ----------------------------
#  Set working dir
# ----------------------------
WORKDIR /app

# ----------------------------
#  1) Install backend deps
# ----------------------------
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# ----------------------------
#  2) Install frontend deps
# ----------------------------
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# ----------------------------
#  3) Copy sources + scripts
# ----------------------------
COPY backend/.env ./backend/.env
COPY start.sh ./start.sh
RUN chmod +x ./start.sh
COPY . .

# ----------------------------
#  4) Expose ports
# ----------------------------
EXPOSE 5000 3000

# ----------------------------
#  5) Override default ENTRYPOINT
# ----------------------------
ENTRYPOINT []

# ----------------------------
#  6) Start both dev servers
# ----------------------------
CMD ["./start.sh"]
