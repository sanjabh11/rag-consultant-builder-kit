# Phase 1: Multi-Tenant Seed Data & RLS Tests

## Description
Seed demo tenants, users, and projects. Add Jest tests to validate Row Level Security (RLS) for tenant isolation.

## Tasks
- [ ] Create scripts/seed-demo.sql with demo tenants/users/projects
- [ ] Add Jest RLS tests for tenant/user isolation
- [ ] Terminal: supabase db reset & seed, verify isolation

## Acceptance Criteria
- Demo data seeded for at least 2 tenants
- RLS tests pass (no cross-tenant data access)
- Manual SQL/terminal checks validate isolation

---

**Created:** 2025-07-09
**Owner:** AI Agent
