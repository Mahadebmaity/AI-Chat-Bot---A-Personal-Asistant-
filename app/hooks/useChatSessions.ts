"use client";
import { useState, useEffect, useCallback } from "react";

export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  previousInteractionId: string | null;
  createdAt: number;
  model: string;
}

const STORAGE_KEY = "my-assistant-sessions";
const ACTIVE_KEY = "my-assistant-active";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function createNewSession(model = "gemini-3.6-flash"): ChatSession {
  return {
    id: generateId(),
    title: "New Chat",
    messages: [],
    previousInteractionId: null,
    createdAt: Date.now(),
    model,
  };
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedActive = localStorage.getItem(ACTIVE_KEY);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setSessions(parsed);
          const active = storedActive && parsed.find((s) => s.id === storedActive);
          setActiveId(active ? active.id : parsed[0].id);
          return;
        }
      }
    } catch {
      // ignore parse errors
    }
    // Default: start with one new session
    const initial = createNewSession();
    setSessions([initial]);
    setActiveId(initial.id);
  }, []);

  // Persist on every change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      localStorage.setItem(ACTIVE_KEY, activeId);
    }
  }, [sessions, activeId]);

  const activeSession = sessions.find((s) => s.id === activeId) ?? sessions[0];

  const createSession = useCallback((model?: string) => {
    const newSession = createNewSession(model);
    setSessions((prev) => [newSession, ...prev]);
    setActiveId(newSession.id);
    return newSession;
  }, []);

  const switchSession = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (filtered.length === 0) {
          const fresh = createNewSession();
          setActiveId(fresh.id);
          return [fresh];
        }
        if (id === activeId) {
          setActiveId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeId]
  );

  const addMessage = useCallback(
    (sessionId: string, message: Omit<Message, "id" | "timestamp">) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  { ...message, id: generateId(), timestamp: Date.now() },
                ],
                // Auto-title from first user message
                title:
                  s.messages.length === 0 && message.role === "user"
                    ? message.content.slice(0, 42) + (message.content.length > 42 ? "…" : "")
                    : s.title,
              }
            : s
        )
      );
    },
    []
  );

  const updateLastAIMessage = useCallback(
    (sessionId: string, content: string, interactionId?: string) => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const messages = [...s.messages];
          const lastIdx = messages.length - 1;
          if (lastIdx >= 0 && messages[lastIdx].role === "ai") {
            messages[lastIdx] = { ...messages[lastIdx], content };
          }
          return {
            ...s,
            messages,
            previousInteractionId: interactionId ?? s.previousInteractionId,
          };
        })
      );
    },
    []
  );

  const appendToLastAIMessage = useCallback(
    (sessionId: string, text: string) => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const messages = [...s.messages];
          const lastIdx = messages.length - 1;
          if (lastIdx >= 0 && messages[lastIdx].role === "ai") {
            messages[lastIdx] = {
              ...messages[lastIdx],
              content: messages[lastIdx].content + text,
            };
          }
          return { ...s, messages };
        })
      );
    },
    []
  );

  const setSessionInteractionId = useCallback(
    (sessionId: string, interactionId: string) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, previousInteractionId: interactionId } : s
        )
      );
    },
    []
  );

  const renameSession = useCallback((sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle.trim() || s.title } : s))
    );
  }, []);

  const removeLastAIMessage = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const messages = [...s.messages];
        if (messages.length > 0 && messages[messages.length - 1].role === "ai") {
          messages.pop();
        }
        return { ...s, messages };
      })
    );
  }, []);

  const updateSessionModel = useCallback((sessionId: string, model: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, model } : s))
    );
  }, []);

  return {
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
  };
}
