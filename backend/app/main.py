import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import auth, sweets

app = FastAPI(title="Sweet Shop API")

# Configure CORS (Cross-Origin Resource Sharing)
# This allows our React frontend (running on a different port) to talk to the backend
# In production, allow all origins or specify Railway domain
origins = [
    "http://localhost:5173", # Vite default port
    "http://localhost:3000", # Common React port
]

# Allow Railway domain in production (or set via RAILWAY_PUBLIC_DOMAIN env var)
railway_domain = os.getenv("RAILWAY_PUBLIC_DOMAIN")
if railway_domain:
    origins.append(f"https://{railway_domain}")
    origins.append(f"http://{railway_domain}")
elif os.getenv("RAILWAY_ENVIRONMENT"):
    # In Railway but no domain specified, allow all origins
    # Note: allow_credentials must be False when origins=["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    # Skip the second middleware addition below
    origins = None

if origins is not None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers with /api prefix
app.include_router(auth.router)
app.include_router(sweets.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Sweet Shop API"}