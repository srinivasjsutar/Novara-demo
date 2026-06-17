import { useState, useEffect, useRef } from "react";

const API_ENDPOINT = "/api/chat";
const ASSISTANT_NAME = "Novara";

// ── SSR-safe sessionStorage helper ───────────────────────────────────────────
// sessionStorage is not available during Vike's server-side pre-render,
// so we guard it behind a typeof check.
function getSessionId() {
  if (typeof sessionStorage === "undefined") return `user-ssr`;
  const key = "chatbot_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `user-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const BotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v2a2 2 0 0 1-2 2h-1v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1H5a2 2 0 0 1-2-2v-2a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2zm-3 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
    </path>
  </svg>
);

const TypingDots = () => (
  <span style={{ display: "inline-flex", gap: "4px", alignItems: "center", height: "18px" }}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: 7, height: 7, borderRadius: "50%", background: "#94a3b8",
          display: "inline-block",
          animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
  </span>
);

// ── Main component ────────────────────────────────────────────────────────────
function ChatbotInner() {
  const [messages, setMessages] = useState([
    { id: 1, role: "bot", text: `Hi! I'm ${ASSISTANT_NAME}. How can I help you today?`, ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  // sessionId is only initialised on client — safe here because ChatbotInner
  // only mounts after the isMounted guard below.
  const sessionId = useRef(getSessionId());

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Prevent body scroll on mobile when chat is open
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), role: "user", text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: sessionId.current }),
      });
      const data = await res.json();
      const reply = data.reply || "No reply from bot.";
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: reply, ts: Date.now() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", text: "Error talking to server. Please try again.", ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const windowStyle = isMobile
    ? {
        position: "fixed", bottom: 90, left: 0, right: 0, top: 0,
        width: "100%", height: "calc(100% - 70px)", borderRadius: "0 0 0 0",
        background: "#ffffff", boxShadow: "none", display: "flex",
        flexDirection: "column", overflow: "hidden", zIndex: 9999,
        fontFamily: "'DM Sans', sans-serif",
      }
    : {
        position: "fixed", bottom: 24, left: 24, width: 380, height: 560,
        borderRadius: 20, background: "#ffffff",
        boxShadow: "0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        zIndex: 9999, fontFamily: "'DM Sans', sans-serif",
      };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700&display=swap');

        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0%   { transform: scale(0.85); opacity: 0; }
          70%  { transform: scale(1.04); }
          100% { transform: scale(1); opacity: 1; }
        }

        .chatbot-msg { animation: slideUp 0.25s ease both; }
        .chatbot-bubble::-webkit-scrollbar { width: 4px; }
        .chatbot-bubble::-webkit-scrollbar-track { background: transparent; }
        .chatbot-bubble::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        .chatbot-send-btn:hover:not(:disabled) { background: #1e40af !important; transform: scale(1.05); }
        .chatbot-send-btn:active:not(:disabled) { transform: scale(0.96); }
        .chatbot-send-btn { transition: background 0.18s ease, transform 0.12s ease; }
        .chatbot-input:focus {
          outline: none;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .chatbot-toggle {
          animation: popIn 0.4s cubic-bezier(.34,1.56,.64,1) both;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .chatbot-toggle:hover { transform: scale(1.08); box-shadow: 0 8px 30px rgba(37,99,235,0.45) !important; }
        .chatbot-window { animation: slideUp 0.3s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      {/* Floating Toggle Button + Hello Bubble */}
      {!open && (
        <div style={{ position: "fixed", bottom: isMobile ? 140 : 96, left: 28, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, zIndex: 9999 }}>
          {/* <div style={{ background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "10px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)", fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", color: "#1e293b", lineHeight: 1.5, maxWidth: 200, animation: "slideUp 0.35s cubic-bezier(.22,1,.36,1) both", animationDelay: "0.1s" }}>
            👋 Hello!<br />
            <span style={{ color: "#64748b" }}>How can I assist you?</span>
          </div> */}

          <button
            className="chatbot-toggle"
            onClick={() => setOpen(true)}
            aria-label="Open chat"
            style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(37,99,235,0.4)", color: "#fff" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window" style={windowStyle}>
          {/* Header */}
          <div style={{ backgroundColor: "rgba(82,160,154,0.9)", padding: isMobile ? "48px 20px 16px" : "18px 20px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, backdropFilter: "blur(8px)", border: "1.5px solid rgba(255,255,255,0.3)" }}>
              <BotIcon />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "0.01em", lineHeight: 1.2 }}>{ASSISTANT_NAME}</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 0 2px rgba(74,222,128,0.3)" }} />
                Online · Ready to help
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, lineHeight: 1, transition: "background 0.15s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >×</button>
          </div>

          {/* Messages */}
          <div className="chatbot-bubble" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10, background: "#f8fafc" }}>
            {messages.map((msg) => (
              <div key={msg.id} className="chatbot-msg" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
                {msg.role === "bot" && (
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, marginBottom: 2 }}>
                    <BotIcon />
                  </div>
                )}
                <div style={{ maxWidth: "72%", padding: "10px 14px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", fontSize: isMobile ? 15 : 14, lineHeight: 1.55, fontWeight: 400, wordBreak: "break-word", background: msg.role === "user" ? "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)" : "#ffffff", color: msg.role === "user" ? "#fff" : "#1e293b", boxShadow: msg.role === "user" ? "0 2px 8px rgba(37,99,235,0.25)" : "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-msg" style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                  <BotIcon />
                </div>
                <div style={{ padding: "10px 16px", borderRadius: "18px 18px 18px 4px", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#e2e8f0", flexShrink: 0 }} />

          {/* Input Area */}
          <div style={{ padding: isMobile ? "12px 14px 28px" : "12px 14px", display: "flex", gap: 10, alignItems: "flex-end", background: "#fff", flexShrink: 0 }}>
            <input
              ref={inputRef}
              className="chatbot-input"
              type="text"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{ flex: 1, padding: isMobile ? "12px 14px" : "10px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: isMobile ? 16 : 14, fontFamily: "'DM Sans', sans-serif", color: "#1e293b", background: "#f8fafc", resize: "none", transition: "border-color 0.18s ease, box-shadow 0.18s ease", lineHeight: 1.4 }}
            />
            <button
              className="chatbot-send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              style={{ width: isMobile ? 46 : 40, height: isMobile ? 46 : 40, borderRadius: 12, background: loading || !input.trim() ? "#e2e8f0" : "linear-gradient(135deg, #2563eb, #3b82f6)", border: "none", cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: loading || !input.trim() ? "#94a3b8" : "#fff", flexShrink: 0 }}
            >
              {loading ? <SpinnerIcon /> : <SendIcon />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── SSR guard ─────────────────────────────────────────────────────────────────
// Vike pre-renders on the server where window/sessionStorage don't exist.
// We render nothing on the server and only mount the real component on the client.
export default function Chatbot() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;
  return <ChatbotInner />;
}
