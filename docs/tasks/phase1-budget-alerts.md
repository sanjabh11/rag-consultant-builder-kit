# Phase 1: Budget Alerts & Usage Metering

## Description
Implement budget alerting and usage metering. Add a table for budget thresholds, a daily Edge Function for cost checks, and email notifications when projected cost exceeds the threshold.

## Tasks
- [ ] Create budget_alerts table (tenant_id, threshold, email)
- [ ] Edge Function check-costs (runs daily)
- [ ] Send email when cost > threshold
- [ ] Test: seed alert, simulate overage, check notification

## Acceptance Criteria
- Budget alerts table exists
- Edge Function runs and sends alert
- Manual/automated test triggers alert

---

**Created:** 2025-07-09
**Owner:** AI Agent
