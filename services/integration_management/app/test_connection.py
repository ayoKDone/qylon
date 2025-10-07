# import asyncio
# import asyncpg

# async def main():
#     conn = await asyncpg.connect(
#         user="postgres.tkfpqtsbibhwlnlbbvic",
#         password="Ayo2025?$$@",
#         database="postgres",
#         host="aws-1-eu-west-2.pooler.supabase.com",
#         port=6543,
#         ssl="require"
#     )
#     print("✅ Connected to Supabase successfully!")
#     await conn.close()

# asyncio.run(main())



# import asyncio, socket, asyncpg

# async def test():
#     addr_info = socket.getaddrinfo("aws-1-eu-west-2.pooler.supabase.com", 6543, socket.AF_INET)
#     ip = addr_info[0][4][0]
#     print("Resolved address:", ip)

#     conn = await asyncpg.connect(
#         user="postgres.tkfpqtsbibhwlnlbbvic",
#         password="Ayo2025?$$@",
#         database="postgres",
#         host=ip,
#         port=6543
#     )
#     print("✅ Connected via IPv4 successfully!")
#     await conn.close()

# asyncio.run(test())

# import asyncio
# from sqlalchemy.ext.asyncio import create_async_engine

# async def list_tables():
#     engine = create_async_engine(settings.encoded_database_url)
#     async with engine.connect() as conn:
#         result = await conn.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
#         tables = [row[0] for row in result.fetchall()]
#         print("Tables in database:", tables)
#     await engine.dispose()

# asyncio.run(list_tables())

from dotenv import load_dotenv
import os

# Load your specific .env explicitly
dotenv_path = r"C:\Users\HP\Desktop\qylon\services\integration_management\.env"
load_dotenv(dotenv_path, override=True)

print("DATABASE_URL =", os.getenv("DATABASE_URL"))
