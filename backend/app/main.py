from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings

app = FastAPI(title="Sweet Shop API")

# Configure CORS (Cross-Origin Resource Sharing)
# This allows our React frontend (running on a different port) to talk to the backend
origins = [
    "http://localhost:5173", # Vite default port
    "http://localhost:3000", # Common React port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Sweet Shop API"}