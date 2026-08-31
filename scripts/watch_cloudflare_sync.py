import os
import subprocess
import sys
import time

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL_DB_PATH = os.path.join(PROJECT_ROOT, "backend", "facilitrack_local.db")
SYNC_SCRIPT = os.path.join(PROJECT_ROOT, "scripts", "sync_cloudflare_d1.py")
POLL_SECONDS = float(os.getenv("SYNC_POLL_SECONDS", "2"))


def run_sync() -> None:
    subprocess.run([sys.executable, SYNC_SCRIPT], cwd=PROJECT_ROOT, check=False)


def main() -> int:
    print(f"Watching {LOCAL_DB_PATH} for changes...")
    last_seen = None

    while True:
        try:
            if os.path.exists(LOCAL_DB_PATH):
                current_mtime = os.path.getmtime(LOCAL_DB_PATH)
                if last_seen is None:
                    last_seen = current_mtime
                elif current_mtime != last_seen:
                    print(f"Detected DB change at {time.strftime('%Y-%m-%d %H:%M:%S')}; syncing to Cloudflare D1...")
                    run_sync()
                    last_seen = current_mtime
            else:
                print(f"Waiting for local DB: {LOCAL_DB_PATH}")
                last_seen = None
        except Exception as exc:
            print(f"Watcher error: {exc}", file=sys.stderr)

        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    raise SystemExit(main())
