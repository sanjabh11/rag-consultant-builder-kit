# Phase 1: Workflow Engine (n8n)

## Description
Integrate n8n as the no-code workflow engine. Add API endpoints for workflow install/run/list. Update the wizard to support workflow selection and install templates.

## Tasks
- [ ] Add @n8n/sdk to dependencies
- [ ] Implement /api/workflows/install, /run, /list endpoints
- [ ] Wizard step: workflow platform picker, template gallery
- [ ] Test: curl install, list, and run endpoints

## Acceptance Criteria
- Users can install and run workflow templates via API/UI
- Wizard supports workflow platform selection
- All endpoints verified with curl

---

**Created:** 2025-07-09
**Owner:** AI Agent
