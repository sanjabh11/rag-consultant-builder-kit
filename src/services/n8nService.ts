// n8nService.ts
// Service for interacting with n8n API for workflows (fetch and deploy)

import axios from 'axios';

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags?: string[];
  nodes?: any[];
  [key: string]: any;
}

export async function fetchN8nWorkflows(n8nUrl: string, apiKey?: string): Promise<N8nWorkflow[]> {
  const headers: Record<string, string> = apiKey ? { 'X-N8N-API-KEY': apiKey } : {};
  const res = await axios.get(`${n8nUrl.replace(/\/$/, '')}/rest/workflows`, { headers });
  return res.data.data || [];
}

export async function deployN8nWorkflow(n8nUrl: string, workflow: N8nWorkflow, apiKey?: string): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'X-N8N-API-KEY': apiKey } : {})
  };
  const res = await axios.post(
    `${n8nUrl.replace(/\/$/, '')}/rest/workflows`,
    workflow,
    { headers }
  );
  return res.data;
}
