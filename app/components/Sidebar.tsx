"use client";
import { ChatSession } from "@/app/hooks/useChatSessions";
import { Theme } from "@/app/hooks/useTheme";
import { User } from "@/app/hooks/useAuth";

interface SidebarProps {
  sessions: ChatSession[];
  activeId: string;
  theme: Theme;
  user: User | null;
  isOpen: boolean;
  onNewChat: () => void;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onToggleTheme: () => void;
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  sessions,
  activeId,
  theme,
  user,
  isOpen,
  onNewChat,
  onSwitch,
  onDelete,
  onRename,
  onToggleTheme,
  onClose,
  onOpenProfile,
  onOpenSettings,
  onOpenAuth,
  onLogout,
}: SidebarProps) {
  function handlePromptRename(e: React.MouseEvent, session: ChatSession) {
    e.stopPropagation();
    const newName = window.prompt("Rename chat:", session.title);
    if (newName && newName.trim()) {
      onRename?.(session.id, newName.trim());
    }
  }
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? "open" : ""}`} aria-label="Chat sessions">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo" aria-hidden="true">🤖</div>
            <span className="brand-name">Your Assistant</span>
          </div>
          <button
            className="new-chat-btn"
            onClick={onNewChat}
            title="New Chat"
            aria-label="Start new chat"
            id="sidebar-new-chat-btn"
          >
            +
          </button>
        </div>

        {/* Session List */}
        <nav className="sidebar-sessions" aria-label="Chat history">
          {sessions.length > 0 && (
            <span className="sessions-label">Chats</span>
          )}
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`session-item ${session.id === activeId ? "active" : ""}`}
              onClick={() => { onSwitch(session.id); onClose(); }}
              role="button"
              tabIndex={0}
              aria-selected={session.id === activeId}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSwitch(session.id);
                  onClose();
                }
              }}
            >
              <span className="session-icon" aria-hidden="true">
                {session.messages.length === 0 ? "💬" : "🗨️"}
              </span>
              <span className="session-title" title={session.title}>
                {session.title}
              </span>
              <div style={{ display: "flex", gap: "2px" }} onClick={(e) => e.stopPropagation()}>
                <button
                  className="session-delete"
                  onClick={(e) => handlePromptRename(e, session)}
                  title="Rename chat"
                  aria-label={`Rename chat: ${session.title}`}
                >
                  ✏️
                </button>
                <button
                  className="session-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.id);
                  }}
                  title="Delete chat"
                  aria-label={`Delete chat: ${session.title}`}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile Card */}
        <div style={{ padding: "10px 10px 4px", borderTop: "1px solid var(--border)" }}>
          {user ? (
            <div
              className="sidebar-user-pill"
              onClick={() => { onOpenProfile(); onClose(); }}
              title="Click to view & edit profile"
              role="button"
              tabIndex={0}
            >
              <div className="sidebar-user-avatar">{user.avatar || "🧑‍💻"}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-role">{user.bio ? user.bio.slice(0, 20) : "Personalized AI"}</div>
              </div>
              <div className="sidebar-actions-row" onClick={(e) => e.stopPropagation()}>
                <button
                  className="sidebar-mini-btn"
                  onClick={() => { onOpenSettings(); onClose(); }}
                  title="Settings"
                  aria-label="Open Settings"
                >
                  ⚙️
                </button>
                <button
                  className="sidebar-mini-btn"
                  onClick={onLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  🚪
                </button>
              </div>
            </div>
          ) : (
            <div
              className="sidebar-user-pill"
              style={{ justifyContent: "space-between" }}
              role="button"
              tabIndex={0}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, cursor: "pointer" }}
                onClick={() => { onOpenAuth(); onClose(); }}
              >
                <div className="sidebar-user-avatar">👤</div>
                <div>
                  <div className="sidebar-user-name" style={{ fontSize: "12.5px" }}>Guest Mode</div>
                  <div className="sidebar-user-role">Sign in to sync</div>
                </div>
              </div>
              <div className="sidebar-actions-row" onClick={(e) => e.stopPropagation()}>
                <button
                  className="sidebar-mini-btn"
                  onClick={() => { onOpenSettings(); onClose(); }}
                  title="Settings & API Key"
                  aria-label="Open Settings"
                >
                  ⚙️
                </button>
                <button
                  className="modal-primary-btn"
                  style={{ width: "auto", padding: "4px 8px", fontSize: "11px", margin: 0 }}
                  onClick={() => { onOpenAuth(); onClose(); }}
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Theme Toggle */}
        <div className="sidebar-footer">
          <span className="footer-label">{theme === "dark" ? "🌙 Dark" : "☀️ Light"}</span>
          <label className="theme-toggle" aria-label="Toggle theme">
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={onToggleTheme}
              id="theme-toggle-input"
            />
            <span className="theme-slider" />
          </label>
        </div>
      </aside>
    </>
  );
}
