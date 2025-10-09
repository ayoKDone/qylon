import asyncio
from sqlalchemy import inspect
from app.db import engine

async def show_tables():
    async with engine.begin() as conn:
        def get_tables(sync_conn):
            inspector = inspect(sync_conn)
            return inspector.get_table_names()

        tables = await conn.run_sync(get_tables)
        print("✅ Tables in the database:")
        for table in tables:
            print(f" - {table}")

if __name__ == "__main__":
    asyncio.run(show_tables())
