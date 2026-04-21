"""RAG accuracy regression test against tests/doc/02-rag-test-answers.md.

Runs each question against POST /chat/answer (scope=PROJECT, scopeId=<seeded>)
and grades the response by checking whether required key facts appear in the
returned text. Writes a markdown report next to the ground-truth file.

Usage:
    python tests/rag_accuracy_test.py
    python tests/rag_accuracy_test.py --start 15 --end 25   # subset
    python tests/rag_accuracy_test.py --project-id 11
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from dataclasses import dataclass
from pathlib import Path

import requests

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

BASE_URL = "http://localhost:8086/api"
USERNAME = "demo@graphify.com"
PASSWORD = "demo123"
PROJECT_NAME = "힐스테이트 광명 11구역 분양 분석"
REPORT_PATH = Path(__file__).resolve().parent / "doc" / "02-rag-current-results.md"


@dataclass
class Case:
    qid: str
    question: str
    must_have_any: list[list[str]]  # each inner list = OR group; case must contain at least one string in each group
    category: str


# Keys are matched case-insensitively, stripping commas/whitespace.
CASES: list[Case] = [
    Case("Q1", "힐스테이트 광명11의 총 공급 세대수는 몇 세대인가요?",
         [["4,291", "4291", "652"]], "factual"),
    Case("Q2", "일반분양은 몇 세대이고, 특별공급은 몇 세대인가요?",
         [["356"], ["296"]], "factual"),
    Case("Q3", "입주 예정 시기는 언제인가요?",
         [["2029"]], "factual"),
    Case("Q4", "청약 1순위 접수일은 언제인가요?",
         [["2025.11.18", "2025-11-18", "11월 18일", "11.18"]], "factual"),
    Case("Q5", "전매제한 기간은 얼마인가요?",
         [["3년"]], "factual"),
    Case("Q6", "경기도 광명시에 1년 거주한 사람은 해당지역 우선공급을 받을 수 있나요?",
         [["2년"], ["없", "불가", "받을 수 없"]], "conditional"),
    Case("Q7", "재당첨 제한 기간 내에 있는 사람도 이 아파트에 청약할 수 있나요?",
         [["재당첨제한", "재당첨 제한"], ["없", "청약할 수 있", "가능"]], "conditional"),
    Case("Q8", "25년 이상 장기복무 군인은 어떤 혜택이 있나요?",
         [["국방부", "국군복지단", "장기복무"]], "conditional"),
    Case("Q9", "인터넷 청약이 불가한 고령자는 어떻게 청약할 수 있나요?",
         [["현장접수", "견본주택", "가입은행"]], "conditional"),
    Case("Q10", "사전청약 당첨자가 이 아파트에 청약하면 어떤 제한이 있나요?",
         [["사전", "2024.10.01", "2024년 10월"]], "conditional"),
    Case("Q11", "59A 타입의 전용면적과 총 공급 세대수는 얼마인가요?",
         [["407"]], "table"),
    Case("Q12", "51타입 특별공급 중 신혼부부 배정 세대수는 몇 세대인가요?",
         [["24"]], "table"),
    Case("Q13", "이 아파트에서 가장 많이 공급되는 주택형은 무엇인가요?",
         [["59A"]], "table"),
    Case("Q14", "105동 3호 21층 39A 타입의 공급금액(계)은 얼마인가요?",
         [["602,300,000", "602300000", "6억 2,300만", "6억2300만"]], "table-pinpoint"),
    Case("Q15", "204동 5호 22층 39A 타입의 분양가는 얼마인가요?",
         [["602,300,000", "602300000", "6억 2,300만"]], "table-pinpoint"),
    Case("Q16", "303동 5호 19층 39B 타입의 총 공급금액은 얼마인가요?",
         [["556,900,000", "556900000", "5억 5,690만"]], "table-pinpoint"),
    Case("Q17", "303동 1호 59C 타입 1층의 공급금액과 21층의 공급금액은 각각 얼마인가요?",
         [["1,037,100,000", "1037100000"], ["1,132,400,000", "1132400000"]], "table-pinpoint"),
    Case("Q18", "301동 1호 74C 타입 3층의 공급금액은 얼마인가요?",
         [["1,313,500,000", "1313500000", "13억 1,350만"]], "table-pinpoint"),
    Case("Q19", "301동 2호 74D 타입 2층의 공급금액은 얼마인가요?",
         [["1,313,100,000", "1313100000", "13억 1,310만"]], "table-pinpoint"),
    Case("Q20", "303동 59C 타입 8층의 공급금액은 얼마인가요? (표에 '6-10층'으로 표기)",
         [["1,098,800,000", "1098800000", "10억 9,880만"]], "range"),
    Case("Q21", "303동 59C 타입 7층의 분양가는 얼마인가요?",
         [["1,098,800,000", "1098800000"]], "range"),
    Case("Q22", "301동 74C 타입 7층의 공급금액은 얼마인가요? (표에 '6-9층'으로 표기)",
         [["1,353,000,000", "1353000000"]], "range"),
    Case("Q23", "303동 59C 타입 13층의 분양가는 얼마인가요? (표에 '11-15층'으로 표기)",
         [["1,110,000,000", "1110000000"]], "range"),
    Case("Q24", "303동 59C 타입 18층의 공급금액은 얼마인가요? (표에 '16-20층'으로 표기)",
         [["1,121,200,000", "1121200000"]], "range"),
    Case("Q25", "303동 59C 타입에서 1층과 21층의 공급금액 차이는 얼마인가요?",
         [["95,300,000", "95300000", "9,530만"]], "comparison"),
    Case("Q26", "같은 59C 타입이라도 5층과 15층의 공급금액 차이가 얼마나 나나요?",
         [["22,400,000", "22400000", "2,240만"]], "comparison"),
    Case("Q27", "301동 74D 타입에서 가장 저렴한 층은 몇 층이고, 가장 비싼 층은 몇 층인가요?",
         [["1,299,800,000", "1299800000"], ["1,386,100,000", "1386100000"]], "comparison"),
    Case("Q28", "301동 74C 타입에서 가장 저렴한 층과 가장 비싼 층의 가격 차이는 얼마인가요?",
         [["39,500,000", "39500000", "3,950만"]], "comparison"),
    Case("Q29", "39A 타입(105동 21층)과 39B 타입(303동 19층)의 공급금액 차이는 얼마인가요?",
         [["45,400,000", "45400000", "4,540만"]], "comparison"),
    Case("Q30", "59C 타입 303동 6-10층과 11-15층의 공급금액 차이는 얼마인가요?",
         [["11,200,000", "11200000", "1,120만"]], "comparison"),
    Case("Q31", "74C 타입(301동 1호)과 74D 타입(301동 2호) 같은 5층 기준으로 공급금액이 얼마나 차이 나나요?",
         [["19,800,000", "19800000", "1,980만"]], "comparison"),
    Case("Q32", "303동 59C 타입 1층의 계약금은 얼마이고, 잔금은 얼마인가요?",
         [["103,710,000", "103710000"], ["311,130,000", "311130000"]], "payment"),
    Case("Q33", "301동 74C 타입 4층의 중도금 1차 납부금액과 납부일은 언제인가요?",
         [["132,670,000", "132670000"], ["2026.03.20", "2026-03-20", "2026년 3월"]], "payment"),
    Case("Q34", "39A 타입 204동 26층 이상의 계약금 1차와 2차 금액은 각각 얼마인가요?",
         [["10,000,000", "10000000", "1,000만"], ["51,020,000", "51020000"]], "payment"),
    Case("Q35", "59C 타입 303동 11-15층의 중도금 6차 납부 예정일과 금액은 얼마인가요?",
         [["2028.10.20", "2028-10-20", "2028년 10월 20"], ["111,000,000", "111000000"]], "payment"),
    Case("Q36", "이 아파트에서 가장 비싼 타입과 층은 어디이고, 공급금액은 얼마인가요?",
         [["84D"], ["1,641,000,000", "1641000000"]], "aggregation"),
    Case("Q37", "이 아파트에서 가장 저렴한 타입과 층은 어디이고, 공급금액은 얼마인가요?",
         [["39B"], ["556,900,000", "556900000"]], "aggregation"),
    Case("Q38", "59C 타입 303동에서 10억 이하인 층은 어디까지인가요?",
         [["10억"], ["없", "초과", "1,037,100,000"]], "aggregation"),
    Case("Q39", "74D 타입에서 공급금액이 13억을 넘는 층은 몇 층부터인가요?",
         [["2층"], ["1,313,100,000", "1313100000"]], "aggregation"),
    Case("Q40", "이 아파트는 투기과열지구에 있는 건가요? 그렇다면 규제지역 기준이 적용되나요?",
         [["투기과열"], ["2025.10.16", "2025년 10월 16"]], "multi-hop"),
    Case("Q41", "블록 선택이 가능한가요? 동·호수 배정은 어떻게 이루어지나요?",
         [["불가"], ["전산추첨", "무작위"]], "multi-hop"),
    Case("Q42", "59C 타입 303동 8층(6-10층 구간)의 공급금액은 얼마이고, 계약금 10%는 얼마인가요?",
         [["1,098,800,000", "1098800000"], ["109,880,000", "109880000"]], "multi-hop"),
]


def norm(text: str) -> str:
    return (text or "").replace(",", "").replace(" ", "").lower()


def grade(answer: str, must_have_any: list[list[str]]) -> tuple[str, list[str]]:
    n_answer = norm(answer)
    missed: list[str] = []
    for group in must_have_any:
        hit = any(norm(candidate) in n_answer for candidate in group)
        if not hit:
            missed.append("/".join(group))
    if not missed:
        return "PASS", []
    if len(missed) == len(must_have_any):
        return "FAIL", missed
    return "PARTIAL", missed


def login() -> str:
    r = requests.post(f"{BASE_URL}/auth/login",
                      json={"username": USERNAME, "password": PASSWORD}, timeout=15)
    r.raise_for_status()
    return r.json()["token"]


def find_project_id(token: str, name: str) -> int:
    r = requests.get(f"{BASE_URL}/projects", headers={"Authorization": f"Bearer {token}"}, timeout=15)
    r.raise_for_status()
    for p in r.json() or []:
        if p.get("name") == name:
            return int(p["id"])
    raise SystemExit(f"Project not found: {name!r}. Run tests/seed_test_data.py first.")


def ask(token: str, project_id: int, question: str) -> dict:
    r = requests.post(f"{BASE_URL}/chat/answer",
                      headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                      json={"scopeType": "PROJECT", "scopeId": project_id, "content": question},
                      timeout=300)
    return r.json() if r.ok else {"content": f"[HTTP {r.status_code}] {r.text[:200]}", "citations": []}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-id", type=int, default=None)
    parser.add_argument("--start", type=int, default=1, help="first Qn (inclusive)")
    parser.add_argument("--end", type=int, default=len(CASES), help="last Qn (inclusive)")
    parser.add_argument("--out", type=Path, default=REPORT_PATH)
    args = parser.parse_args()

    token = login()
    project_id = args.project_id or find_project_id(token, PROJECT_NAME)
    print(f"project_id={project_id}")

    selected = [c for i, c in enumerate(CASES, start=1) if args.start <= i <= args.end]
    results: list[dict] = []

    for i, case in enumerate(selected, start=args.start):
        t0 = time.time()
        payload = ask(token, project_id, case.question)
        elapsed = time.time() - t0
        content = payload.get("content", "")
        citations = payload.get("citations") or []
        verdict, missed = grade(content, case.must_have_any)
        print(f"[{case.qid} {case.category}] {verdict} ({elapsed:.1f}s, cites={len(citations)})" +
              (f"  missing={missed}" if missed else ""))
        results.append({
            "qid": case.qid, "category": case.category, "question": case.question,
            "answer": content, "verdict": verdict, "missed": missed,
            "citations": len(citations), "seconds": round(elapsed, 1),
        })

    pass_n = sum(1 for r in results if r["verdict"] == "PASS")
    partial_n = sum(1 for r in results if r["verdict"] == "PARTIAL")
    fail_n = sum(1 for r in results if r["verdict"] == "FAIL")
    total = len(results)

    lines: list[str] = []
    lines.append(f"# RAG Accuracy – Current Implementation (long-context stuffing)")
    lines.append("")
    lines.append(f"- Tested against project **{PROJECT_NAME}** (id={project_id}) via `POST /chat/answer`")
    lines.append(f"- Model: `gemma3:27b` on Ollama proxy `http://172.30.0.29:8080`")
    lines.append(f"- Retrieval: **no vector DB** – all READY chunks of the project stuffed into the prompt (`max-context-chars=100000`)")
    lines.append(f"- Ground truth: [02-rag-test-answers.md](02-rag-test-answers.md)")
    lines.append("")
    lines.append(f"## Summary")
    lines.append(f"| Verdict | Count |")
    lines.append(f"|---------|-------|")
    lines.append(f"| PASS | {pass_n} / {total} ({pass_n/total*100:.1f}%) |")
    lines.append(f"| PARTIAL | {partial_n} / {total} ({partial_n/total*100:.1f}%) |")
    lines.append(f"| FAIL | {fail_n} / {total} ({fail_n/total*100:.1f}%) |")
    avg_time = sum(r["seconds"] for r in results) / max(1, total)
    lines.append(f"| avg latency | {avg_time:.1f}s |")
    lines.append("")
    by_cat: dict[str, list[dict]] = {}
    for r in results:
        by_cat.setdefault(r["category"], []).append(r)
    lines.append(f"### By category")
    lines.append(f"| Category | PASS | PARTIAL | FAIL | Total |")
    lines.append(f"|---|---|---|---|---|")
    for cat, rs in by_cat.items():
        p = sum(1 for x in rs if x["verdict"] == "PASS")
        pa = sum(1 for x in rs if x["verdict"] == "PARTIAL")
        f = sum(1 for x in rs if x["verdict"] == "FAIL")
        lines.append(f"| {cat} | {p} | {pa} | {f} | {len(rs)} |")
    lines.append("")
    lines.append(f"## Per-question results")
    for r in results:
        lines.append(f"### {r['qid']} · {r['category']} · **{r['verdict']}**  `{r['seconds']}s, cites={r['citations']}`")
        lines.append(f"**Q**: {r['question']}")
        lines.append("")
        lines.append(f"**A**:")
        lines.append("```")
        lines.append(r["answer"].strip()[:1600])
        lines.append("```")
        if r["missed"]:
            lines.append(f"**Missing keys**: `{', '.join(r['missed'])}`")
        lines.append("")

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n=== Report ===")
    print(f"PASS    : {pass_n}/{total} ({pass_n/total*100:.1f}%)")
    print(f"PARTIAL : {partial_n}/{total}")
    print(f"FAIL    : {fail_n}/{total}")
    print(f"avg     : {avg_time:.1f}s")
    print(f"-> {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
