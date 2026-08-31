import hashlib
import os
import sqlite3
import subprocess
import sys
from datetime import datetime
from typing import Literal, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(title="FaciliTrack Admin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = os.getenv("D1_DATABASE_NAME", "facilitrack-db")
LOCAL_DB_PATH = os.path.join(os.path.dirname(__file__), "facilitrack_local.db")


class AdminCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=6)
    facilities: list[str] = Field(default_factory=list)
    status: Literal["Active", "Inactive"] = "Active"


class AdminUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    facilities: Optional[list[str]] = None
    status: Optional[Literal["Active", "Inactive"]] = None


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class LoginResponse(BaseModel):
    id: str
    name: str
    username: str
    role: Literal["superadmin", "admin"]
    facility: Optional[str] = None


def find_d1_database_path() -> Optional[str]:
    candidate_roots = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".wrangler", "state", "v3", "d1"),
        os.path.expanduser("~/.wrangler/state/v3/d1"),
    ]

    for root in candidate_roots:
        if not os.path.exists(root):
            continue
        for current, _, files in os.walk(root):
            for file_name in files:
                if file_name.endswith(".sqlite") and not file_name.endswith((".sqlite-shm", ".sqlite-wal")):
                    return os.path.join(current, file_name)
    return None


def password_matches(stored_password: Optional[str], supplied_password: str) -> bool:
    if stored_password is None:
        return False

    stored = str(stored_password).strip()
    candidate = str(supplied_password).strip()

    if not stored or not candidate:
        return False

    if stored == candidate:
        return True

    for digest_name in ("sha256", "sha512"):
        digest = hashlib.new(digest_name, candidate.encode("utf-8")).hexdigest()
        if stored.lower() == digest:
            return True
        if stored.lower() == digest.upper():
            return True

    return False


def normalize_facility_value(value) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        candidates = [str(item).strip() for item in value if str(item).strip()]
        return candidates[0] if candidates else ""
    if isinstance(value, str):
        candidates = [item.strip() for item in value.split(",") if item.strip()]
        return candidates[0] if candidates else ""
    return str(value).strip()


