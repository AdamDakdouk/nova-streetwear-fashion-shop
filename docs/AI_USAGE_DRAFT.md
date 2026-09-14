# AI Usage — Draft Log (NOT the submission document)

> This is a factual, dated log of what an AI assistant (Claude, via Claude Code) did during this build. The assessment requires the AI-usage disclosure to be **written manually, in your own words** — same as the architecture docs. Rewrite this in your own voice before submitting; do not submit this file as-is.

## Tool

Claude Code (Anthropic), interactive CLI/agent session, running the `claude-sonnet-5` model.

## Scope of AI involvement

- The assistant read the assessment PDF, then generated a full implementation plan (`docs/superpowers/plans/2026-09-14-ecommerce-platform.md`) covering the data model, API contract, file structure, and a 19-task build order.
- The assistant then wrote essentially all of the initial code: backend models/services/controllers/routes/tests, and frontend components/pages/hooks/api clients/tests, following that plan.
- The assistant made and documented several explicit engineering tradeoffs along the way (see `NOTES_DATABASE.md` / `NOTES_BACKEND.md` / `NOTES_FRONTEND.md`) — e.g. embedded cart vs. separate collection, per-axis vs. per-combination stock, localStorage vs. httpOnly-cookie token storage, optimistic vs. transactional checkout concurrency.
- Two decisions were escalated to the human developer for a judgment call before implementation: whether product browsing should require login, and the repo/version-control strategy (monorepo vs. split repos) — both were confirmed by the developer before proceeding.
- The assistant ran (and iterated against) `tsc`, `jest`, and `vitest` locally to verify the code actually compiles and the test suites pass, and ran a browser-based manual walkthrough at desktop/tablet/mobile viewports before calling the build done.

## What to fill in yourself before submitting

- Which parts of the generated code you reviewed line-by-line vs. accepted as-is.
- Any changes you made after the AI's initial pass, and why.
- Your own assessment of what you would have done differently, and what you learned from reviewing the AI's approach (stock-resolution model, layering, etc.).
- The exact date(s) this work was done.
