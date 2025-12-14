# Dockerfile for Sweet Shop Backend (FastAPI)
# This Dockerfile is designed for Railway deployment
# Railway builds from the repository root, so all paths are relative to root
#
# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONPATH=/app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first (for better layer caching)
# Path is relative to repository root (Railway's build context)
COPY backend/app/requirements.txt /app/requirements.txt

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r /app/requirements.txt && \
    rm /app/requirements.txt

# Copy backend application code
# Copy the entire backend directory structure
COPY backend/app/ /app/app/
COPY backend/alembic/ /app/alembic/
COPY backend/alembic.ini /app/alembic.ini
COPY backend/scripts/ /app/scripts/

# Create directory for database (if using SQLite)
RUN mkdir -p /app/data

# Expose port (Railway will provide PORT env var, default to 8000)
EXPOSE 8000

# Health check (uses PORT env var or defaults to 8000)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import os, urllib.request; port = os.getenv('PORT', '8000'); urllib.request.urlopen(f'http://localhost:{port}/')" || exit 1

# Run database migrations and start the application
# Alembic runs from /app (where alembic.ini is located)
# Uvicorn runs with app.main:app since we're in /app and app is a package
# Railway provides PORT environment variable, default to 8000 if not set
# Use exec form to ensure proper signal handling
CMD sh -c "cd /app && echo 'Running migrations...' && alembic upgrade head && PORT=\${PORT:-8000} && echo \"Starting server on port \$PORT\" && uvicorn app.main:app --host 0.0.0.0 --port \$PORT"

