"use client";
import { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onSignup: (
    name: string,
    email: string,
    pass: string,
    avatar: string,
    bio: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const AVATARS = ["🧑‍💻", "🚀", "🎨", "🌟", "🤖", "🦁", "⚡", "💎", "🔮", "🦉", "👑", "🦊"];

export default function AuthModal({ isOpen, onClose, onLogin, onSignup }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (tab === "login") {
        const res = await onLogin(email, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || "Login failed");
        }
      } else {
        const res = await onSignup(name, email, password, avatar, bio);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || "Signup failed");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDemoLogin() {
    setName("Guest Explorer");
    setEmail("guest@myassistant.ai");
    setPassword("guest123");
    onSignup("Guest Explorer", "guest@myassistant.ai", "guest123", "🚀", "Exploring AI assistant")
      .then((res) => {
        if (res.success) {
          onClose();
        } else {
          onLogin("guest@myassistant.ai", "guest123").then((lRes) => {
            if (lRes.success) onClose();
          });
        }
      });
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="modal-header">
          <div className="auth-brand-badge">🤖</div>
          <h2 id="auth-modal-title" className="modal-title">
            {tab === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="modal-subtitle">
            {tab === "login"
              ? "Sign in to access your personalized settings and chat history."
              : "Sign up to customize your assistant and personalize responses."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => { setTab("login"); setError(null); }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`modal-tab ${tab === "signup" ? "active" : ""}`}
            onClick={() => { setTab("signup"); setError(null); }}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="modal-error-banner" role="alert">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {tab === "signup" && (
            <>
              {/* Avatar Selector */}
              <div className="form-group">
                <label className="form-label">Choose Avatar</label>
                <div className="avatar-picker-grid">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      className={`avatar-option ${avatar === av ? "selected" : ""}`}
                      onClick={() => setAvatar(av)}
                      aria-label={`Select avatar ${av}`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="signup-name">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Bio / Persona */}
              <div className="form-group">
                <label className="form-label" htmlFor="signup-bio">About You (Optional)</label>
                <input
                  id="signup-bio"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Student, Developer, Writer..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="modal-primary-btn"
            disabled={isSubmitting}
            id="auth-submit-btn"
          >
            {isSubmitting
              ? "Please wait..."
              : tab === "login"
              ? "Sign In"
              : "Create Account"}
          </button>

          {/* Demo Login Shortcut */}
          <button
            type="button"
            className="modal-secondary-btn"
            onClick={handleDemoLogin}
          >
            ⚡ Quick Demo Login (1-Click)
          </button>
        </form>
      </div>
    </div>
  );
}
