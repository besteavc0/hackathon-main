import os
import asyncpg
from typing import List, Dict, Any, Optional

class Database:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        if self.pool is not None:
            return
            
        connection_string = os.getenv("DATABASE_URL")
        if not connection_string:
            print("DATABASE_URL is not set, running without DB")
            return
            
        # Simplified SSL logic similar to TS
        ssl_ctx = False if "localhost" in connection_string or "127.0.0.1" in connection_string else True
        
        try:
            if ssl_ctx:
                import ssl
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                self.pool = await asyncpg.create_pool(connection_string, ssl=ctx, min_size=1, max_size=10)
            else:
                self.pool = await asyncpg.create_pool(connection_string, min_size=1, max_size=10)
        except Exception as e:
            print(f"Failed to connect to database: {e}")

    async def disconnect(self):
        if self.pool is not None:
            await self.pool.close()

    async def query(self, text: str, *params) -> List[Dict[str, Any]]:
        if not self.pool:
            return []
        async with self.pool.acquire() as connection:
            records = await connection.fetch(text, *params)
            return [dict(record) for record in records]

db = Database()

async def get_db():
    if db.pool is None:
        await db.connect()
    return db
