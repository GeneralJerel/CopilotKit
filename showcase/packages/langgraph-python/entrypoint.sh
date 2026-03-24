#!/bin/bash
set -e

# Start LangGraph agent server (port 8123)
langgraph dev --config langgraph.json --host 0.0.0.0 --port 8123 &

# Start Next.js frontend (port 3000)
npx next start --port 3000 &

# Wait for either process to exit
wait -n
exit $?
