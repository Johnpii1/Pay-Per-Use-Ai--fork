"""
Async SQLite DB adapter using aiosqlite.
"""
import aiosqlite

DB_PATH = "payper.db"

async def init_db():
    """
    Creates necessary tables on startup if they don't exist.
    """
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                service_id TEXT NOT NULL,
                wallet_address TEXT NOT NULL,
                prompt TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL
            )
        ''')
        await db.execute('''
            CREATE TABLE IF NOT EXISTS query_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL REFERENCES sessions(session_id),
                tx_group_id TEXT,
                ai_response TEXT,
                tokens_used INTEGER DEFAULT 0,
                completed_at TEXT
            )
        ''')
        await db.commit()

async def create_session(session_id: str, service_id: str, wallet_address: str, prompt: str, expires_at: str):
    """
    Inserts a newly generated session into SQLite database.
    """
    from datetime import datetime, timezone
    created_at = datetime.now(timezone.utc).isoformat()
    
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            INSERT INTO sessions(session_id, service_id, wallet_address, prompt, status, created_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (session_id, service_id, wallet_address, prompt, "pending", created_at, expires_at))
        await db.commit()

async def get_session(session_id: str) -> dict:
    """
    Fetches a session row back as a dictionary or None.
    """
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM sessions WHERE session_id = ?", (session_id,)) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

async def update_session_status(session_id: str, status: str):
    """
    Updates the string enum status of a given session.
    """
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("UPDATE sessions SET status = ? WHERE session_id = ?", (status, session_id))
        await db.commit()

async def save_query_result(session_id: str, tx_group_id: str, ai_response: str, tokens_used: int):
    """
    Links a consumed session to a completed query_log.
    """
    from datetime import datetime, timezone
    completed_at = datetime.now(timezone.utc).isoformat()
    
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            INSERT INTO query_log (session_id, tx_group_id, ai_response, tokens_used, completed_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (session_id, tx_group_id, ai_response, tokens_used, completed_at))
        await db.commit()

async def is_tx_already_used(tx_group_id: str) -> bool:
    """
    Prevents replay attacks by checking if a tx_group_id is already stored in the DB.
    """
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT 1 FROM query_log WHERE tx_group_id = ?", (tx_group_id,)) as cursor:
            row = await cursor.fetchone()
            return row is not None
