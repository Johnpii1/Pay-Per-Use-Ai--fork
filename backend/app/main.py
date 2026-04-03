"""
FastAPI application core.
Initializes the router configuration, database, and health endpoints.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import os

from app.config import settings
from app.database import init_db
from app.routes import services, payment, query, chat, wallet, image

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events spanning the duration of the App."""
    await init_db()
    
    print("🚀 PayPerAI Backend running")
    print(f"📡 Network: {settings.algorand_network}")
    yield

app = FastAPI(
    title="PayPerAI — Blockchain-Gated AI API",
    version="1.0.0",
    docs_url="/docs",
    lifespan=lifespan
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(services.router, prefix="/api/v1")
app.include_router(payment.router, prefix="/api/v1")
app.include_router(query.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(wallet.router, prefix="/api/v1")
app.include_router(image.router, prefix="/api/v1")

# Mount static files to serve NFT images
os.makedirs("static/nfts", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/health")
async def health_check():
    """Returns basic metrics including blockchain environment info."""
    return {
        "status": "ok",
        "network": settings.algorand_network,
        "app_id": settings.algorand_app_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
