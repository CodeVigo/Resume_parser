#!/usr/bin/env sh

# Start backend (nodemon) in background
cd backend
npm run dev &
BACKEND_PID=$!

# Start frontend (Vite) in foreground
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both to exit
wait $BACKEND_PID
wait $FRONTEND_PID
