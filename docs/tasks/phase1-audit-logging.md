# Phase 2: Audit Logging

## Description
Implement audit logging for all critical actions. Add an audit_logs table and wrap Edge Functions and sensitive API endpoints with log insertions.

## Tasks
- [ ] Create audit_logs table (actor, action, payload, ts)
- [ ] Add logging to Edge Functions
- [ ] Add logging to sensitive API endpoints
- [ ] Test: verify logs are written on key actions

## Acceptance Criteria
- Audit logs table exists
- Logs written for all critical actions
- Manual/automated test verifies logging

---

**Created:** 2025-07-09
**Owner:** AI Agent
