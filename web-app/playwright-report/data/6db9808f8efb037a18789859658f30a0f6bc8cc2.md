# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-auth.spec.ts >> Authentication Flow >> A-06: Invalid token validation returns 401
- Location: e2e\scenarios\02-auth.spec.ts:71:7

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:8086
Call log:
  - → GET http://localhost:8086/api/auth/validate
    - user-agent: Playwright/1.59.1 (x64; windows 10.0) node/24.14
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - Authorization: Bearer invalid.token.here

```