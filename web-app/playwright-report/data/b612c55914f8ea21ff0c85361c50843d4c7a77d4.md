# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-public.spec.ts >> Public Endpoints >> P-02: Health info returns 200 with version
- Location: e2e\scenarios\01-public.spec.ts:19:7

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:8086
Call log:
  - → GET http://localhost:8086/api/health/info
    - user-agent: Playwright/1.59.1 (x64; windows 10.0) node/24.14
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - Content-Type: application/json

```