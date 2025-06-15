
# RAG Chat Platform

A comprehensive Retrieval-Augmented Generation (RAG) chat platform that allows users to upload documents and have intelligent conversations with AI about their content. Built with React, TypeScript, Supabase, and Google's Gemini AI.

## 🚀 Features

### Core Functionality
- **Document Upload & Processing**: Support for PDF, TXT, DOCX, and other document formats
- **Intelligent Chat**: AI-powered conversations about your uploaded documents
- **Vector Search**: Advanced semantic search using embeddings for relevant context retrieval
- **Project Management**: Organize documents and conversations by projects
- **Cloud & Local Storage**: Choose between cloud-based or local document storage

### Authentication & Security
- **User Authentication**: Secure sign-up and sign-in with email/password
- **Row Level Security (RLS)**: User data isolation at the database level
- **Project-based Access Control**: Users can only access their own projects and documents

### Advanced Features
- **Real-time Processing**: Live status updates during document processing
- **Chunk-based Retrieval**: Smart document chunking for better context relevance
- **Token Usage Tracking**: Monitor AI API usage and costs
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Edge Functions, Storage, Auth)
- **AI/ML**: Google Gemini API for embeddings and chat completion
- **State Management**: React Query (TanStack Query), React Context
- **Routing**: React Router DOM

## 🏗 Architecture

### Database Schema
- **Projects**: User projects for organizing documents
- **Documents**: Uploaded files with metadata
- **Document Chunks**: Text chunks with vector embeddings for search
- **RAG Queries**: Chat history and AI responses
- **User Profiles**: Extended user information

### Edge Functions
- **process-document**: Handles document upload, text extraction, and chunking
- **query-rag**: Performs vector search and generates AI responses
- **get-embedding**: Generates embeddings using Gemini API

## 📋 Prerequisites

Before running this application, ensure you have:

1. **Node.js** (v18 or higher) and npm installed
2. **Supabase Account** - [Sign up at supabase.com](https://supabase.com)
3. **Google AI API Key** - [Get one from Google AI Studio](https://makersuite.google.com/app/apikey)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd rag-chat-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your project URL and anon key
3. Update the Supabase configuration in `src/integrations/supabase/client.ts`:

```typescript
const supabaseUrl = "YOUR_SUPABASE_URL"
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"
```

### 4. Configure Environment Variables

The application uses Supabase secrets for API keys. Set these in your Supabase dashboard:

1. Go to Settings → Edge Functions → Secrets
2. Add the following secrets:
   - `GOOGLE_AI_API_KEY`: Your Google AI API key
   - `GEMINI_API_KEY`: Your Google AI API key (same as above)

### 5. Set Up the Database

Run the SQL migrations provided in the `supabase/migrations/` folder through your Supabase SQL editor, or use the Supabase CLI:

```bash
# If using Supabase CLI
supabase db reset
```

### 6. Deploy Edge Functions

Deploy the Supabase Edge Functions:

```bash
# Using Supabase CLI
supabase functions deploy process-document
supabase functions deploy query-rag
supabase functions deploy get-embedding
```

### 7. Configure Authentication

1. In your Supabase dashboard, go to Authentication → Settings
2. For development, you may want to disable "Confirm email" for faster testing
3. Configure your Site URL and redirect URLs as needed

### 8. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your application running.

## 📱 How to Use

### Getting Started
1. **Sign Up**: Create an account using email and password
2. **Create Project**: Click the "+" button next to the project selector to create your first project
3. **Upload Documents**: Use either Cloud or Local storage tabs to upload your documents
4. **Start Chatting**: Ask questions about your uploaded documents in the chat interface

### Document Upload
- **Supported Formats**: PDF, TXT, DOCX, and more
- **Cloud Storage**: Documents stored in Supabase with vector embeddings
- **Local Storage**: Documents processed locally in your browser

### Chat Interface
- **Context-Aware**: AI responses are based on relevant chunks from your documents
- **Source Citations**: See which document sections were used to generate responses
- **Real-time Processing**: Live updates during document processing and query execution

### Project Management
- **Multiple Projects**: Organize documents by different projects or topics
- **Project Switching**: Easy switching between projects via the header dropdown
- **Project Settings**: Edit project names and descriptions

## 🔧 Configuration

### Supabase Settings

Ensure your Supabase project has:
- Vector extension enabled for embeddings
- Proper RLS policies for data security
- Edge Functions deployed and configured
- Storage buckets created with appropriate policies

### Google AI Configuration

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your Supabase Edge Function secrets
3. The application uses Gemini Pro for text generation and text-embedding-004 for embeddings

## 🚀 Deployment

### Deploy to Vercel/Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your preferred hosting platform
3. Ensure your Supabase project is properly configured for production

### Supabase Production Setup
1. Update your authentication redirect URLs for production
2. Configure your custom domain if needed
3. Monitor Edge Function logs for any issues

## 🔐 Security Features

- **Row Level Security**: Database-level isolation of user data
- **Authentication Required**: All sensitive operations require user authentication
- **Input Validation**: Comprehensive validation of file uploads and user inputs
- **Error Handling**: Graceful error handling with user-friendly messages

## 📊 Monitoring & Analytics

- **Usage Tracking**: Monitor document processing and chat interactions
- **Token Usage**: Track AI API usage for cost management
- **Error Logging**: Comprehensive error logging in Edge Functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the browser console for error messages
2. Review Supabase Edge Function logs
3. Ensure all environment variables are properly set
4. Verify your Google AI API key is valid and has sufficient quota

## 🔄 Updates & Maintenance

- Regularly update dependencies for security patches
- Monitor Supabase and Google AI API service status
- Keep an eye on API usage to manage costs
- Backup your database regularly

---

**Built with ❤️ using React, Supabase, and Google AI**
