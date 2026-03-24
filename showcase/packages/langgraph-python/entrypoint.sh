#!/bin/bash
set -e

# Start LangGraph agent server (port 8123)
# --no-browser prevents trying to open a browser in the container
python -m langgraph_cli dev \
  --config langgraph.json \
  --host 0.0.0.0 \
  --port 8123 \
  --no-browser &

# Start Next.js frontend (port 3000)
# Render expects the web service to listen on port 10000
PORT=${PORT:-3000}
npx next start --port $PORT &

# Wait for either process to exit
wait -n
exit $?
