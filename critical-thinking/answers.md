## Q1 — WebSocket Interruption

**How would you simulate network loss mid-stream?**
- Use Chrome DevTools to throttle network to 0kbps at a specific moment during streaming
- For more realistic scenarios — use a network proxy tool like Charles Proxy 

**What would you validate?**

- Chat input is disabled or shows "reconnecting..." indicator during disconnection
- No messages are silently lost — any message typed during disconnect is either queued or user is warned
- Reconnection attempt begins automatically within an acceptable timeout (e.g. within 3 seconds)
- After reconnection — missed messages are replayed in correct order
- Video player shows buffering state, not a silent freeze or crash
- WebSocket connection ID or session token is preserved or correctly re-established after reconnect

**How would you know reconnection was successful?**

- UI reconnection indicator disappears and chat input is re-enabled
- A new WebSocket handshake is visible in browser DevTools (Network → WS tab) with status 101
- User can send a message successfully post-reconnect and it appears in chat
- Server-side logs confirm new WS session linked to same authenticated user
- Any messages sent by others during the disconnect window appear in chat after reconnect (gap fill)

## Q3 — Live Incident Communication

**Scenario: Critical bug found 10 minutes before a major live stream.**

**Minute 0-2 — Assess and confirm**
- Reproduce the bug immediately to confirm it is real and not a false alarm
- Determine scope: does it affect all users or a subset? Is it a blocker for the stream starting?
- Check if there is a quick workaround (feature flag, rollback, config change)

**Minute 2-5 — Immediate escalation**
- Notify the Engineering Lead and Product Manager simultaneously via Slack/phone

  > "Critical bug confirmed on staging/prod: [one sentence description].
  > Impact: [who is affected and how].
  > Stream starts in 8 minutes.
  > Workaround available: Yes/No.
  > Decision needed: delay stream / proceed with risk / rollback."

- Open a war room (Slack channel or Zoom) immediately so all stakeholders are in one place

**Minute 5-9 — Support the decision**
- Provide engineering with all reproduction steps, logs, and environment details
- If a hotfix is possible in time — assist with verification immediately after fix
- If no fix is possible — document the known impact so the team can communicate to users if needed
- QA does not make the go/no-go call — that is Product/Engineering — but QA provides the clearest possible picture of risk

**Minute 9-10 — Document**
- Write a brief incident note: what was found, when, by whom, what decision was made

**After the stream**
- Write a full incident report: timeline, root cause, impact, resolution
- Propose a regression test to cover this scenario going forward
- Participate in post-mortem to prevent recurrence
