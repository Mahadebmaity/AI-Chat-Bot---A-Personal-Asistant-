"use client";
import { useState } from "react";
import { Message } from "@/app/hooks/useChatSessions";

interface ExportButtonProps {
  messages: Message[];
  sessionTitle: string;
}

export default function ExportButton({ messages, sessionTitle }: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  function formatAsText(): string {
    const header = `Your Assistant — ${sessionTitle}\nExported: ${new Date().toLocaleString()}\n${"=".repeat(50)}\n\n`;
    return (
      header +
      messages
        .map((m) => {
          const who = m.role === "user" ? "You" : "Assistant";
          const time = new Date(m.timestamp).toLocaleTimeString();
          return `[${who}] ${time}\n${m.content}\n`;
        })
        .join("\n" + "-".repeat(30) + "\n\n")
    );
  }

  function formatAsMarkdown(): string {
    const date = new Date().toLocaleString();
    let md = `# Your Assistant — ${sessionTitle}\n\n> Exported on ${date}\n\n---\n\n`;
    messages.forEach((m) => {
      const who = m.role === "user" ? "**You**" : "**Assistant** 🤖";
      const time = new Date(m.timestamp).toLocaleTimeString();
      md += `### ${who} _(${time})_\n\n${m.content}\n\n---\n\n`;
    });
    return md;
  }

  function download(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  }

  const safeName = sessionTitle.replace(/[^a-z0-9]/gi, "_").slice(0, 30);

  return (
    <div style={{ position: "relative" }}>
      <button
        className="icon-btn"
        onClick={() => setShowMenu((v) => !v)}
        title="Export conversation"
        aria-label="Export conversation"
        aria-expanded={showMenu}
        id="export-btn"
        disabled={messages.length === 0}
      >
        📤
      </button>

      {showMenu && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            minWidth: "180px",
            zIndex: 200,
            overflow: "hidden",
          }}
          role="menu"
          aria-label="Export options"
        >
          <button
            onClick={() => download(formatAsText(), `${safeName}.txt`, "text/plain")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "12px 16px",
              border: "none",
              background: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "inherit",
              textAlign: "left",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            role="menuitem"
            id="export-txt-btn"
          >
            📄 Export as .txt
          </button>
          <button
            onClick={() => download(formatAsMarkdown(), `${safeName}.md`, "text/markdown")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "12px 16px",
              border: "none",
              background: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "inherit",
              textAlign: "left",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            role="menuitem"
            id="export-md-btn"
          >
            📝 Export as .md
          </button>
        </div>
      )}

      {/* Click outside to close */}
      {showMenu && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 199 }}
          onClick={() => setShowMenu(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
