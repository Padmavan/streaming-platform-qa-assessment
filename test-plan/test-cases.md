## 2a. Test Plan

### Scope
- Chat functionality (send, receive, emoji, replay alignment)
- Moderation tools (delete, timeout, flag)
- Video player states (play, pause, seek, buffer, error)
- Authentication flows (login, signup, session expiry, protected routes)
- WebSocket connection stability

### Test Types
- **Smoke** — core flows work after each deployment
- **Functional** — all features behave per spec
- **Regression** — existing features not broken by new changes
- **Compatibility** — Chrome, Firefox, Safari; desktop and mobile

### Tools
- **Playwright** — UI and E2E automation
- **Postman** — API contract and negative testing
- **Notion / TestRail** — test case management

### Entry Criteria
- Staging environment is stable and accessible
- Test accounts provisioned (regular user, moderator, timed-out user)
- Latest build deployed to staging

### Exit Criteria
- All critical and high severity test cases pass
- No open bugs of Critical or High severity
- Regression suite passes at 100%

---

### Top 3 Business Risks

**Risk 1 — Chat messages lost during WebSocket reconnection**
- **Impact:** Users lose messages during network drops; moderators miss harmful content
- **Mitigation:** Test reconnection scenarios with simulated network loss; verify message queue and replay on reconnect

**Risk 2 — Moderation actions not propagating in real time**
- **Impact:** Deleted or timed-out users can continue posting; harmful content remains visible
- **Mitigation:** Test delete/timeout across multiple concurrent sessions; verify all clients receive update within acceptable latency

**Risk 3 — Unauthenticated access to protected routes and WebSocket**
- **Impact:** Security breach; anonymous users post messages or access private streams
- **Mitigation:** Test all auth boundaries; verify 401 responses on API and WS without valid token

---

## 2b. Manual Test Cases

### Faulty Test Cases Analysis

**TC02 is incorrect:**
The expected result checks for an internal CSS class ("emoji CSS class is present") rather than validating the user-visible outcome. A CSS class can be present without the emoji rendering correctly. The correct expected result should be: "Emoji character is visually rendered and displayed correctly in the chat message."

**TC06 is incorrect:**
The precondition states the user is not logged in AND a WS connection is established — this is a contradiction. A properly secured system should reject WS connections without a valid auth token. Furthermore, the expected result ("Server accepts message, displays with Guest label") describes a security vulnerability, not correct system behaviour. The correct expected result should be: "Server rejects the message with 401 Unauthorized and closes the WS connection."

---

### Additional Test Cases

| ID | Title | Preconditions | Steps | Expected Result | Severity |
|----|-------|--------------|-------|----------------|----------|
| TC07 | Login with valid credentials | User has registered account | 1. Go to /login 2. Enter valid email and password 3. Click Login | User is redirected to home page; session cookie is set | Critical |
| TC08 | Login with invalid password | User has registered account | 1. Go to /login 2. Enter valid email, wrong password 3. Click Login | Error message shown; user stays on login page; no session created | High |
| TC09 | Access protected route without session | User is not logged in | 1. Navigate directly to /stream/1 | User is redirected to /login | High |
| TC10 | Session expiry redirects to login | User is logged in with expired session | 1. Let session expire 2. Attempt any authenticated action | User is redirected to /login; session cleared | High |
| TC11 | Video player play and pause | User is logged in, stream is live | 1. Click Play 2. Verify video plays 3. Click Pause 4. Verify video pauses | Video responds correctly to play/pause controls; state updates in UI | High |
| TC12 | Video player buffering state | User is logged in, throttle network to slow 3G | 1. Start playback 2. Throttle network | Buffering spinner appears; playback resumes when bandwidth recovers | Medium |
| TC13 | Video player error state | User is logged in, stream URL is invalid | 1. Navigate to stream with broken source | Error message displayed to user; player does not crash silently | High |
| TC14 | Flag a message | Moderator is logged in | 1. Hover over any message 2. Click Flag 3. Confirm | Message is flagged; appears in moderation queue; flag count increments | High |
| TC15 | Emoji renders across browsers | Logged-in user, test in Chrome and Safari | 1. Send message with emoji in Chrome 2. Open same stream in Safari | Emoji renders identically in both browsers | Medium |
| TC16 | Replay chat aligns to timestamp | Stream has ended, recording available | 1. Seek video to T+10min 2. Observe chat panel | Chat messages displayed match the timestamp; no messages from future or past shown | High |
| TC17 | Sign up with existing email | Email already registered | 1. Go to /signup 2. Enter existing email 3. Submit | Error shown: "Email already in use"; no duplicate account created | High |
| TC18 | Simultaneous chat and video playback | User is logged in | 1. Start video playback 2. Send chat message while video plays | Video continues without interruption; message is sent and appears in chat | Medium |

---

## 2c. Exploratory Testing Notes

**Scenario 1 — Rapid message flooding**
Send 50+ messages in quick succession from a single user. Probing for rate limiting, UI rendering performance, and whether the chat panel freezes or drops messages. Worth exploring because no structured test covers high-volume input and it is a realistic abuse vector.

**Scenario 2 — Emoji edge cases**
Send messages containing only emojis, mixed emoji+RTL text (Arabic/Hebrew), and emojis outside the Basic Multilingual Plane (e.g. family emojis 👨‍👩‍👧). Probing for encoding issues, layout breaks, and database truncation. Worth exploring because emoji handling is explicitly in scope and these edge cases are frequently missed.

**Scenario 3 — Moderator actions during stream replay**
While watching a replay, attempt to use moderation tools (delete, timeout, flag). Probing whether the UI correctly disables or hides moderation controls in replay mode, or whether an action taken against a historical message causes unexpected side effects on the live session. Worth exploring because replay and live modes share UI components and the interaction between them is a likely blind spot.