
# RAG Chat Platform

A modern platform for **AI-powered document Q&A**!  
Upload PDF, TXT, DOCX files, organize by projects, and chat over your content using retrieval-augmented generation (RAG) on both the cloud and locally in your browser.

---

## ✨ Features

- **User Authentication** (Supabase, secure & modern UI)
- **Multi-project Management:** Organize files & chats by project
- **Cloud & Local Document Upload:** PDF, TXT, DOCX & more
- **Vector Search RAG Chat:** Cloud (Supabase + Gemini) & local chat
- **Source Citations:** See which document chunks power each answer
- **Production-Grade UI:** Elegant, responsive, includes onboarding & self-check tools
- **Live Feedback:** Toaster notifications, error boundaries
- **Robust API Integration:** Supabase + custom edge functions for processing and chat

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

---

## 💬 Support

- Join the [Lovable Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- Start with docs at [Lovable Docs](https://docs.lovable.dev/)

---

**Built with ❤️ using React, Supabase, Google Gemini, and shadcn/ui.**
