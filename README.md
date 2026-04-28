# streaming-platform-qa-assessment
Home task 

## Setup

\```bash
npm install
npx playwright install
\```

## Run Tests

\```bash
npx playwright test
\```

## Bug Fixes — chat.spec.ts

| # | Bug | How identified | Fix |
|---|-----|----------------|-----|
| 1 | Missing `await` before `input.fill()` | fill() is async — without await, send fires before text is entered | Added `await` |
| 2 | Selector `#message-input` incorrect | Code comment warned selector may not match DOM | Changed to `[data-testid="message-input"]` |
| 3 | `.last()` unreliable assertion | Code comment warned wrong element may be checked | Changed to `.filter({ hasText })` |

## Key Decisions

1. **data-testid over CSS selectors** — CSS classes can change with styling refactors; data-testid attributes are stable and test-specific. Tradeoff: requires devs to add attributes to markup.

2. **filter({ hasText }) over .last()** — .last() assumes position in DOM which breaks when other messages exist. filter() targets exact content. Tradeoff: slightly more verbose.

3. **Single page context for auth flow** — Used single page object and navigated between login/stream pages rather than multiple browser contexts. Simpler setup but does not simulate true multi-user concurrency.