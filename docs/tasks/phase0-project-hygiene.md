# Phase 0: Project Hygiene

## Description
Establish project hygiene and foundational practices to enable safe, scalable feature delivery. Includes backlog creation, test harness, and CI setup.

## Tasks
- [ ] Create docs/tasks backlog for all PBIs (features/gaps)
- [ ] Add Jest + Supabase test harness for RLS/API
- [ ] Add ESLint + Prettier config and GitHub Actions for CI

## Acceptance Criteria
- All PBIs tracked in markdown files under docs/tasks/
- `npm run test` runs Jest and validates RLS
- CI runs lint, test, and build on PRs

---

**Created:** 2025-07-09
**Owner:** AI Agent
