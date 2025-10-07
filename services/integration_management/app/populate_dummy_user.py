# app/populate_dummy_user.py
import asyncio
from sqlalchemy import text, Column, Integer
from sqlalchemy.exc import ProgrammingError
from app.db import engine, Base

async def add_user_id_column():
    async with engine.begin() as conn:
        # ---------------------------
        # 1️⃣ Check if column exists
        # ---------------------------
        result = await conn.run_sync(
            lambda sync_conn: sync_conn.execute(
                text("""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name='users' AND column_name='user_id';
                """)
            ).fetchone()
        )

        if result:
            print("✅ Column 'user_id' already exists in 'users' table.")
        else:
            # ---------------------------
            # 2️⃣ Add the column
            # ---------------------------
            try:
                await conn.run_sync(
                    lambda sync_conn: sync_conn.execute(
                        text("ALTER TABLE users ADD COLUMN user_id INTEGER UNIQUE;")
                    )
                )
                print("✅ Column 'user_id' added to 'users' table.")
            except ProgrammingError as e:
                print(f"❌ Error adding column: {e}")

        # ---------------------------
        # 3️⃣ Populate dummy user_id values 1–50
        # ---------------------------
        for i in range(1, 51):
            await conn.run_sync(
                lambda sync_conn, i=i: sync_conn.execute(
                    text("""
                        WITH cte AS (
                            SELECT id
                            FROM users
                            WHERE user_id IS NULL
                            ORDER BY id
                            LIMIT 1
                        )
                        UPDATE users
                        SET user_id = :i
                        FROM cte
                        WHERE users.id = cte.id;
                    """),
                    {"i": i}
                )
            )

        print("✅ Dummy user_id values 1–50 populated successfully.")

# ---------------------------
# Run the script
# ---------------------------
if __name__ == "__main__":
    asyncio.run(add_user_id_column())
