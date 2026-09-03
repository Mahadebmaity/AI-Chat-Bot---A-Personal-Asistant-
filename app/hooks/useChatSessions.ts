"use client";
import { useState, useEffect, useCallback, useRef } from "react";

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

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function createNewSession(model = "gemini-3.7-flash"): ChatSession {
  return {
    id: generateId(),
    title: "New Chat",
    messages: [],
    previousInteractionId: null,
    createdAt: Date.now(),
    model,
  };
}

export function useChatSessions(
  userId?: string | null,
  isAuthLoaded: boolean = true,
  defaultModel: string = "gemini-3.7-flash"
) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const loadedKeyRef = useRef<string | null>(null);

  // Isolate sessions per user ID; guests get isolated guest key
  const storageKey = userId
    ? `my-assistant-sessions_${userId}`
    : "my-assistant-sessions_guest";
  const activeKey = userId
    ? `my-assistant-active_${userId}`
    : "my-assistant-active_guest";

  // Load sessions when user changes or auth state finishes loading
  useEffect(() => {
    if (!isAuthLoaded) return;

    try {
      let stored = localStorage.getItem(storageKey);
      let storedActive = localStorage.getItem(activeKey);

      // Backwards-compatibility only for guest mode with pre-existing legacy data
      if (!stored && !userId) {
        const legacy = localStorage.getItem("my-assistant-sessions");
        const legacyActive = localStorage.getItem("my-assistant-active");
        if (legacy) {
          stored = legacy;
          storedActive = legacyActive;
        }
      }

      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          const active = storedActive && parsed.find((s) => s.id === storedActive);
          setActiveId(active ? active.id : parsed[0].id);
          loadedKeyRef.current = storageKey;
          return;
        }
      }
    } catch (e) {
      console.error("Error loading chat sessions:", e);
    }

    // If brand new user or no sessions, create a single clean new chat session
    const fresh = createNewSession(defaultModel);
    setSessions([fresh]);
    setActiveId(fresh.id);
    loadedKeyRef.current = storageKey;
  }, [userId, isAuthLoaded, storageKey, activeKey, defaultModel]);

  // Persist on change, strictly ensuring we only save once current user's state is loaded
  useEffect(() => {
    if (!isAuthLoaded) return;
    if (loadedKeyRef.current !== storageKey) return; // Prevent overwriting newly switched user's storage

    if (sessions.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(sessions));
      if (activeId) {
        localStorage.setItem(activeKey, activeId);
      }
    }
  }, [sessions, activeId, storageKey, activeKey, isAuthLoaded]);

  const activeSession = sessions.find((s) => s.id === activeId) ?? sessions[0];

  const createSession = useCallback(
    (model?: string) => {
      const newSession = createNewSession(model || defaultModel);
      setSessions((prev) => [newSession, ...prev]);
      setActiveId(newSession.id);
      return newSession;
    },
    [defaultModel]
  );

  const switchSession = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (filtered.length === 0) {
          const fresh = createNewSession(defaultModel);
          setActiveId(fresh.id);
          return [fresh];
        }
        if (id === activeId) {
          setActiveId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeId, defaultModel]
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
