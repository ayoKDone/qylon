
import asyncio
from app.db import init_db

async def main():
    await init_db(drop=False)  # Just create tables without dropping

if __name__ == "__main__":
    asyncio.run(main())
