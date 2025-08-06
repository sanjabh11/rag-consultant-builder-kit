
# RAG Chat Platform

A modern platform for **AI-powered document Q&A**!  
Upload PDF, TXT, DOCX files, organize by projects, and chat over your content using retrieval-augmented generation (RAG) on both the cloud and locally in your browser.

---

## ✨ Features

- **User Authentication** (Supabase, secure & modern UI)
- **Multi-project Management:** Organize files & chats by project
- **Multi-Tenant Support:** Enterprise-grade tenant isolation, RBAC, and team management
- **Cloud & Local Document Upload:** PDF, TXT, DOCX & more
- **Vector Search RAG Chat:** Cloud (Supabase + Gemini/OpenAI/LLM) & local chat
- **Pluggable LLM Providers:** Easily switch between Gemini, OpenAI, LLaMA/vLLM, and more
- **Custom Embedding Endpoints:** Use your own embedding service via `EMBEDDING_ENDPOINT`
- **Cost Estimator:** Real-time monthly cost breakdown for LLM, GPU, storage, workflows, and more
- **Source Citations:** See which document chunks power each answer
- **Production-Grade UI:** Elegant, responsive, includes onboarding & self-check tools
- **Live Feedback:** Toaster notifications, error boundaries
- **Robust API Integration:** Supabase + custom edge functions for processing and chat

---

## 🔌 Pluggable LLM & Embedding Providers

- Select your LLM provider (Gemini, OpenAI, LLaMA, etc.) per project or tenant.
- Configure via the UI or API using the `llm_provider` parameter.
- Add a private embedding service by setting the `EMBEDDING_ENDPOINT` environment variable (supports vLLM, LLaMA, etc.).
- Supports both cloud-hosted and self-hosted LLMs for maximum flexibility.

**Environment Variables:**
- `OPENAI_API_KEY`, `GEMINI_API_KEY`, `EMBEDDING_ENDPOINT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_ANON_KEY`

---

## 🏢 Multi-Tenant & Team Management

- Isolate data and workflows by tenant (organization, workspace, or client)
- Invite users, assign roles (owner, admin, user, viewer), and manage permissions per tenant
- Switch tenants from the UI; all data, documents, and workflows are scoped
- Row Level Security (RLS) ensures strict tenant isolation in the database

---

## 💸 Cost Estimator

- See a live breakdown of estimated monthly costs for:
    - LLM API usage (tokens, provider)
    - GPU compute (if using self-hosted models)
    - Vector DB storage
    - Workflows (n8n integration)
    - Storage & bandwidth
- Cost estimator updates dynamically as you change project settings
- Powered by `/src/services/costEstimator.ts`

---

## 🗺️ Roadmap

---

## 🚦 Implementation Status (as of August 2025)

**Completed:**
- Cloud migration: Supabase Cloud and n8n Cloud supported (no Docker required)
- Guest login, RBAC, SSO (Google, GitHub, Okta, Azure AD), and team management
- Pricing engine, cost estimator, and billing
- Observability: Sentry, Logflare, error boundaries, audit logging
- Compliance: HIPAA/GDPR schema, RLS, audit logs, consent, retention
- Premium, mobile-optimized UI with glassmorphism, hero section, fade-in animations
- All mock data removed; production-ready edge functions

**Pending:**
- n8n Cloud integration testing (blocked by cloud setup)
- Vector store abstraction (planned)
- Additional E2E tests and documentation polish

---

## 🚀 Getting Started

