<div align="center">

# 🤖 AI Chat Bot — A Personal Assistant

**A full-featured, intelligent AI chatbot powered by Google Gemini and built with Next.js 14.**  
*Real-time streaming responses, multi-session chat, voice input, AI personalization, authentication, and customizable themes.*

<p align="center">
  <img src="https://img.shields.io/badge/Google%20Gemini-3.7%20%2F%203.6%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Next.js-14%20(App%20Router)-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

[Quickstart](#-getting-started) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Deployment](#-deployment) • [API Key Setup](#-getting-your-free-gemini-api-key)

---

</div>

## ✨ Features

### 🧠 Intelligent Conversational AI
- **⚡ Real-Time Streaming**: Responses stream token-by-token for an ultra-fast, responsive chat experience.
- **🤖 Model Selector**: Switch seamlessly between **Gemini 3.7 Flash**, **Gemini 3.6 Flash**, **Gemini 3.5 Flash**, and **Gemini 3.5 Flash Lite**.
- **🎯 AI Creativity Controls**: Adjust the AI temperature slider from *Precise (0.1)* for coding/math to *Creative (1.0)* for brainstorming and writing.
- **📝 Rich Markdown & Code Highlighting**: Full Markdown rendering with syntax-highlighted code blocks, tables, lists, and blockquotes.

### 👤 Profile & AI Personalization
- **🧠 Custom AI Instructions**: Tell the assistant who you are (e.g. your profession, skill level) and how you prefer answers structured.
- **🎭 Response Styles**: Choose between *Balanced & Friendly*, *Concise & Direct*, *Detailed & Comprehensive*, or *Academic*.
- **🎨 Custom Avatar Picker**: Personalize your profile with custom avatars.
- **📊 Usage Analytics**: Live tracking of total conversations and messages sent.

### 🔐 Authentication & Session Management
- **🔑 Built-in Auth**: Sign Up and Sign In with local SHA-256 password hashing.
- **⚡ 1-Click Demo Login**: Instantly test features with a guest profile.
- **💾 Multi-Session Sidebar**: Create new chats, switch between past conversations, and delete sessions.
- **🔄 Local Persistence**: Chat history and user preferences persist safely across browser sessions.

### 🎙️ Voice & Accessibility
- **🎤 Continuous Voice Input**: Dictate prompts naturally with live transcript streaming powered by the Web Speech API.
- **🌍 Multilingual Speech**: Support for English (US, UK, India), Spanish, French, German, Hindi, Bengali, Japanese, and more.
- **🌙 Dark & Light Modes**: Glassmorphism design with a theme toggle.
- **📤 Export Chats**: Download conversations as formatted `.md` (Markdown), `.txt`, or complete `.json` backups.
- **📋 1-Click Copy**: Copy code snippets or AI responses directly to the clipboard.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Frontend Library** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | Modern Vanilla CSS (Design Tokens, Glassmorphism, CSS Variables) |
| **AI Integration** | [`@google/genai`](https://www.npmjs.com/package/@google/genai) (Google Gemini SDK) |
| **Markdown Rendering** | `react-markdown`, `remark-gfm`, `react-syntax-highlighter` |
| **Voice Processing** | Web Speech API (`SpeechRecognition`) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js 18+](https://nodejs.org/) installed on your machine
- A free [Google Gemini API Key](https://aistudio.google.com/app/apikey)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Mahadebmaity/AI-Chat-Bot---A-Personal-Asistant-.git
cd AI-Chat-Bot---A-Personal-Asistant-
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# .env.local
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

> 💡 *See [Getting Your Free Gemini API Key](#-getting-your-free-gemini-api-key) below if you don't have a key yet.*

### 4. Run Development Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the app!

---

## 🔑 Getting Your Free Gemini API Key

1. Visit **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2. Sign in with your Google account.
3. Click **"Create API Key"**.
4. Copy the generated key (starts with `AIza...`) and paste it into your `.env.local` file.

---

## 📁 Project Structure

```
my-assistant/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # 🔒 Secure serverless Gemini API streaming endpoint
│   ├── components/
│   │   ├── AuthModal.tsx         # 🔐 Sign In & Sign Up modal with avatar picker
│   │   ├── ChatWindow.tsx        # 💬 Message display, syntax highlighter & typing indicator
│   │   ├── ExportButton.tsx      # 📤 Export conversations as TXT, MD, or JSON
│   │   ├── MessageInput.tsx      # ⌨️ Auto-resizing input, voice recording & model selector
│   │   ├── ProfileModal.tsx      # 👤 User profile & AI custom instructions
│   │   ├── SettingsModal.tsx     # ⚙️ App preferences, temperature slider & voice language
│   │   └── Sidebar.tsx           # 📑 Session management, user profile pill & theme toggle
│   ├── hooks/
│   │   ├── useAuth.ts            # 🔒 Auth state, password hashing & profile management
│   │   ├── useChatSessions.ts    # 💾 Multi-session CRUD & localStorage persistence
│   │   └── useTheme.ts           # 🌙 Dark/Light mode detection & management
│   ├── globals.css               # 🎨 Complete design system with CSS custom properties
│   ├── layout.tsx                # 🌐 HTML layout, SEO meta tags & font imports
│   └── page.tsx                  # 📱 Main application layout & state orchestrator
├── .env.example                  # 📋 Template for environment variables
├── package.json
└── README.md
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

The easiest way to deploy this Next.js application is with **[Vercel](https://vercel.com)**:

1. Push your repository to **GitHub**.
2. Go to **[Vercel](https://vercel.com/)** and click **"Add New Project"** → Import this repository.
3. Under **Environment Variables**, add:
   - **NAME**: `GEMINI_API_KEY`
   - **VALUE**: `your_actual_gemini_api_key`
4. Click **Deploy**.

Your chatbot will be live with a free SSL-secured domain in under a minute!

---

## 🔒 Security & Privacy

- **Server-Side API Calls**: Your `GEMINI_API_KEY` is only used on the server side in `app/api/chat/route.ts` and is **never exposed** to the client browser.
- **Local Storage**: All chat histories and user accounts are saved locally on the client's device, ensuring complete privacy.

---
<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Mahadebmaity">Mahadeb Maity</a> using Google Gemini and Next.js</sub>
</div>