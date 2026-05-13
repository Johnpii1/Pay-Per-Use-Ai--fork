"""
FastAPI application core.
Initializes the router configuration, database, and health endpoints.
Starts the blockchain event listener on startup.
Adds SIWA auth routes and rate limiting.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import asyncio
import os

from app.config import settings
from app.database import init_db
from app.routes import services, payment, query, chat, wallet, image, marketplace, users
from app.routes.auth import router as auth_router
from app.routes.session import router as session_router
from app.core.limiter import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events spanning the duration of the App."""
    await init_db()

    # Start blockchain event listener (oracle pattern)
    from app.services.event_listener import event_listener
    listener_task = asyncio.create_task(event_listener.start())

    print("PayPerAI Backend running")
    print(f"Network: {settings.algorand_network}")
    print(f"Database: PostgreSQL")
    yield

    # Cleanup: stop event listener
    await event_listener.stop()
    listener_task.cancel()

    # Close database pool
    from app.database import close_pool
    await close_pool()


app = FastAPI(
    title="PayPerAI — Blockchain-Gated AI API",
    version="3.0.0",
    docs_url="/docs",
    lifespan=lifespan
)

# ── Rate Limiter Middleware ──────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ─────────────────────────────────────────────────────
raw_origins = settings.cors_origins.split(",")
origins = [o.strip() for o in raw_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,          # Required for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "PayPerAI Backend API is live!",
        "version": "3.0.0",
        "architecture": "Web3 + SIWA Security",
        "docs": "/docs",
        "health": "/health"
    }


# ── Auth Routes (SIWA) ───────────────────────────────────────
app.include_router(auth_router, prefix="/api/v1")

# ── Feature Routes ───────────────────────────────────────────
app.include_router(services.router, prefix="/api/v1")
app.include_router(payment.router, prefix="/api/v1")
app.include_router(query.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(wallet.router, prefix="/api/v1")
app.include_router(image.router, prefix="/api/v1")
app.include_router(marketplace.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(session_router, prefix="/api/v1")

# ── Static Files ─────────────────────────────────────────────
os.makedirs("static/nfts", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "version": "3.0.0",
        "architecture": "web3+siwa",
        "database": "postgresql",
        "network": settings.algorand_network,
        "app_id": settings.algorand_app_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
