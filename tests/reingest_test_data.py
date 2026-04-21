"""Delete and re-upload the seeded PDF documents for the Hillstate project.

Usage:
    python tests/reingest_test_data.py
    python tests/reingest_test_data.py --base-url http://localhost:8086/api
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

import requests

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

DEFAULT_BASE_URL = "http://localhost:8086/api"
DEFAULT_USERNAME = "demo@graphify.com"
DEFAULT_PASSWORD = "demo123"
PROJECT_NAME = "힐스테이트 광명 11구역 분양 분석"
DOC_DIR = Path(__file__).resolve().parent / "doc"


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def login(base_url: str, username: str, password: str) -> str:
    response = requests.post(
        f"{base_url}/auth/login",
        json={"username": username, "password": password},
        timeout=15,
    )
    response.raise_for_status()
    return response.json()["token"]


def find_project_id(base_url: str, token: str, project_name: str) -> int:
    response = requests.get(f"{base_url}/projects", headers=auth_headers(token), timeout=15)
    response.raise_for_status()
    for project in response.json() or []:
        if project.get("name") == project_name:
            return int(project["id"])
    raise SystemExit(f"Project not found: {project_name!r}")


def list_documents(base_url: str, token: str, project_id: int) -> list[dict]:
    response = requests.get(
        f"{base_url}/projects/{project_id}/documents",
        headers=auth_headers(token),
        timeout=15,
    )
    response.raise_for_status()
    return response.json() or []


def delete_document(base_url: str, token: str, document_id: int) -> None:
    response = requests.delete(
        f"{base_url}/documents/{document_id}",
        headers=auth_headers(token),
        timeout=30,
    )
    response.raise_for_status()


def upload_document(base_url: str, token: str, project_id: int, pdf_path: Path) -> int:
    with pdf_path.open("rb") as handle:
        response = requests.post(
            f"{base_url}/projects/{project_id}/documents",
            headers=auth_headers(token),
            data={"title": pdf_path.stem},
            files={"file": (pdf_path.name, handle, "application/pdf")},
            timeout=120,
        )
    response.raise_for_status()
    payload = response.json()
    return int(payload.get("documentId") or payload["id"])


def poll_document(base_url: str, token: str, document_id: int, attempts: int = 60) -> dict:
    last: dict = {}
    for _ in range(attempts):
        response = requests.get(
            f"{base_url}/documents/{document_id}",
            headers=auth_headers(token),
            timeout=15,
        )
        response.raise_for_status()
        last = response.json()
        status = (last.get("status") or "").upper()
        if status in {"READY", "FAILED"}:
            return last
        time.sleep(2)
    return last


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--username", default=DEFAULT_USERNAME)
    parser.add_argument("--password", default=DEFAULT_PASSWORD)
    parser.add_argument("--project-name", default=PROJECT_NAME)
    args = parser.parse_args()

    pdf_paths = sorted(DOC_DIR.glob("*.pdf"))
    if not pdf_paths:
        print(f"No PDFs found under {DOC_DIR}", file=sys.stderr)
        return 1

    token = login(args.base_url, args.username, args.password)
    project_id = find_project_id(args.base_url, token, args.project_name)
    print(f"project_id={project_id} project={args.project_name}")

    existing_documents = list_documents(args.base_url, token, project_id)
    for document in existing_documents:
        document_id = int(document["id"])
        print(f"- deleting document {document_id}: {document.get('title') or document.get('originalFilename')}")
        delete_document(args.base_url, token, document_id)

    for pdf_path in pdf_paths:
        print(f"+ uploading {pdf_path.name}")
        document_id = upload_document(args.base_url, token, project_id, pdf_path)
        final = poll_document(args.base_url, token, document_id)
        print(
            f"  -> documentId={document_id} status={final.get('status')} chunks={final.get('chunkCount')}"
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
