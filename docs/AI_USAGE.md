# AI Methodology & Lifecycle Integration

## Overview

AI tools were used extensively throughout the development lifecycle of this project—not merely as a passive snippet generator, but as an active coding assistant, architectural sounding board, and rapid prototyping partner. Rather than masking AI involvement, this document transparently outlines how these tools were integrated into the workflow, where they accelerated development, and where critical human intervention was required to debug complex system behavior.

Full transparency of AI integration is also reflected in the repository history; key commits bear explicit `Co-authored-by:` git trailers.

## Workflow Integration & Scope

AI tools were integrated across the following core phases:

- **Initial Scaffolding & Boilerplate:** Generating initial TypeScript interfaces, setting up basic Express route handlers, and scaffolding React component structures.
- **Component Styling & Layouts:** Writing utility-first Tailwind layouts for standard e-commerce UI patterns (product cards, grid structures, checkout forms).
- **Test Case Generation:** Expanding edge-case coverage for pure logical units, such as search filtering parameters and variant selection matrices in Vitest.

## Human Intervention & Critical Real-World Debugging

While AI tools accelerated initial code generation, resolving real-world bugs, regional constraints, and hardware-specific edge cases required direct manual analysis and architectural overrides.

### 1. Vercel Routing Bug & Catch-All API 404s

**The Issue:** On the deployed production site, the homepage hero banner failed to load.

**Root Cause & Fix:** Manual inspection revealed that Vercel's serverless routing engine registered a catch-all route treating multi-segment paths as a single segment. As a result, every two-level API request (e.g., `/api/hero/images`) returned a 404 Not Found. The API routing structure and routing fallback configurations had to be manually restructured to align with Vercel's deployment runtime.

### 2. Mobile Menu Stacking Context Bug

**The Issue:** Testing the application on mobile revealed that the mobile drawer menu became completely unusable and untappable.

**Root Cause & Fix:** AI-generated CSS had placed a `backdrop-filter` property directly on the parent sticky header. In modern browser rendering engines, `backdrop-filter` creates a new containing block and stacking context, trapping fixed-positioned child elements (the mobile drawer) inside the header bounds. The layout structure was manually refactored to isolate the drawer component outside the header's stacking context.

### 3. iOS Safari Viewport Zoom on Input Focus

**The Issue:** External hardware testing on an iPhone revealed that tapping any form field caused iOS Safari to forcibly zoom in on the page, breaking the responsive viewport scale.

**Root Cause & Fix:** iOS Safari automatically triggers a canvas zoom on form controls styled with a font size smaller than 16px. Global CSS rules were updated to enforce `font-size: 16px` on all mobile inputs below the `sm` breakpoint.

### 4. Search Vocabulary & Query Alignment

**The Issue:** Initial AI-assisted search logic relied on strict title and category matches, returning zero results for common user search terms like "hat" or "belts".

**Fix:** Real-world shopping vocabulary did not map cleanly to the static catalog titles. The search indexing logic was updated to search across product descriptions, tags, and variants to handle natural search terms seamlessly.

### 5. Infrastructure & Regional Constraint Adaptation (R2 vs. Cloudinary)

**The Decision:** Cloudinary is a common AI default recommendation for image hosting. However, due to service availability restrictions in my region, Cloudinary was unusable for this deployment.

**Architectural Adjustment:** I evaluated alternatives and selected Cloudflare R2 for asset storage. S3-compatible API routes and upload handling were built manually to handle image uploads cleanly.

### 6. Architectural Documentation Accuracy

**The Intervention:** Standard AI generations often default to introducing extraneous third-party libraries (such as complex form management packages, ORMs, or schema validators). I manually drafted and vetted all four project architecture documents (`Database.md`, `Backend.md`, `Frontend.md`, and `AI_USAGE.md`) to ensure they accurately describe the precise codebase without reference to unused abstractions or external libraries.

## Summary

AI tools served as a high-velocity catalyst for writing initial code and exploring layout options. However, ensuring a robust end-to-end user experience required manual engineering oversight—specifically around deployment platform quirks, browser rendering behaviors, actual user search patterns, and regional infrastructure selection.