def ensure_local_super_admin_table() -> None:
    conn = sqlite3.connect(LOCAL_DB_PATH)
    columns = conn.execute("PRAGMA table_info(super_admins)").fetchall()
    if not columns:
        conn.execute(
            """
            CREATE TABLE super_admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL DEFAULT '',
                fullname TEXT NOT NULL,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                title TEXT DEFAULT 'Super Admin',
                status TEXT NOT NULL DEFAULT 'active',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    conn.commit()
    conn.close()


def ensure_local_admin_table() -> None:
    conn = sqlite3.connect(LOCAL_DB_PATH)
    columns = conn.execute("PRAGMA table_info(admins)").fetchall()
    if not columns:
        conn.execute(
            """
            CREATE TABLE admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL DEFAULT '',
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                facilities TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Active',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
    else:
        existing = {column[1] for column in columns}
        if "email" not in existing:
            conn.execute("ALTER TABLE admins ADD COLUMN email TEXT NOT NULL DEFAULT ''")
    conn.commit()
    conn.close()


def seed_default_accounts() -> None:
    ensure_local_admin_table()
    ensure_local_super_admin_table()
    conn = sqlite3.connect(LOCAL_DB_PATH)
    default_rows = [
        (
            "super_admins",
            "superadmin",
            "Rommel Paulite",
            "superadmin@school.edu",
            "Superadmin123!",
            "Super Admin",
            "active",
        ),
        (
            "admins",
            "admin1",
            "Admin One",
            "admin1@school.edu",
            "ChangeMe123!",
            "Computer Laboratory",
            "Active",
        ),
        (
            "admins",
            "jj.himenez",
            "Jose Himenez",
            "jj.himenez@school.edu",
            "ChangeMe123!",
            "Computer Laboratory",
            "Active",
        ),
    ]

    for table_name, username, name, email, password_value, facility_or_title, status in default_rows:
        if table_name == "super_admins":
            existing = conn.execute("SELECT id FROM super_admins WHERE username = ?", (username,)).fetchone()
            if existing:
                conn.execute(
                    "UPDATE super_admins SET fullname = ?, email = ?, password = ?, title = ?, status = ?, updated_at = ? WHERE username = ?",
                    (name, email, password_value, facility_or_title, status, datetime.utcnow().isoformat(), username),
                )
            else:
                conn.execute(
                    "INSERT INTO super_admins (email, fullname, username, password, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (email, name, username, password_value, facility_or_title, status, datetime.utcnow().isoformat(), datetime.utcnow().isoformat()),
                )
        else:
            existing = conn.execute("SELECT id FROM admins WHERE username = ?", (username,)).fetchone()
            if existing:
                conn.execute(
                    "UPDATE admins SET name = ?, email = ?, password = ?, facilities = ?, status = ?, updated_at = ? WHERE username = ?",
                    (name, email, password_value, facility_or_title, status, datetime.utcnow().isoformat(), username),
                )
            else:
                conn.execute(
                    "INSERT INTO admins (name, email, username, password, facilities, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (name, email, username, password_value, facility_or_title, status, datetime.utcnow().isoformat(), datetime.utcnow().isoformat()),
                )

    conn.commit()
    conn.close()


def sql_literal(value: str) -> str:
    return str(value).replace("'", "''")


def run_d1_sql(command: str):
    result = subprocess.run(
        ["npx", "wrangler", "d1", "execute", DB_NAME, "--command", command],
        capture_output=True,
        text=True,
        shell=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr or result.stdout or "D1 command failed")
    return result.stdout.strip()


def sync_local_db_to_d1() -> None:
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sync_script = os.path.join(project_root, "scripts", "sync_cloudflare_d1.py")
    if not os.path.exists(sync_script):
        return

    result = subprocess.run(
        [sys.executable, sync_script],
        cwd=project_root,
        capture_output=True,
        text=True,
        shell=False,
    )
    if result.returncode != 0:
        print(f"[cloudflare-sync] {result.stderr.strip() or result.stdout.strip()}")


def persist_admin_to_d1(payload: AdminCreateRequest):
    facility = payload.facilities[0] if payload.facilities else ""
    email = payload.email.strip() or f"{payload.username}@school.edu"
    insert_sql = (
        "INSERT INTO admins (email, fullname, username, password, facilities_assign, status) "
        f"VALUES ('{sql_literal(email)}', '{sql_literal(payload.name)}', '{sql_literal(payload.username)}', '{sql_literal(payload.password)}', '{sql_literal(facility)}', '{sql_literal(payload.status)}');"
    )
    run_d1_sql(insert_sql)


def delete_admin_from_d1(admin_id: int):
    local_conn = sqlite3.connect(LOCAL_DB_PATH)
    local_row = local_conn.execute("SELECT username FROM admins WHERE id = ?", (admin_id,)).fetchone()
    local_conn.close()

    if local_row:
        username = local_row[0]
        run_d1_sql(f"DELETE FROM admins WHERE username = '{sql_literal(username)}';")
        return

    run_d1_sql(f"DELETE FROM admins WHERE id = {admin_id};")


def create_local_admin(payload: AdminCreateRequest):
    ensure_local_admin_table()
    conn = sqlite3.connect(LOCAL_DB_PATH)
    conn.execute(
        "INSERT INTO admins (name, email, username, password, facilities, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (
            payload.name,
            payload.email.strip() or f"{payload.username}@school.edu",
            payload.username,
            payload.password,
            ", ".join(payload.facilities),
            payload.status,
            datetime.utcnow().isoformat(),
            datetime.utcnow().isoformat(),
        ),
    )
    conn.commit()
    admin_id = conn.execute("SELECT last_insert_rowid() AS id").fetchone()[0]
    row = conn.execute(
        "SELECT id, name, email, username, facilities, status FROM admins WHERE id = ?",
        (admin_id,),
    ).fetchone()
    conn.close()
    return {
        "id": row[0],
        "name": row[1],
        "email": row[2],
        "username": row[3],
        "facilities": [item.strip() for item in (row[4] or "").split(",") if item.strip()],
        "status": row[5],
    }


def delete_local_admin(admin_id: int):
    ensure_local_admin_table()
    conn = sqlite3.connect(LOCAL_DB_PATH)
    exists = conn.execute("SELECT id FROM admins WHERE id = ?", (admin_id,)).fetchone()
    if not exists:
        conn.close()
        raise HTTPException(status_code=404, detail="Admin not found.")
    conn.execute("DELETE FROM admins WHERE id = ?", (admin_id,))
    conn.commit()
    conn.close()
    return {"success": True, "deleted_id": admin_id}


@app.get("/health")
def health():
    return {"status": "ok", "database_name": DB_NAME}


