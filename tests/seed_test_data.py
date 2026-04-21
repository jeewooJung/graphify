"""Seed Graphify with test data built around tests/doc/*.pdf.

Idempotent. Safe to re-run. Uses the already-running backend on localhost:8086
and the seeded demo user.

Usage:
    python tests/seed_test_data.py
    python tests/seed_test_data.py --base-url http://localhost:8086/api
    python tests/seed_test_data.py --username demo@graphify.com --password demo123
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

DOC_DIR = Path(__file__).resolve().parent / "doc"

PROJECT_NAME = "힐스테이트 광명 11구역 분양 분석"
PROJECT_DESCRIPTION = (
    "2025년 11월 힐스테이트 광명 11구역(GM11R) 아파트 입주자 모집 공고 기반 테스트 프로젝트. "
    "RAG 파이프라인·문서 Q&A·권한·팀 기능을 검증하기 위한 시드 데이터입니다."
)
CHAT_SESSION_TITLE = "분양 공고 Q&A 데모"
CHAT_SEED_QUESTIONS = [
    "이 분양의 전체 세대 수와 타입별 세대 수를 알려줘.",
    "계약 체결 기간과 당첨자 발표일은 언제야?",
    "중도금은 어떤 일정으로 납부해?",
]


class SeedError(RuntimeError):
    pass


def login(base_url: str, username: str, password: str) -> str:
    resp = requests.post(
        f"{base_url}/auth/login",
        json={"username": username, "password": password},
        timeout=15,
    )
    if not resp.ok:
        raise SeedError(f"Login failed [{resp.status_code}]: {resp.text}")
    token = resp.json().get("token")
    if not token:
        raise SeedError(f"Login response missing token: {resp.text}")
    return token


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def find_project(base_url: str, token: str, name: str) -> dict | None:
    resp = requests.get(f"{base_url}/projects", headers=auth_headers(token), timeout=15)
    resp.raise_for_status()
    for project in resp.json() or []:
        if project.get("name") == name:
            return project
    return None


def create_project(base_url: str, token: str, name: str, description: str) -> dict:
    resp = requests.post(
        f"{base_url}/projects",
        headers={**auth_headers(token), "Content-Type": "application/json"},
        json={"name": name, "description": description},
        timeout=15,
    )
    if not resp.ok:
        raise SeedError(f"Create project failed [{resp.status_code}]: {resp.text}")
    return resp.json()


def list_documents(base_url: str, token: str, project_id: int | str) -> list[dict]:
    resp = requests.get(
        f"{base_url}/projects/{project_id}/documents",
        headers=auth_headers(token),
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json() or []


def upload_document(
    base_url: str, token: str, project_id: int | str, pdf_path: Path, title: str
) -> dict:
    with pdf_path.open("rb") as fh:
        files = {"file": (pdf_path.name, fh, "application/pdf")}
        data = {"title": title}
        resp = requests.post(
            f"{base_url}/projects/{project_id}/documents",
            headers=auth_headers(token),
            files=files,
            data=data,
            timeout=120,
        )
    if not resp.ok:
        raise SeedError(f"Upload failed [{resp.status_code}]: {resp.text}")
    return resp.json()


def poll_document(base_url: str, token: str, document_id: int | str, attempts: int = 40) -> dict:
    last: dict = {}
    for _ in range(attempts):
        resp = requests.get(
            f"{base_url}/documents/{document_id}",
            headers=auth_headers(token),
            timeout=15,
        )
        if resp.ok:
            last = resp.json()
            status = (last.get("status") or "").upper()
            if status in {"READY", "PROCESSED", "COMPLETED", "FAILED", "ERROR"}:
                return last
        time.sleep(3)
    return last


def find_session(base_url: str, token: str, project_id: int | str, title: str) -> dict | None:
    resp = requests.get(
        f"{base_url}/chat/sessions",
        headers=auth_headers(token),
        params={"scopeType": "PROJECT", "scopeId": project_id, "limit": 50},
        timeout=15,
    )
    if not resp.ok:
        return None
    payload = resp.json()
    sessions = payload if isinstance(payload, list) else payload.get("sessions", [])
    for session in sessions:
        if session.get("title") == title:
            return session
    return None


def create_session(base_url: str, token: str, project_id: int | str, title: str) -> dict:
    resp = requests.post(
        f"{base_url}/chat/sessions",
        headers={**auth_headers(token), "Content-Type": "application/json"},
        json={"scopeType": "PROJECT", "scopeId": project_id, "title": title},
        timeout=15,
    )
    if not resp.ok:
        raise SeedError(f"Create chat session failed [{resp.status_code}]: {resp.text}")
    return resp.json()


def post_message(base_url: str, token: str, session_id: int | str, content: str) -> None:
    resp = requests.post(
        f"{base_url}/chat/sessions/{session_id}/messages",
        headers={**auth_headers(token), "Content-Type": "application/json"},
        json={"content": content},
        timeout=60,
    )
    if not resp.ok:
        print(f"  ! seed message failed [{resp.status_code}]: {resp.text}", file=sys.stderr)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--username", default=DEFAULT_USERNAME)
    parser.add_argument("--password", default=DEFAULT_PASSWORD)
    parser.add_argument(
        "--skip-chat",
        action="store_true",
        help="Skip seeding a sample chat session and questions.",
    )
    parser.add_argument(
        "--wait-ingest",
        action="store_true",
        help="Poll document status until READY/FAILED before exiting.",
    )
    args = parser.parse_args()

    pdfs = sorted(DOC_DIR.glob("*.pdf"))
    if not pdfs:
        print(f"No PDFs found under {DOC_DIR}", file=sys.stderr)
        return 1

    try:
        print(f"-> Logging in as {args.username}")
        token = login(args.base_url, args.username, args.password)

        project = find_project(args.base_url, token, PROJECT_NAME)
        if project:
            print(f"[ok] Project exists: id={project['id']} name={PROJECT_NAME!r}")
        else:
            print(f"+ Creating project {PROJECT_NAME!r}")
            project = create_project(args.base_url, token, PROJECT_NAME, PROJECT_DESCRIPTION)
            print(f"[ok] Created project id={project['id']}")

        project_id = project["id"]
        existing_docs = list_documents(args.base_url, token, project_id)
        existing_names = {d.get("originalFilename") for d in existing_docs}

        uploaded_ids: list[int] = []
        for pdf in pdfs:
            if pdf.name in existing_names:
                match = next(d for d in existing_docs if d.get("originalFilename") == pdf.name)
                print(f"[ok] Document exists: {pdf.name} (id={match['id']}, status={match.get('status')})")
                uploaded_ids.append(int(match["id"]))
                continue
            print(f"+ Uploading {pdf.name} ({pdf.stat().st_size} bytes)")
            result = upload_document(
                args.base_url, token, project_id, pdf, title=pdf.stem
            )
            doc_id = result.get("documentId") or result.get("id")
            print(f"  -> documentId={doc_id} status={result.get('status')}")
            if doc_id is not None:
                uploaded_ids.append(int(doc_id))

        if args.wait_ingest:
            for doc_id in uploaded_ids:
                print(f"... Polling document {doc_id} for ingest completion")
                final = poll_document(args.base_url, token, doc_id)
                print(
                    f"  -> final status={final.get('status')} chunks={final.get('chunkCount')}"
                )

        if not args.skip_chat:
            session = find_session(args.base_url, token, project_id, CHAT_SESSION_TITLE)
            if session:
                print(f"[ok] Chat session exists: id={session['id']} title={CHAT_SESSION_TITLE!r}")
            else:
                print(f"+ Creating chat session {CHAT_SESSION_TITLE!r}")
                session = create_session(args.base_url, token, project_id, CHAT_SESSION_TITLE)
                print(f"[ok] Created chat session id={session['id']}")
                for question in CHAT_SEED_QUESTIONS:
                    print(f"  -> seeding question: {question}")
                    post_message(args.base_url, token, session["id"], question)

        print("\n=== Seed complete ===")
        print(f"Project id        : {project_id}")
        print(f"Project name      : {PROJECT_NAME}")
        print(f"Documents         : {len(uploaded_ids)} (ids={uploaded_ids})")
        print(f"Web URL           : http://localhost:3006/projects/{project_id}")
        return 0
    except SeedError as exc:
        print(f"\n[err] {exc}", file=sys.stderr)
        return 2
    except requests.RequestException as exc:
        print(f"\n[err] Network error: {exc}", file=sys.stderr)
        return 3


if __name__ == "__main__":
    sys.exit(main())
