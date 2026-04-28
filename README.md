# Streaming Platform — QA Engineer Home Assessment

## Project Structure

tests/
└── chat.spec.ts

test-plan/
└── test-cases.md

postman/
├── Streaming Platform API Tests.postman_collection.json
└── Streaming Platform ENV.postman_environment.json

critical-thinking/
└── answers.md

---

## Setup & Run

### Playwright (E2E Tests)

Install dependencies and run tests:

    npm install
    npx playwright install
    npx playwright test

### Postman (API Tests)

1. Open Postman
2. Import postman/Streaming Platform API Tests.postman_collection.json
3. Import postman/Streaming Platform ENV.postman_environment.json
4. Select environment Streaming Platform ENV in the top right dropdown
5. Click Runner, select the collection, run requests in this order:
   - POST Send message (valid) — saves message_id automatically
   - GET Get messages (valid)
   - DELETE Delete message (valid)
   - POST Flag message (valid)
   - All negative tests

---

## Bug Fixes — chat.spec.ts (Part 1)

Bug 1 — Missing await before input.fill()
- fill() is async. Without await, the send button fires before text is entered.
- Fix: added await before input.fill()

Bug 2 — Selector #message-input incorrect
- The original code comment warned the selector may not match the DOM.
- Fix: changed to [data-testid="message-input"] per React/Next.js conventions

Bug 3 — .last() unreliable assertion
- The original code comment warned the assertion may check the wrong element.
- .last() breaks when other messages already exist in the chat.
- Fix: changed to .filter({ hasText }) to target exact message content

---

## Key Decisions

### 1. data-testid selectors over CSS class or ID selectors

CSS classes change frequently during UI refactors and ID attributes are often
inconsistent in React apps. data-testid attributes are added explicitly for
testing and are stable across styling changes. The tradeoff is that developers
need to maintain these attributes in markup — but this is a worthwhile investment
for test reliability.

### 2. .filter({ hasText }) over .last() for message assertions

.last() assumes the target message is always the final DOM element, which breaks
as soon as any other message exists in the chat. .filter({ hasText }) targets
exact content regardless of position. The tradeoff is slightly more verbose
syntax, but the gain in reliability is significant in a real-time chat where
message order is non-deterministic.

### 3. Postman over Playwright API tests for Part 3

Postman provides a clearer and more portable way to document API contract
expectations. Collections are easy to hand off to other team members and can be
run in CI via Newman. The tradeoff vs Playwright API tests is that Postman
collections require a manual import step rather than running with a single CLI
command.

---

## Test Coverage Summary

| Area | Type | Tool |
|------|------|------|
| Chat — send, delete, timeout | E2E | Playwright |
| Moderation — flag, delete | API | Postman |
| Messages API CRUD | API | Postman |
| Auth boundaries 401 and 403 | API | Postman |
| Video player, auth flows, replay | Manual | test-plan/test-cases.md |
| WebSocket and incident response | Critical Thinking | critical-thinking/answers.md |