@app.get("/admins")
def list_admins():
    ensure_local_admin_table()
    conn = sqlite3.connect(LOCAL_DB_PATH)
    rows = conn.execute(
        "SELECT id, name, email, username, facilities, status FROM admins ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return [
        {
            "id": row[0],
            "name": row[1],
            "email": row[2] or f"{row[3]}@school.edu",
            "username": row[3],
            "facilities": [item.strip() for item in (row[4] or "").split(",") if item.strip()],
            "status": row[5],
        }
        for row in rows
    ]


@app.post("/admins")
def create_admin(payload: AdminCreateRequest):
    if not payload.facilities:
        raise HTTPException(status_code=400, detail="At least one facility must be assigned.")

    try:
        ensure_local_admin_table()
        conn = sqlite3.connect(LOCAL_DB_PATH)
        existing = conn.execute("SELECT id FROM admins WHERE username = ?", (payload.username,)).fetchone()
        conn.close()
        if existing:
            raise HTTPException(status_code=409, detail="Username already exists.")

        created = create_local_admin(payload)
        persist_admin_to_d1(payload)
        sync_local_db_to_d1()
        return created
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.delete("/admins/{admin_id}")
def delete_admin(admin_id: int):
    try:
        result = delete_local_admin(admin_id)
        delete_admin_from_d1(admin_id)
        sync_local_db_to_d1()
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.put("/admins/{admin_id}")
def update_admin(admin_id: int, payload: AdminUpdateRequest):
    ensure_local_admin_table()
    conn = sqlite3.connect(LOCAL_DB_PATH)
    row = conn.execute("SELECT id FROM admins WHERE id = ?", (admin_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Admin not found.")

    updates = []
    values = []
    if payload.name is not None:
        updates.append("name = ?")
        values.append(payload.name)
    if payload.email is not None:
        updates.append("email = ?")
        values.append(payload.email.strip() or "")
    if payload.username is not None:
        updates.append("username = ?")
        values.append(payload.username)
    if payload.password is not None:
        updates.append("password = ?")
        values.append(payload.password)
    if payload.facilities is not None:
        updates.append("facilities = ?")
        values.append(", ".join(payload.facilities))
    if payload.status is not None:
        updates.append("status = ?")
        values.append(payload.status)

    if not updates:
        conn.close()
        raise HTTPException(status_code=400, detail="No fields to update.")

    values.extend([datetime.utcnow().isoformat(), admin_id])
    conn.execute(f"UPDATE admins SET {', '.join(updates)}, updated_at = ? WHERE id = ?", values)
    conn.commit()
    updated = conn.execute("SELECT id, name, email, username, facilities, status FROM admins WHERE id = ?", (admin_id,)).fetchone()
    conn.close()
    sync_local_db_to_d1()
    return {
        "id": updated[0],
        "name": updated[1],
        "email": updated[2] or f"{updated[3]}@school.edu",
        "username": updated[3],
        "facilities": [item.strip() for item in (updated[4] or "").split(",") if item.strip()],
        "status": updated[5],
    }


@app.post("/login")
def login(payload: LoginRequest):
    try:
        seed_default_accounts()
        d1_db_path = find_d1_database_path()

        if d1_db_path and os.path.exists(d1_db_path):
            conn = sqlite3.connect(d1_db_path)

            super_row = conn.execute(
                "SELECT id, fullname, username, password, status FROM super_admins WHERE username = ? LIMIT 1",
                (payload.username,),
            ).fetchone()
            if super_row:
                db_id, db_name, db_username, db_password, db_status = super_row
                if password_matches(db_password, payload.password) and str(db_status or "").strip().lower() == "active":
                    conn.close()
                    return LoginResponse(
                        id=str(db_id),
                        name=db_name,
                        username=db_username,
                        role="superadmin",
                    ).model_dump()

            admin_row = conn.execute(
                "SELECT id, fullname, username, password, facilities_assign, status FROM admins WHERE username = ? LIMIT 1",
                (payload.username,),
            ).fetchone()
            if admin_row:
                db_id, db_name, db_username, db_password, db_facility, db_status = admin_row
                if password_matches(db_password, payload.password) and str(db_status or "").strip().lower() == "active":
                    conn.close()
                    return LoginResponse(
                        id=str(db_id),
                        name=db_name,
                        username=db_username,
                        role="admin",
                        facility=normalize_facility_value(db_facility),
                    ).model_dump()
            conn.close()

        ensure_local_admin_table()
        ensure_local_super_admin_table()
        conn = sqlite3.connect(LOCAL_DB_PATH)

        local_super_row = conn.execute(
            "SELECT id, fullname, username, password, status FROM super_admins WHERE username = ? LIMIT 1",
            (payload.username,),
        ).fetchone()
        if local_super_row:
            db_id, db_name, db_username, db_password, db_status = local_super_row
            if password_matches(db_password, payload.password) and str(db_status or "").strip().lower() == "active":
                conn.close()
                return LoginResponse(
                    id=str(db_id),
                    name=db_name,
                    username=db_username,
                    role="superadmin",
                ).model_dump()

        local_admin_row = conn.execute(
            "SELECT id, name, username, password, facilities, status FROM admins WHERE username = ? LIMIT 1",
            (payload.username,),
        ).fetchone()
        if local_admin_row:
            db_id, db_name, db_username, db_password, db_facilities, db_status = local_admin_row
            if password_matches(db_password, payload.password) and str(db_status or "").strip().lower() == "active":
                conn.close()
                return LoginResponse(
                    id=str(db_id),
                    name=db_name,
                    username=db_username,
                    role="admin",
                    facility=normalize_facility_value(db_facilities),
                ).model_dump()
        conn.close()

        raise HTTPException(status_code=401, detail="Invalid username or password.")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/facilities/{facility_name}/rooms")
def get_facility_rooms(facility_name: str):
    """
    Get all rooms for a facility with their status based on today's reservations.
    Returns room data with status calculated from approved reservations.
    """
    try:
        # Try to access D1 database for real reservation data
        d1_db_path = None
        
        # Check project .wrangler directory first
        project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        wrangler_state = os.path.join(project_dir, ".wrangler", "state", "v3", "d1")
        
        if os.path.exists(wrangler_state):
            for root, dirs, files in os.walk(wrangler_state):
                for file in files:
                    if file.endswith(".sqlite") and not file.endswith((".sqlite-shm", ".sqlite-wal")):
                        d1_db_path = os.path.join(root, file)
                        break
                if d1_db_path:
                    break
        
        # Fallback to home directory
        if not d1_db_path:
            wrangler_state = os.path.expanduser("~/.wrangler/state/v3/d1")
            if os.path.exists(wrangler_state):
                for root, dirs, files in os.walk(wrangler_state):
                    for file in files:
                        if file.endswith(".sqlite") and not file.endswith((".sqlite-shm", ".sqlite-wal")):
                            d1_db_path = os.path.join(root, file)
                            break
                    if d1_db_path:
                        break

        if d1_db_path and os.path.exists(d1_db_path):
            conn = sqlite3.connect(d1_db_path)
            
            # Get today's date
            today = datetime.now().date().isoformat()
            
            # Query approved reservations for this facility today
            reservations = conn.execute(
                """
                SELECT assigned_room, time_needed, department, grade_course_year, total_students
                FROM reservations
                WHERE facility = ? AND date_needed = ? AND status = 'approved'
                ORDER BY time_needed
                """,
                (facility_name, today),
            ).fetchall()
            
            conn.close()
            
            # Map reservations by room
            occupied_rooms = {}
            for res in reservations:
                room_name, time_slot, dept, course, students = res
                if room_name not in occupied_rooms:
                    occupied_rooms[room_name] = {
                        "status": "Occupied",
                        "timeSlot": time_slot,
                        "department": dept,
                        "gradeOrCourse": course,
                        "students": students,
                    }
            
            # Define all rooms for each facility
            facility_rooms = {
                "Computer Laboratory": [
                    {"id": "sp203", "name": "SP 203"},
                    {"id": "sp204", "name": "SP 204"},
                    {"id": "sp205", "name": "SP 205"},
                ],
                "Science & Physics Lab": [
                    {"id": "olc206", "name": "OLC 206"},
                    {"id": "flc212", "name": "FLC 212"},
                    {"id": "flc213", "name": "FLC 213"},
                ],
                "Tertiary Classroom": [
                    {"id": "mm101", "name": "MM 101"},
                    {"id": "mm102", "name": "MM 102"},
                    {"id": "mm103", "name": "MM 103"},
                    {"id": "mm104", "name": "MM 104"},
                    {"id": "mm105", "name": "MM 105"},
                    {"id": "mm106", "name": "MM 106"},
                    {"id": "mm107", "name": "MM 107"},
                    {"id": "mm108", "name": "MM 108"},
                    {"id": "mm109", "name": "MM 109"},
                    {"id": "mm110", "name": "MM 110"},
                    {"id": "mm111", "name": "MM 111"},
                    {"id": "mm201", "name": "MM 201"},
                    {"id": "mm202", "name": "MM 202"},
                    {"id": "mm203", "name": "MM 203"},
                    {"id": "mm301", "name": "MM 301"},
                    {"id": "mm302", "name": "MM 302"},
                    {"id": "mm303", "name": "MM 303"},
                    {"id": "mm304", "name": "MM 304"},
                    {"id": "mm305", "name": "MM 305"},
                    {"id": "mm306", "name": "MM 306"},
                    {"id": "mm307", "name": "MM 307"},
                ],
                "Hotel Restaurant Management": [
                    {"id": "hrm-f1", "name": "First Floor - Restaurant"},
                    {"id": "hrm-f2", "name": "Second Floor - Event Venue"},
                    {"id": "hrm-f3", "name": "Third Floor - Hotel"},
                ],
                "Gymnasium": [
                    {"id": "gym-main", "name": "Main Gymnasium"},
                ],
            }
            
            rooms = facility_rooms.get(facility_name, [])
            
            # Build response with status from occupied_rooms dict
            result = []
            for room in rooms:
                room_data = {
                    "id": room["id"],
                    "name": room["name"],
                    "status": "Available",
                }
                
                # If room is occupied, add reservation details
                if room["name"] in occupied_rooms:
                    room_data.update(occupied_rooms[room["name"]])
                
                result.append(room_data)
            
            return {"facility": facility_name, "rooms": result}
        
        # If no D1 database found, return all rooms as available
        facility_rooms = {
            "Computer Laboratory": [
                {"id": "sp203", "name": "SP 203", "status": "Available"},
                {"id": "sp204", "name": "SP 204", "status": "Available"},
                {"id": "sp205", "name": "SP 205", "status": "Available"},
            ],
            "Science & Physics Lab": [
                {"id": "olc206", "name": "OLC 206", "status": "Available"},
                {"id": "flc212", "name": "FLC 212", "status": "Available"},
                {"id": "flc213", "name": "FLC 213", "status": "Available"},
            ],
            "Tertiary Classroom": [
                {"id": "mm101", "name": "MM 101", "status": "Available"},
                {"id": "mm102", "name": "MM 102", "status": "Available"},
                {"id": "mm103", "name": "MM 103", "status": "Available"},
                {"id": "mm104", "name": "MM 104", "status": "Available"},
                {"id": "mm105", "name": "MM 105", "status": "Available"},
                {"id": "mm106", "name": "MM 106", "status": "Available"},
                {"id": "mm107", "name": "MM 107", "status": "Available"},
                {"id": "mm108", "name": "MM 108", "status": "Available"},
                {"id": "mm109", "name": "MM 109", "status": "Available"},
                {"id": "mm110", "name": "MM 110", "status": "Available"},
                {"id": "mm111", "name": "MM 111", "status": "Available"},
                {"id": "mm201", "name": "MM 201", "status": "Available"},
                {"id": "mm202", "name": "MM 202", "status": "Available"},
                {"id": "mm203", "name": "MM 203", "status": "Available"},
                {"id": "mm301", "name": "MM 301", "status": "Available"},
                {"id": "mm302", "name": "MM 302", "status": "Available"},
                {"id": "mm303", "name": "MM 303", "status": "Available"},
                {"id": "mm304", "name": "MM 304", "status": "Available"},
                {"id": "mm305", "name": "MM 305", "status": "Available"},
                {"id": "mm306", "name": "MM 306", "status": "Available"},
                {"id": "mm307", "name": "MM 307", "status": "Available"},
            ],
            "Hotel Restaurant Management": [
                {"id": "hrm-f1", "name": "First Floor - Restaurant", "status": "Available"},
                {"id": "hrm-f2", "name": "Second Floor - Event Venue", "status": "Available"},
                {"id": "hrm-f3", "name": "Third Floor - Hotel", "status": "Available"},
            ],
            "Gymnasium": [
                {"id": "gym-main", "name": "Main Gymnasium", "status": "Available"},
            ],
        }
        
        rooms = facility_rooms.get(facility_name, [])
        return {"facility": facility_name, "rooms": rooms}
        
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
