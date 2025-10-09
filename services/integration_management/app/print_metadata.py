# app/print_metadata.py
from app.models.base import Base

print("📋 Registered tables in Base.metadata:")
for table_name in Base.metadata.tables.keys():
    print(f" - {table_name}")

if not Base.metadata.tables:
    print("⚠️ No tables registered! Check model imports.")
