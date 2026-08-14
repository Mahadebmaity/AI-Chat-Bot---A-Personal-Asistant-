"use client";
import { useRef, useState, useEffect, KeyboardEvent } from "react";

const MODELS = [
  { id: "gemini-3.7-flash", label: "Gemini 3.7 Flash ⚡" },
  { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash 🚀" },
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash 🌟" },
  { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash Lite ⚡" },
];

interface MessageInputProps {
  onSend: (message: string, model: string) => void;
  onStop?: () => void;
  isLoading: boolean;
  initialValue?: string;
  onModelChange?: (model: string) => void;
  currentModel?: string;
  voiceLanguage?: string;
}

export default function MessageInput({
  onSend,
  onStop,
  isLoading,
  initialValue = "",
  onModelChange,
  currentModel = "gemini-3.7-flash",
  voiceLanguage = "en-US",
}: MessageInputProps) {
  const [message, setMessage] = useState(initialValue);
  const [model, setModel] = useState(currentModel);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");

  // Check SpeechRecognition support on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setVoiceSupported(false);
      }
    }
  }, []);

  // Sync initialValue (from suggestion chips)
  useEffect(() => {
    if (initialValue) {
      setMessage(initialValue);
      textareaRef.current?.focus();
    }
  }, [initialValue]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
    }
  }, [message]);

  function handleSend() {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    if (isRecording) {
      stopRecording();
    }

    onSend(trimmed, model);
    setMessage("");
    finalTranscriptRef.current = "";
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleModelChange(newModel: string) {
    setModel(newModel);
    onModelChange?.(newModel);
  }

  function stopRecording() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore if already stopped
      }
    }
    setIsRecording(false);
  }

  async function handleVoiceInput() {
    setVoiceError(null);

    // If currently recording, stop it
    if (isRecording) {
      stopRecording();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    // Request microphone permission explicitly first if supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release tracks right away, recognition engine will handle its own mic stream
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.name : "";
        if (msg === "NotAllowedError" || msg === "PermissionDeniedError") {
          setVoiceError("Microphone access was denied. Please allow microphone permissions in your browser address bar.");
        } else if (msg === "NotFoundError" || msg === "DevicesNotFoundError") {
          setVoiceError("No microphone found. Please connect a microphone and try again.");
        } else {
          setVoiceError("Could not access microphone. Please check your browser audio settings.");
        }
        return;
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = voiceLanguage || navigator.language || "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Keep whatever text was already typed
      finalTranscriptRef.current = message ? message.trim() + " " : "";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let accumulatedFinal = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            accumulatedFinal += transcript + " ";
            finalTranscriptRef.current = accumulatedFinal;
          } else {
            interimTranscript += transcript;
          }
        }

        const combined = accumulatedFinal + interimTranscript;
        setMessage(combined);
      };

      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceError(null);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setIsRecording(false);
        if (event.error === "not-allowed") {
          setVoiceError("Microphone permission denied. Click the lock icon in the address bar to allow microphone access.");
        } else if (event.error === "no-speech") {
          setVoiceError("No speech was detected. Please try speaking closer to the microphone.");
        } else if (event.error === "network") {
          setVoiceError("Voice recognition network error. Please check your internet connection.");
        } else if (event.error !== "aborted") {
          setVoiceError(`Voice recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      setIsRecording(false);
      const msg = err instanceof Error ? err.message : "Error starting voice recognition";
      setVoiceError(msg);
    }
  }

  const canSend = message.trim().length > 0 && !isLoading;

  return (
    <div className="input-bar">
      {/* Model selector */}
      <div className="model-selector-row">
        <span className="model-label">Model:</span>
        <select
          className="model-select"
          value={model}
          onChange={(e) => handleModelChange(e.target.value)}
          aria-label="Select AI model"
          id="model-selector"
          disabled={isLoading}
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Voice feedback banner */}
      {isRecording && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "var(--radius-sm)",
            padding: "6px 12px",
            marginBottom: "8px",
            fontSize: "12px",
            color: "#ef4444",
            fontWeight: 500,
          }}
        >
          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", animation: "pulse 1s infinite" }} />
          🎙️ Listening... Speak now. Click the mic button or press Enter to finish.
        </div>
      )}

      {voiceError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "var(--radius-sm)",
            padding: "6px 12px",
            marginBottom: "8px",
            fontSize: "12px",
            color: "var(--text-primary)",
          }}
        >
          <span>⚠️ {voiceError}</span>
          <button
            onClick={() => setVoiceError(null)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "14px",
              color: "var(--text-muted)",
            }}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input wrapper */}
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          className="message-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? "Listening to your voice..." : "Message My Assistant…"}
          rows={1}
          disabled={isLoading}
          aria-label="Type your message"
          id="message-input"
          autoComplete="off"
        />

        <div className="input-actions">
          {/* Voice Input Button */}
          <button
            className={`voice-btn ${isRecording ? "recording" : ""}`}
            onClick={handleVoiceInput}
            title={
              !voiceSupported
                ? "Voice input not supported in this browser"
                : isRecording
                ? "Stop recording"
                : "Voice input (Speak your prompt)"
            }
            aria-label={isRecording ? "Stop voice recording" : "Start voice input"}
            type="button"
            id="voice-input-btn"
          >
            {isRecording ? "⏹" : "🎤"}
          </button>

          {/* Send / Stop Button */}
          {isLoading ? (
            <button
              className="send-btn"
              style={{ background: "#ef4444" }}
              onClick={onStop}
              title="Stop generating"
              aria-label="Stop generating"
              type="button"
              id="stop-btn"
            >
              ⏹
            </button>
          ) : (
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!canSend}
              title="Send message (Enter)"
              aria-label="Send message"
              type="button"
              id="send-btn"
            >
              ↑
            </button>
          )}
        </div>
      </div>

      <p className="input-hint">
        Press <strong>Enter</strong> to send · <strong>Shift+Enter</strong> for newline
      </p>
    </div>
  );
}
