"use client";
import { useState } from "react";
import { User } from "@/app/hooks/useAuth";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateProfile: (updates: Partial<Omit<User, "id" | "joinedDate">>) => void;
  onOpenAuth: () => void;
  totalChats: number;
  totalMessages: number;
}

const AVATARS = ["🧑‍💻", "🚀", "🎨", "🌟", "🤖", "🦁", "⚡", "💎", "🔮", "🦉", "👑", "🦊"];

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
  onOpenAuth,
  totalChats,
  totalMessages,
}: ProfileModalProps) {
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "🧑‍💻");
  const [bio, setBio] = useState(user?.bio || "");
  const [customInstructions, setCustomInstructions] = useState(
    user?.preferences?.customInstructions || ""
  );
  const [responseStyle, setResponseStyle] = useState(
    user?.preferences?.responseStyle || "balanced"
  );
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
          <div className="modal-header">
            <div className="auth-brand-badge">👤</div>
            <h2 className="modal-title">Guest Profile</h2>
            <p className="modal-subtitle">
              You are currently using My Assistant as a guest. Sign in to save your personal preferences and customize your AI experience.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
            <button
              className="modal-primary-btn"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
            >
              Sign In or Create Account
            </button>
            <button className="modal-secondary-btn" onClick={onClose}>
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    );
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || user!.name,
      avatar,
      bio: bio.trim(),
      preferences: {
        ...user!.preferences,
        customInstructions: customInstructions.trim(),
        responseStyle,
      },
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  }

  const joinDateStr = new Date(user.joinedDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Profile Card Header */}
        <div className="profile-header-card">
          <div className="profile-large-avatar">{avatar}</div>
          <div className="profile-header-details">
            <h2 id="profile-modal-title" className="profile-user-name">{user.name}</h2>
            <p className="profile-user-email">{user.email}</p>
            <span className="profile-badge">Member since {joinDateStr}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="profile-stats-grid">
          <div className="stat-card">
            <span className="stat-number">{totalChats}</span>
            <span className="stat-label">Total Chats</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{totalMessages}</span>
            <span className="stat-label">Messages Sent</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">Active</span>
            <span className="stat-label">Plan (Free)</span>
          </div>
        </div>

        {isSaved && (
          <div className="modal-success-banner" role="status">
            ✓ Profile & AI preferences saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="profile-form">
          {/* Avatar Selector */}
          <div className="form-group">
            <label className="form-label">Change Avatar</label>
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

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">Display Name</label>
            <input
              id="profile-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          {/* Bio */}
          <div className="form-group">
            <label className="form-label" htmlFor="profile-bio">About You / Profession</label>
            <input
              id="profile-bio"
              type="text"
              className="form-input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Software Developer, Designer, Biology Student..."
            />
          </div>

          {/* AI Custom Instructions */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label" htmlFor="profile-instructions">
                AI Personalization / Custom Instructions 🧠
              </label>
            </div>
            <p className="form-help-text">
              Tell Gemini how you want it to respond or context it should keep in mind for all your chats.
            </p>
            <textarea
              id="profile-instructions"
              className="form-textarea"
              rows={3}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. 'I am learning React. Give concise explanations with code examples. Avoid overly formal language.'"
            />
          </div>

          {/* Response Style */}
          <div className="form-group">
            <label className="form-label">Preferred Response Style</label>
            <select
              className="form-select"
              value={responseStyle}
              onChange={(e) => setResponseStyle(e.target.value)}
              id="response-style-select"
            >
              <option value="balanced">Balanced & Friendly (Default)</option>
              <option value="concise">Concise & Direct (Fewer words, straight to the point)</option>
              <option value="detailed">In-depth & Comprehensive (Detailed explanations)</option>
              <option value="academic">Academic & Analytical (Rigorous structure)</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-primary-btn" id="save-profile-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
