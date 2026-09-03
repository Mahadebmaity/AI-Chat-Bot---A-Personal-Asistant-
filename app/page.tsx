"use client";
import { useState, useRef, useCallback } from "react";
import Sidebar from "@/app/components/Sidebar";
import ChatWindow from "@/app/components/ChatWindow";
import MessageInput from "@/app/components/MessageInput";
import ExportButton from "@/app/components/ExportButton";
import AuthModal from "@/app/components/AuthModal";
import ProfileModal from "@/app/components/ProfileModal";
import SettingsModal from "@/app/components/SettingsModal";
import { useChatSessions } from "@/app/hooks/useChatSessions";
import { useTheme } from "@/app/hooks/useTheme";
import { useAuth } from "@/app/hooks/useAuth";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthLoaded, login, signup, logout, updateProfile, updatePreferences } = useAuth();
  const {
    sessions,
    activeSession,
    activeId,
    createSession,
    switchSession,
    deleteSession,
    renameSession,
    removeLastAIMessage,
    addMessage,
    updateLastAIMessage,
    appendToLastAIMessage,
    setSessionInteractionId,
    updateSessionModel,
  } = useChatSessions(user?.id, isAuthLoaded, user?.preferences?.defaultModel);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionText, setSuggestionText] = useState("");

  // Modal states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string, modelOverride?: string) => {
      if (!text.trim() || isLoading) return;

      const currentSession = activeSession;
      if (!currentSession) return;

      const sessionId = currentSession.id;
      const selectedModel =
        modelOverride || currentSession.model || user?.preferences?.defaultModel || "gemini-3.7-flash";

      // 1. Add user message
      addMessage(sessionId, { role: "user", content: text });

      // 2. Add placeholder AI message
      addMessage(sessionId, { role: "ai", content: "" });

      setIsLoading(true);
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // Build history from current messages
        const currentMessages = currentSession.messages;

        // Custom API Key override if user provided one in Settings
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (user?.preferences?.apiKey && user.preferences.apiKey.trim()) {
          headers["x-gemini-api-key"] = user.preferences.apiKey.trim();
        }

        const response = await fetch("/api/chat", {
          method: "POST",
          headers,
          signal: abortController.signal,
          body: JSON.stringify({
            message: text,
            model: selectedModel,
            previousInteractionId: currentSession.previousInteractionId,
            history: currentMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            userName: user?.name,
            userBio: user?.bio,
            customInstructions: user?.preferences?.customInstructions,
            responseStyle: user?.preferences?.responseStyle,
            temperature: user?.preferences?.temperature ?? 0.7,
          }),
        });

        if (!response.ok || !response.body) {
          const err = await response.json().catch(() => ({ error: "Unknown error" }));
          appendToLastAIMessage(sessionId, `⚠️ Error: ${err.error || "Failed to connect to AI"}`);
          setIsLoading(false);
          return;
        }

        // Stream SSE response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const payload = JSON.parse(line.slice(6));
                if (payload.type === "id") {
                  setSessionInteractionId(sessionId, payload.id);
                } else if (payload.type === "text") {
                  appendToLastAIMessage(sessionId, payload.text);
                } else if (payload.type === "error") {
                  appendToLastAIMessage(sessionId, `\n\n⚠️ ${payload.error}`);
                }
              } catch {
                // ignore malformed SSE line
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          appendToLastAIMessage(sessionId, " ⏹ *(Stopped)*");
        } else {
          const msg = err instanceof Error ? err.message : "Network error";
          appendToLastAIMessage(
            sessionId,
            `⚠️ Connection error: ${msg}. Please check your internet connection.`
          );
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [activeSession, isLoading, addMessage, appendToLastAIMessage, setSessionInteractionId, user]
  );

  function handleStopGeneration() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }

  function handleRegenerate() {
    if (!activeSession || isLoading || activeSession.messages.length === 0) return;

    // Find the last user message
    const lastUserMsg = [...activeSession.messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;

    // Remove the last AI message
    removeLastAIMessage(activeSession.id);

    // Re-send the prompt
    sendMessage(lastUserMsg.content, activeSession.model);
  }

  function handleSuggestion(text: string) {
    setSuggestionText(text);
    setTimeout(() => setSuggestionText(""), 100);
  }

  function handleNewChat() {
    const preferredModel = user?.preferences?.defaultModel || activeSession?.model || "gemini-3.7-flash";
    createSession(preferredModel);
    setSidebarOpen(false);
  }

  function handleModelChange(model: string) {
    if (activeSession) {
      updateSessionModel(activeSession.id, model);
    }
  }

  function handleClearAllChats() {
    const storageKey = user?.id ? `my-assistant-sessions_${user.id}` : "my-assistant-sessions_guest";
    const activeKey = user?.id ? `my-assistant-active_${user.id}` : "my-assistant-active_guest";
    localStorage.removeItem(storageKey);
    localStorage.removeItem(activeKey);
    localStorage.removeItem("my-assistant-sessions");
    localStorage.removeItem("my-assistant-active");
    window.location.reload();
  }

  function handleExportAllData() {
    const data = {
      exportedAt: new Date().toISOString(),
      user: user
        ? {
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            preferences: user.preferences,
          }
        : "guest",
      sessions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my_assistant_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Calculate statistics
  const totalChats = sessions.length;
  const totalMessages = sessions.reduce((acc, s) => acc + s.messages.length, 0);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        theme={theme}
        user={user}
        isOpen={sidebarOpen}
        onNewChat={handleNewChat}
        onSwitch={switchSession}
        onDelete={deleteSession}
        onRename={renameSession}
        onToggleTheme={toggleTheme}
        onClose={() => setSidebarOpen(false)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={logout}
      />

      {/* Main Chat Area */}
      <main className="chat-main">
        {/* Top Bar */}
        <div className="chat-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              id="sidebar-toggle-btn"
            >
              ☰
            </button>
            <h2 className="chat-title">
              {activeSession?.title || "Your Assistant"}
            </h2>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-btn"
              onClick={() => setIsSettingsOpen(true)}
              title="Settings & API Key (⚙️)"
              aria-label="Open Settings"
              id="settings-topbar-btn"
            >
              ⚙️
            </button>
            <ExportButton
              messages={activeSession?.messages ?? []}
              sessionTitle={activeSession?.title ?? "Chat"}
            />
            <button
              className="icon-btn"
              onClick={handleNewChat}
              title="New Chat"
              aria-label="Start a new chat"
              id="new-chat-topbar-btn"
            >
              ✏️
            </button>
          </div>
        </div>

        {/* Messages */}
        <ChatWindow
          messages={activeSession?.messages ?? []}
          isLoading={isLoading}
          onSuggestion={handleSuggestion}
          onRegenerate={handleRegenerate}
        />

        {/* Input */}
        <MessageInput
          onSend={sendMessage}
          onStop={handleStopGeneration}
          isLoading={isLoading}
          initialValue={suggestionText}
          onModelChange={handleModelChange}
          currentModel={activeSession?.model ?? user?.preferences?.defaultModel ?? "gemini-3.7-flash"}
          voiceLanguage={user?.preferences?.voiceLanguage ?? "en-US"}
        />
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={login}
        onSignup={signup}
      />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateProfile={updateProfile}
        onOpenAuth={() => setIsAuthOpen(true)}
        totalChats={totalChats}
        totalMessages={totalMessages}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
        onUpdatePreferences={updatePreferences}
        onClearAllChats={handleClearAllChats}
        onExportAllData={handleExportAllData}
      />
    </div>
  );
}
