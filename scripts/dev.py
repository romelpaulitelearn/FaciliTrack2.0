import os
import signal
import subprocess
import sys


processes = [
    subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"],
    ),
    subprocess.Popen(
        ["npm.cmd" if os.name == "nt" else "npm", "run", "dev"],
    ),
]


def stop_processes(*_):
    for process in processes:
        if process.poll() is None:
            process.terminate()
    for process in processes:
        process.wait()
    raise SystemExit


signal.signal(signal.SIGINT, stop_processes)
signal.signal(signal.SIGTERM, stop_processes)

try:
    while True:
        for process in processes:
            if process.poll() is not None:
                stop_processes()
except KeyboardInterrupt:
    stop_processes()