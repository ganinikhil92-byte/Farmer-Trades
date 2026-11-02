"""Nuclear wipe: delete ALL listings and orders from ALL database files."""
from sqlalchemy import create_engine, text
import os

db_files = [
    "./agro_trades.db",
    "../agro_trades.db",
]

for db_path in db_files:
    abs_path = os.path.abspath(db_path)
    if not os.path.exists(abs_path):
        print(f"SKIP (not found): {abs_path}")
        continue
    
    print(f"\n--- Cleaning: {abs_path} ---")
    e = create_engine(f"sqlite:///{abs_path}")
    conn = e.connect()
    
    # Check what tables exist
    tables = [r[0] for r in conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'")).fetchall()]
    print(f"  Tables: {tables}")
    
    if "listings" in tables:
        before = conn.execute(text("SELECT COUNT(*) FROM listings")).scalar()
        conn.execute(text("DELETE FROM listings"))
        print(f"  Deleted {before} listings")
    
    if "orders" in tables:
        before = conn.execute(text("SELECT COUNT(*) FROM orders")).scalar()
        conn.execute(text("DELETE FROM orders"))
        print(f"  Deleted {before} orders")
    
    conn.commit()
    
    # Verify
    if "listings" in tables:
        remaining = conn.execute(text("SELECT COUNT(*) FROM listings")).scalar()
        print(f"  Remaining listings: {remaining}")
    if "orders" in tables:
        remaining = conn.execute(text("SELECT COUNT(*) FROM orders")).scalar()
        print(f"  Remaining orders: {remaining}")
    
    conn.close()
    e.dispose()

print("\n=== ALL DATABASES WIPED CLEAN ===")
