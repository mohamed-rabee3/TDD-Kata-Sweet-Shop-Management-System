# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Set working directory (this will be the backend directory)
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

# Copy requirements file
COPY app/requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy application code (backend directory structure)
COPY . .

# Create directory for database (if using SQLite)
RUN mkdir -p /app/data

# Expose port 8000
EXPOSE 8000

# Health check (optional - can be removed if not needed)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# Run database migrations and start the application
# Alembic runs from /app (where alembic.ini is located)
# Uvicorn runs with app.main:app since we're in /app and app is a package
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]

