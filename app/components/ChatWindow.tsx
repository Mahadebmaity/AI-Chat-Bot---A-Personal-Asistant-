"use client";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "@/app/hooks/useChatSessions";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSuggestion: (text: string) => void;
  onRegenerate?: () => void;
}

const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a Python function to sort a list",
  "What are 5 tips for better productivity?",
  "Summarize the history of the internet",
];

export default function ChatWindow({
  messages,
  isLoading,
  onSuggestion,
  onRegenerate,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleCopy(id: string, content: string) {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  // Welcome screen
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="chat-window">
        <div className="welcome-screen">
          <div className="welcome-logo" aria-hidden="true">🤖</div>
          <h1 className="welcome-title">Hello! I&apos;m My Assistant</h1>
          <p className="welcome-subtitle">
            Powered by Google Gemini. Ask me anything — I&apos;m here to help with writing,
            coding, research, and more.
          </p>
          <div className="welcome-suggestions" role="list" aria-label="Suggested prompts">
            {SUGGESTIONS.map((text) => (
              <button
                key={text}
                className="suggestion-chip"
                onClick={() => onSuggestion(text)}
                role="listitem"
                aria-label={`Try: ${text}`}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window" role="log" aria-live="polite" aria-label="Chat messages">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`message-row ${msg.role === "user" ? "user" : "ai"}`}
          aria-label={`${msg.role === "user" ? "You" : "Assistant"}: ${msg.content.slice(0, 100)}`}
        >
          <div className="message-avatar" aria-hidden="true">
            {msg.role === "user" ? "👤" : "🤖"}
          </div>
          <div>
            <div className="message-bubble">
              {msg.role === "user" ? (
                <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
            {/* Action buttons for AI messages */}
            {msg.role === "ai" && (
              <div className="message-actions" aria-label="Message actions">
                <button
                  className={`action-btn ${copiedId === msg.id ? "copied" : ""}`}
                  onClick={() => handleCopy(msg.id, msg.content)}
                  aria-label="Copy response"
                  title="Copy to clipboard"
                >
                  {copiedId === msg.id ? "✓ Copied!" : "📋 Copy"}
                </button>
                {onRegenerate && messages[messages.length - 1]?.id === msg.id && !isLoading && (
                  <button
                    className="action-btn"
                    onClick={onRegenerate}
                    aria-label="Regenerate response"
                    title="Regenerate response"
                  >
                    🔄 Retry
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {isLoading && (
        <div className="typing-indicator" aria-label="Assistant is typing">
          <div className="message-avatar" aria-hidden="true">🤖</div>
          <div className="typing-bubble" aria-hidden="true">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      )}

      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
