import os
import shutil
import sqlite3
import subprocess
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL_DB_PATH = os.path.join(PROJECT_ROOT, "backend", "facilitrack_local.db")
DB_NAME = os.getenv("D1_DATABASE_NAME", "facilitrack-db")


def resolve_npx_command() -> list[str]:
    candidates = ["npx", "npx.cmd", "pnpm", "pnpm.cmd"]
    for candidate in candidates:
        resolved = shutil.which(candidate)
        if resolved:
            return [resolved]
    return ["npx"]


def sql_literal(value):
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def ensure_d1_table_exists(name: str, ddl: str) -> None:
    command = f"CREATE TABLE IF NOT EXISTS {name} ({ddl});"
    subprocess.run(
        resolve_npx_command() + ["wrangler", "d1", "execute", DB_NAME, "--command", command],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )


def sync_table(table_name: str, local_conn: sqlite3.Connection) -> list[str]:
    rows = local_conn.execute(f"SELECT * FROM {table_name}").fetchall()
    if not rows:
        return []

    columns = [col[1] for col in local_conn.execute(f"PRAGMA table_info({table_name})").fetchall()]
    if not columns:
        return []

    statements: list[str] = []
    for row in rows:
        values = []
        for index, value in enumerate(row):
            if columns[index] == "email" and value in (None, ""):
                values.append("''")
            else:
                values.append(sql_literal(value))

        if table_name == "super_admins":
            mapped = {
                "email": columns[1] if len(columns) > 1 else "email",
                "fullname": columns[2] if len(columns) > 2 else "fullname",
                "username": columns[3] if len(columns) > 3 else "username",
                "password": columns[4] if len(columns) > 4 else "password",
                "title": "'Super Admin'",
                "status": "'active'",
            }
            email = row[1] if len(row) > 1 else ""
            fullname = row[2] if len(row) > 2 else ""
            username = row[3] if len(row) > 3 else ""
            password_value = row[4] if len(row) > 4 else ""
            statement = (
                "INSERT INTO super_admins (email, fullname, username, password, title, status) "
                f"VALUES ({sql_literal(email)}, {sql_literal(fullname)}, {sql_literal(username)}, {sql_literal(password_value)}, 'Super Admin', 'active') "
                "ON CONFLICT(username) DO UPDATE SET "
                "email = excluded.email, fullname = excluded.fullname, password = excluded.password, title = excluded.title, status = excluded.status, updated_at = CURRENT_TIMESTAMP;"
            )
            statements.append(statement)
        elif table_name == "admins":
            email = row[1] if len(row) > 1 else ""
            fullname = row[0] if len(row) > 0 else ""
            username = row[2] if len(row) > 2 else ""
            password_value = row[3] if len(row) > 3 else ""
            facilities = row[4] if len(row) > 4 else ""
            status = row[5] if len(row) > 5 else "Active"
            statement = (
                "INSERT INTO admins (email, fullname, username, password, facilities_assign, status) "
                f"VALUES ({sql_literal(email)}, {sql_literal(fullname)}, {sql_literal(username)}, {sql_literal(password_value)}, {sql_literal(facilities)}, {sql_literal(status)}) "
                "ON CONFLICT(username) DO UPDATE SET "
                "email = excluded.email, fullname = excluded.fullname, password = excluded.password, facilities_assign = excluded.facilities_assign, status = excluded.status, updated_at = CURRENT_TIMESTAMP;"
            )
            statements.append(statement)
        elif table_name == "reservations":
            statement = "INSERT INTO reservations (" + ", ".join(columns) + ") VALUES (" + ", ".join(sql_literal(v) for v in row) + ") ON CONFLICT DO NOTHING;"
            statements.append(statement)

    return statements


def sync_local_db_to_d1() -> list[str]:
    if not os.path.exists(LOCAL_DB_PATH):
        raise FileNotFoundError(f"Local SQLite DB not found: {LOCAL_DB_PATH}")

    local_conn = sqlite3.connect(LOCAL_DB_PATH)
    tables = [row[0] for row in local_conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()]
    commands: list[str] = []

    try:
        if "super_admins" in tables:
            ensure_d1_table_exists(
                "super_admins",
                "id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, fullname TEXT NOT NULL, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, title TEXT DEFAULT 'Super Admin', status TEXT DEFAULT 'active', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            )
            commands.extend(sync_table("super_admins", local_conn))

        if "admins" in tables:
            ensure_d1_table_exists(
                "admins",
                "id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, fullname TEXT NOT NULL, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, facilities_assign TEXT NOT NULL, status TEXT DEFAULT 'active', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            )
            commands.extend(sync_table("admins", local_conn))

        if "reservations" in tables:
            ensure_d1_table_exists(
                "reservations",
                "id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, student_id TEXT NOT NULL, accountability_name TEXT NOT NULL, department TEXT NOT NULL, grade_course_year TEXT NOT NULL, phone_no TEXT NOT NULL, date_filed DATETIME DEFAULT CURRENT_TIMESTAMP, date_needed DATE NOT NULL, time_needed TEXT NOT NULL, facility TEXT NOT NULL, assigned_room TEXT, subject TEXT NOT NULL, total_students INTEGER NOT NULL, status TEXT DEFAULT 'pending', rejection_reason TEXT, admin_notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            )
            commands.extend(sync_table("reservations", local_conn))
    finally:
        local_conn.close()

    if not commands:
        return []

    command = "\n".join(commands)
    result = subprocess.run(
        resolve_npx_command() + ["wrangler", "d1", "execute", DB_NAME, "--command", command],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr or result.stdout or "Sync to Cloudflare D1 failed")
    return commands


def main() -> int:
    try:
        commands = sync_local_db_to_d1()
        print(f"Synced {len(commands)} rows to Cloudflare D1 ({DB_NAME}).")
        return 0
    except Exception as exc:
        print(f"Cloudflare sync failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