1. **Clone the repo:**
   ```bash
   git clone <repo-url>
   cd rag-consultant-builder-kit
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in Supabase/n8n/Sentry/Logflare keys
   - `.env` and `.env.*` are gitignored for security
4. **Run locally:**
   ```bash
   npm run dev
   ```
5. **Build for production:**
   ```bash
   npm run build && npm start
   ```

---

## 🗄️ Database Tables (Key Schemas)

- `users`, `tenants`, `projects`, `roles`, `permissions`, `user_roles`
- `documents`, `document_chunks`, `chats`, `chat_messages`
- `pricing_plans`, `subscriptions`, `usage_records`, `billing_history`
- `compliance_policies`, `audit_logs`, `consent_records`, `security_incidents`

All tables use Row Level Security (RLS) for tenant isolation. See `/supabase/migrations/` for schema details.

---

## 🛠️ Developer Notes & Future Improvements

- Add more LLM and vector DB providers via the pluggable abstraction
- Enhance workflow engine once n8n Cloud is fully tested
- Improve E2E and integration test coverage
- Expand compliance features for SOC 2, CCPA, etc.
- Review `/docs/improvement.md` for ongoing backlog
- For schema changes, update `/supabase/migrations/` and document in PRD

---


| Feature                | Status    |
|------------------------|-----------|
| RAG Q&A Pipeline       | Done      |
| Pluggable LLM Provider | Done      |
| Multi-Tenant Support   | Partial   |
| n8n Workflow Builder   | Partial   |
| Cost Estimator         | Done      |
| Team/Roles Management  | Partial   |
| White-label UI         | Planned   |
| GPU/vLLM Deployment    | Planned   |

---

---

## 🚀 Quickstart

1. **Clone this repo**  
    `git clone <your-repo-url> && cd rag-chat-platform`

2. **Install dependencies**  
    `npm install`

3. **Supabase Setup**
    - Create a project at [supabase.com](https://supabase.com)
    - Copy your Supabase URL & anon keys to `src/integrations/supabase/client.ts`
    - Add secrets in Supabase Edge Functions:
        - `GOOGLE_AI_API_KEY` and `GEMINI_API_KEY`

4. **Database Migrations**  
    - In Supabase Studio, run migrations in `supabase/migrations/`.
    - You should have tables: `projects`, `documents`, `document_chunks`, `rag_queries`, `profiles`, and more (see below!).

5. **Deploy Edge Functions**  
    - Use the Supabase CLI:
      ```
      supabase functions deploy process-document
      supabase functions deploy query-rag
      supabase functions deploy get-embedding
      ```

6. **Start App**   
    `npm run dev`  
    Visit [http://localhost:5173](http://localhost:5173)

---

## 🟦 Supabase Schema

### Main Tables

| Table             | Description                           |
|-------------------|--------------------------------------|
| `projects`        | Project metadata per user            |
| `documents`       | Uploaded files, one row per doc      |
| `document_chunks` | Text chunks + vector embeddings      |
| `rag_queries`     | User Q&A history, answer metadata    |
| `profiles`        | User details, credits and tier       |

**See `/supabase/migrations` for full column and index list.**  
This schema supports fast semantic retrieval + user privacy via [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security).

---

## 🧑‍💻 For Developers

- **UI**: React 18, Vite, TailwindCSS, shadcn/ui, Lucide icons
- **State**: React Query, React Context
- **Backend**: Supabase (auth+db), Edge Functions (for RAG)
- **AI**: Gemini Pro (edge functions call Google's API for chat/vector)
- **Component directory**: see `/src/components`
- **API hooks**: see `/src/hooks`
- **Toasts, error boundaries and onboarding** built-in for production use
- **Edge Function deploy**: see above for CLI instructions

### Security Checklist

- Auth required for all sensitive routes
- RLS enabled on main data tables
- No secrets in code, only env/secrets manager
- API error handling via error boundaries and server responses
- All cloud uploads run through Supabase storage + edge function validation

---

## 🛡️ Upgrade/Customize

- Want custom RAG logic? Edit edge functions.
- Add support for more file types? See `/src/components/CloudDocumentUpload.tsx`
- Need analytics? Leverage the included event tables, or add your own.

---

## 💡 Helpful commands

| Command             | Purpose                        |
|---------------------|-------------------------------|
| `npm run dev`       | Start dev environment         |
| `npm run build`     | Production build              |
| `supabase db push`  | Apply DB changes              |
| `supabase functions serve` | Local Edge Function dev |

---

## 📝 Contribution & Community

- Fork + PRs welcome!
- See [Lovable docs](https://docs.lovable.dev/) to deploy to your own domain

---

## 🧩 Extending This App

- Add usage analytics in `analytics_events`
- Customize onboarding in `OnboardingGuide.tsx`
- Add advanced team/roles management with more Supabase tables
- Extend multi-tenant logic for new business models
- Integrate more LLM/embedding providers or custom endpoints
- Build custom workflow nodes for n8n

---

## 💬 Support

- Join the [Lovable Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- Start with docs at [Lovable Docs](https://docs.lovable.dev/)

---

**Built with ❤️ using React, Supabase, Google Gemini, and shadcn/ui.**
