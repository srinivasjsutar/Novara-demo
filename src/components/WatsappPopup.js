import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";

const WHATSAPP_NUMBER = "8660200662";

export default function WhatsAppPopup({ isOpen, onClose }) {
  const [input, setInput] = useState("");
 const [messages, setMessages] = useState([
  { from: "them", text: "👋 Hello! Welcome to Novara Nature Estates.", time: "Now" },
  { from: "them", text: "How can we help you today? Ask us about our farmland options, locations, and availability! 🌾", time: "Now" },
]);
  const [typing, setTyping] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { from: "me", text, time: "Now" }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
    }, 1400);
  };

  const handleKey = (e) => { if (e.key === "Enter") sendMessage(); };

  return (
    <div
      className={`fixed bottom-20 right-4 z-[9999] w-80 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isOpen ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
               : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      }`}
      style={{ background: "#fff" }}
    >
      {/* Header */}
      <div className="flex items-center gap-12  ps-4 py-3" style={{ background: "#1A614F" }}>
      
  <div className="w-13 h-13 rounded-full overflow-hidden">
    <img
      src="/images/logo.svg"   // ✅ removed /public
      alt="Ecovara"
      className="w-full h-full object-contain"
    />
  </div>

        <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Body */}
      <div ref={chatRef} className="p-4 flex flex-col gap-2.5 overflow-y-auto"
        style={{ background: "#ECE5DD", minHeight: "140px", maxHeight: "220px" }}>
        {messages.map((msg, i) =>
          msg.from === "them" ? (
            <div key={i} className="rounded-b-xl rounded-tr-xl px-3.5 py-2.5 text-sm text-gray-800 max-w-[85%] shadow-sm"
              style={{ background: "#fff", lineHeight: 1.5 }}>
              {msg.text}
              <div className="text-right text-xs text-gray-400 mt-1">{msg.time}</div>
            </div>
          ) : (
            <div key={i} className="rounded-t-xl rounded-bl-xl px-3.5 py-2.5 text-sm text-gray-800 max-w-[85%] ml-auto shadow-sm"
              style={{ background: "#DCF8C6", lineHeight: 1.5 }}>
              {msg.text}
              <div className="text-right text-xs text-gray-400 mt-1">{msg.time} ✓✓</div>
            </div>
          )
        )}
        {typing && (
          <div className="rounded-b-xl rounded-tr-xl px-4 py-3 flex gap-1 items-center shadow-sm w-16" style={{ background: "#fff" }}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: "#aaa", animationDelay: `${i * 0.18}s`, animationDuration: "1s" }} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: "#f0f0f0", borderTop: "1px solid #e0e0e0" }}>
        <input
          className="flex-1 rounded-full px-4 py-2 text-sm outline-none font-urbanist text-gray-700"
          style={{ background: "#fff" }}
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button onClick={sendMessage}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#25D366" }}>
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
