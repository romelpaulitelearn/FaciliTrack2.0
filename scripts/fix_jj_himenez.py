import sqlite3

conn = sqlite3.connect(r"backend/facilitrack_local.db")
row = conn.execute(
    "SELECT id, name, username, facilities, status FROM admins WHERE username = ?",
    ("jj.himenez",),
).fetchone()
print("before:", row)

if row:
    conn.execute(
        "UPDATE admins SET facilities = ? WHERE username = ?",
        ("Computer Laboratory", "jj.himenez"),
    )
else:
    conn.execute(
        "INSERT INTO admins (name, email, username, password, facilities, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (
            "Jose Himenez",
            "jj.himenez@school.edu",
            "jj.himenez",
            "ChangeMe123!",
            "Computer Laboratory",
            "Active",
            "2026-01-01T00:00:00",
            "2026-01-01T00:00:00",
        ),
    )

conn.commit()
print("after:", conn.execute(
    "SELECT id, name, username, facilities, status FROM admins WHERE username = ?",
    ("jj.himenez",),
).fetchall())
conn.close()
