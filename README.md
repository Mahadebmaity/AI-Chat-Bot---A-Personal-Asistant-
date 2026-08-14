# 🤖 My Assistant — Gemini AI Chatbot

A beautiful, full-featured AI chatbot powered by **Google Gemini**, built with **Next.js 14**.

![My Assistant](https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4?style=for-the-badge&logo=google)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)

## ✨ Features

- 🌙 **Dark & Light Mode** — with a toggle switch
- 💬 **Multiple Chat Sessions** — create, switch, and delete chats (like ChatGPT)
- 📝 **Markdown Rendering** — bold, code blocks, tables, lists
- 🔄 **Streaming Responses** — AI types out answers in real-time
- 🎤 **Voice Input** — speak your message instead of typing
- 📋 **Copy Responses** — one-click copy any AI reply
- 📤 **Export Chats** — download as `.txt` or `.md`
- 🤖 **Model Selector** — choose between Gemini 3.6 Flash, 3.5 Flash Lite, or 3.1 Pro
- 💾 **Persistent History** — chats saved in your browser across refreshes
- 🔒 **Secure** — API key stays on the server, never exposed to the browser

---

## 🔑 Step 1: Get Your FREE Gemini API Key

> This takes less than 60 seconds!

1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**
2. Sign in with your Google account (it's free)
3. Click **"Create API Key"**
4. Copy the key that appears (it starts with `AIza...`)

---

## 🚀 Step 2: Setup the Project

### Prerequisites
- [Node.js 18+](https://nodejs.org/) installed

### Installation

```bash
# Install dependencies (already done if you followed the guide)
npm install

# Create your environment file
# (This file already exists in the project, just edit it)
```

### Add Your API Key

Open the file `.env.local` in the project root and replace the placeholder:

```bash
# .env.local
GEMINI_API_KEY=AIzaSyYourActualKeyHere
```

> ⚠️ **Important**: Never share this file or commit it to GitHub. It's already in `.gitignore`.

---

## 🖥️ Step 3: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see My Assistant! 🎉

---

## 🌐 Step 4: Deploy to Vercel (Free)

1. Push your code to **GitHub** (make sure `.env.local` is in `.gitignore` ✅)
2. Go to **[vercel.com](https://vercel.com)** and sign in
3. Click **"Add New Project"** → Import your GitHub repo
4. In the **"Environment Variables"** section, add:
   - Name: `GEMINI_API_KEY`
   - Value: your API key
5. Click **"Deploy"** — done! 🚀

Your chatbot will be live at `https://your-project.vercel.app`

---

## 📁 Project Structure

```
my-assistant/
├── app/
│   ├── api/chat/route.ts      # 🔒 Secure Gemini API backend
│   ├── components/
│   │   ├── Sidebar.tsx        # Session list + theme toggle
│   │   ├── ChatWindow.tsx     # Messages + typing indicator
│   │   ├── MessageInput.tsx   # Input + voice + model selector
│   │   └── ExportButton.tsx   # Download chat
│   ├── hooks/
│   │   ├── useChatSessions.ts # Session management
│   │   └── useTheme.ts        # Dark/light theme
│   ├── globals.css            # Full design system
│   ├── layout.tsx             # Root layout + SEO
│   └── page.tsx               # Main app
├── .env.local                 # 🔑 Your API key (git-ignored)
└── README.md
```

---

## 🛟 Troubleshooting

| Problem | Solution |
|---|---|
| `401` error / "API key not set" | Check `.env.local` has the correct key, restart dev server |
| Blank page on load | Run `npm run build` to see TypeScript errors |
| Voice input not working | Use Chrome or Edge (Firefox doesn't support Web Speech API) |
| Chat not saving | Enable localStorage in browser settings |

---

## 📄 License

MIT — free to use, modify, and deploy!

Built with ❤️ using [Google Gemini API](https://ai.google.dev) and [Next.js](https://nextjs.org)
