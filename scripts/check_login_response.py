import json
import urllib.request

payload = {"username": "jj.himenez", "password": "ChangeMe123!"}
req = urllib.request.Request(
    "http://localhost:8000/login",
    data=json.dumps(payload).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(req, timeout=10) as resp:
    body = resp.read().decode()
    print(resp.status)
    print(body)
