# Continuous Improvement Plan

This file tracks gap-analysis-driven improvements that emerged from comparing the live codebase against **PRD.md** and **prd_org.md**.

| ID | Area | Description | Priority | Status |
| --- | --- | ----------- | -------- | ------ |
| IMP-1 | Authentication | Enable **guest / anonymous login** via Supabase provider; scope guests to `guest_tenant`; update RLS + frontend auth flow | High | **Done** |
| IMP-2 | Data Quality | Remove **all mock data** (`mockTemplates`, stub edge-function responses) and show real empty-state UIs | High | **Done** |
| IMP-3 | Workflow Engine | Implement **real n8n integration**: list/install/run via edge functions, secure credential storage | High | **Blocked** (n8n Cloud pending) |
| IMP-4 | Vector Store Abstraction | Add driver interface and support Weaviate/Qdrant next to Chroma | High | Proposed |
| IMP-5 | Audit Logging | Create `audit_events` table & DB triggers for INSERT/UPDATE/DELETE per tenant | High | **In Progress** (schema in IMP-9) |
| IMP-6 | RBAC/SSO | Add SSO (Okta/AzureAD) and per-project roles | Medium | **In Progress** |
| IMP-7 | Pricing Source | Move pricing schema to DB + nightly snapshot; historical cost charts | Medium | **In Progress** |
| IMP-8 | Observability | Integrate Sentry + Logflare or Grafana Loki for edge functions | Medium | **In Progress** |
| IMP-9 | Compliance Enforcement | Policy engine to enforce HIPAA/GDPR flags on uploads & workflows | Medium | **In Progress** |
| IMP-10 | White-label Theming | Runtime theme & brand manager | Low | Proposed |
| IMP-11 | i18n & a11y | Add react-i18next + axe-core audits | Low | Proposed |
| IMP-12 | Visual Tests | Add Playwright visual regression suite | Low | Proposed |

---

## Status Legend
* **Proposed** – identified, awaiting kickoff
* **In Progress** – work has started
* **Review** – under PR / QA review
* **Done** – merged & verified

---

*Last updated: 2025-08-05*
