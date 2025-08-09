#!/bin/bash

# Get port from environment variable or use default 8000
PORT=${PORT:-8000}

# Start the FastAPI application with uvicorn
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT