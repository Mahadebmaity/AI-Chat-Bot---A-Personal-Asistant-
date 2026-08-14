"use client";
import { useState } from "react";
import { User, UserPreferences } from "@/app/hooks/useAuth";
import { Theme } from "@/app/hooks/useTheme";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  theme: Theme;
  onToggleTheme: () => void;
  onUpdatePreferences: (prefUpdates: Partial<UserPreferences>) => void;
  onClearAllChats: () => void;
  onExportAllData: () => void;
}

const VOICE_LANGUAGES = [
  { code: "en-US", name: "English (United States)" },
  { code: "en-GB", name: "English (United Kingdom)" },
  { code: "en-IN", name: "English (India)" },
  { code: "es-ES", name: "Spanish (Spain)" },
  { code: "es-MX", name: "Spanish (Mexico)" },
  { code: "fr-FR", name: "French (France)" },
  { code: "de-DE", name: "German (Germany)" },
  { code: "hi-IN", name: "Hindi (India) / हिन्दी" },
  { code: "bn-IN", name: "Bengali (India) / বাংলা" },
  { code: "ja-JP", name: "Japanese / 日本語" },
  { code: "zh-CN", name: "Chinese (Simplified) / 简体中文" },
  { code: "pt-BR", name: "Portuguese (Brazil)" },
];

const MODELS = [
  { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash ⚡ (Fastest & Smartest)" },
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash 🚀 (Balanced)" },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash 🌟" },
  { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite ⚡ (Ultra Fast)" },
];

export default function SettingsModal({
  isOpen,
  onClose,
  user,
  theme,
  onToggleTheme,
  onUpdatePreferences,
  onClearAllChats,
  onExportAllData,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "ai" | "data">("general");
  const [defaultModel, setDefaultModel] = useState(
    user?.preferences?.defaultModel || "gemini-3.7-flash"
  );
  const [temperature, setTemperature] = useState(
    user?.preferences?.temperature ?? 0.7
  );
  const [voiceLanguage, setVoiceLanguage] = useState(
    user?.preferences?.voiceLanguage || "en-US"
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  function handleSaveAI() {
    onUpdatePreferences({
      defaultModel,
      temperature,
      voiceLanguage,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="modal-header">
          <h2 id="settings-modal-title" className="modal-title">Settings</h2>
          <p className="modal-subtitle">Customize application preferences, AI behavior, and data.</p>
        </div>

        {/* Setting Tabs */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
            type="button"
          >
            ⚙️ General
          </button>
          <button
            className={`modal-tab ${activeTab === "ai" ? "active" : ""}`}
            onClick={() => setActiveTab("ai")}
            type="button"
          >
            🤖 AI & Voice
          </button>
          <button
            className={`modal-tab ${activeTab === "data" ? "active" : ""}`}
            onClick={() => setActiveTab("data")}
            type="button"
          >
            🔒 Data & Privacy
          </button>
        </div>

        {isSaved && (
          <div className="modal-success-banner" role="status">
            ✓ Settings saved successfully!
          </div>
        )}

        {/* Tab 1: General */}
        {activeTab === "general" && (
          <div className="settings-section">
            <div className="settings-row">
              <div>
                <h4 className="setting-name">Theme Appearance</h4>
                <p className="setting-desc">Switch between Dark and Light mode</p>
              </div>
              <button className="settings-btn-toggle" onClick={onToggleTheme}>
                {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </button>
            </div>

            <div className="settings-row">
              <div>
                <h4 className="setting-name">Assistant Personality</h4>
                <p className="setting-desc">Powered by Google Gemini AI with high-speed streaming</p>
              </div>
              <span className="profile-badge">Online 🟢</span>
            </div>
          </div>
        )}

        {/* Tab 2: AI & Voice */}
        {activeTab === "ai" && (
          <div className="settings-section">
            {/* Default Model */}
            <div className="form-group">
              <label className="form-label" htmlFor="settings-default-model">Default AI Model</label>
              <select
                id="settings-default-model"
                className="form-select"
                value={defaultModel}
                onChange={(e) => {
                  setDefaultModel(e.target.value);
                  onUpdatePreferences({ defaultModel: e.target.value });
                }}
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Creativity (Temperature) Slider */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label">AI Creativity / Temperature</label>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent)" }}>
                  {temperature <= 0.3 ? "Precise (0.3)" : temperature >= 0.9 ? "Creative (1.0)" : `Balanced (${temperature})`}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setTemperature(val);
                  onUpdatePreferences({ temperature: val });
                }}
                className="range-slider"
                aria-label="AI Creativity slider"
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                <span>🎯 Precise (Coding/Math)</span>
                <span>⚖️ Balanced</span>
                <span>🎨 Creative (Writing/Ideas)</span>
              </div>
            </div>

            {/* Voice Input Language */}
            <div className="form-group">
              <label className="form-label" htmlFor="settings-voice-lang">Voice Input Language 🎤</label>
              <select
                id="settings-voice-lang"
                className="form-select"
                value={voiceLanguage}
                onChange={(e) => {
                  setVoiceLanguage(e.target.value);
                  onUpdatePreferences({ voiceLanguage: e.target.value });
                }}
              >
                {VOICE_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="modal-primary-btn"
              onClick={handleSaveAI}
            >
              Save AI Preferences
            </button>
          </div>
        )}

        {/* Tab 3: Data & Privacy */}
        {activeTab === "data" && (
          <div className="settings-section">
            <div className="settings-row">
              <div>
                <h4 className="setting-name">Export Backup Data</h4>
                <p className="setting-desc">Download all your chat history as a JSON backup file</p>
              </div>
              <button className="settings-secondary-btn" onClick={onExportAllData}>
                📥 Export JSON
              </button>
            </div>

            <div className="settings-row danger-zone">
              <div>
                <h4 className="setting-name" style={{ color: "#ef4444" }}>Clear All Conversations</h4>
                <p className="setting-desc">Permanently delete all chats from your local browser storage</p>
              </div>
              {!showClearConfirm ? (
                <button
                  className="danger-btn"
                  onClick={() => setShowClearConfirm(true)}
                >
                  🗑️ Clear All
                </button>
              ) : (
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    className="danger-btn-confirm"
                    onClick={() => {
                      onClearAllChats();
                      setShowClearConfirm(false);
                      onClose();
                    }}
                  >
                    Confirm Delete
                  </button>
                  <button
                    className="modal-secondary-btn"
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
