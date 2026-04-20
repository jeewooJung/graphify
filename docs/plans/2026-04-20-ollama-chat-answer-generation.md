# Ollama Chat Answer Generation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire the backend chat flow to build a document-grounded Ollama prompt, parse cited sources from the model response, persist assistant answers and citations for session chats, and return the same answer shape for single-shot requests.

**Architecture:** Keep the LLM flow synchronous and service-driven. `AnswerGeneratorService` resolves scope documents and chunks, `ChatPromptBuilder` assembles the bounded prompt with recent history, `CitationParser` extracts cited document titles back into document IDs, and `ChatController` delegates answer generation while shaping the API response with citations.

**Tech Stack:** Spring Boot, Spring MVC, Spring Data JPA, Jackson, Lombok, PostgreSQL, Ollama HTTP API

---

### Task 1: Update Configuration And Planning Inputs

**Files:**
- Modify: `backend/src/main/resources/application.yml`
- Reference: `backend/src/main/java/com/graphify/backend/config/properties/GraphifyChatProperties.java`

**Step 1:** Ensure `graphify.chat.history-turns` is defined beside the existing chat prompt limits.

**Step 2:** Keep existing property classes intact unless the implementation truly needs a new binding surface.

### Task 2: Rework Prompt And Citation Services

**Files:**
- Modify: `backend/src/main/java/com/graphify/backend/service/chat/ChatPromptBuilder.java`
- Modify: `backend/src/main/java/com/graphify/backend/service/chat/CitationParser.java`

**Step 1:** Change `ChatPromptBuilder` to accept all candidate documents, all chunks, and chat history.

**Step 2:** Add document truncation, character-budget enforcement, no-document fallback prompt, and configurable history window behavior from `@Value`.

**Step 3:** Make `CitationParser` detect the last `Sources:` or `출처:` marker, strip it from answer content, and map cited titles back to included document IDs.

### Task 3: Rework Answer Generation

**Files:**
- Modify: `backend/src/main/java/com/graphify/backend/service/chat/AnswerGeneratorService.java`
- Modify: `backend/src/main/java/com/graphify/backend/repository/DocumentChunkRepository.java`

**Step 1:** Resolve scope documents for project, team, and workspace scopes using READY documents only.

**Step 2:** Load chunks efficiently for the resolved documents, build the prompt, call Ollama, parse citations, and log failures without exposing request content.

**Step 3:** Persist assistant chat messages and citations only for session-backed generation, and keep single-shot generation transient.

### Task 4: Wire Controllers To The Generator

**Files:**
- Modify: `backend/src/main/java/com/graphify/backend/controller/ChatController.java`

**Step 1:** Replace stub assistant message creation in `POST /chat/sessions/{sessionId}/messages` with `AnswerGeneratorService.generateForSession(...)`.

**Step 2:** Replace the single-shot stub in `POST /chat/answer` with `generateSingleShot(...)`.

**Step 3:** Centralize assistant response mapping in a helper that includes citation metadata from each cited document.

### Task 5: Verify

**Files:**
- Verify only

**Step 1:** Run `cd backend && ./gradlew compileJava`.

**Step 2:** Review compile output and only then report completion status, files touched, and any deviations from the requested design.
