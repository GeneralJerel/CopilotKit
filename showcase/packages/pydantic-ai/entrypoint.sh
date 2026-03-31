#!/bin/bash
set -e

# Start agent backend
python -m uvicorn agent_server:app --host 0.0.0.0 --port 8000 &

# Start Next.js frontend
npx next start --port 3000 &

# Wait for either process to exit
wait -n
exit $?
