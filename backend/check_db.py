import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'facilitrack_local.db')

if not os.path.exists(DB_PATH):
    print(f"Database not found at: {DB_PATH}")
    raise SystemExit(1)

conn = sqlite3.connect(DB_PATH)
try:
    cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    if not tables:
        print("No tables found in the database.")
    else:
        print("Tables:")
        for row in tables:
            print(f"- {row[0]}")
finally:
    conn.close()
