# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-auth.spec.ts >> Authentication Flow >> A-04: Non-existent user login returns 401
- Location: e2e\scenarios\02-auth.spec.ts:54:7

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:8086
Call log:
  - → POST http://localhost:8086/api/auth/login
    - user-agent: Playwright/1.59.1 (x64; windows 10.0) node/24.14
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - Content-Type: application/json
    - content-length: 58

```