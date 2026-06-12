import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Trash2, Plus, Image as ImageIcon, Link as LinkIcon, Type, List,
  Settings, Upload, Send, Facebook, Youtube, MessageCircle, Instagram,
  ChevronLeft, Eye, EyeOff, ChevronDown, ChevronUp, Leaf, AlertCircle,
  CheckCircle, Loader, X, LogIn, LogOut, Edit3, Search, ArrowLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BLOGS } from "../data/blogs";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://novara-backend-one.vercel.app";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const slugify = (str = "") =>
  str.toLowerCase().trim()
    .replace(/[""''"`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// ─── Cloudinary config ────────────────────────────────────────────────────────
const CL_CLOUD  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CL_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const compressAndUpload = (file, { maxW = 1400, quality = 0.82 } = {}) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxW) { height = Math.round((height * maxW) / width); width = maxW; }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob(async (blob) => {
        if (!blob) return reject(new Error("Canvas compression failed"));
        const form = new FormData();
        form.append("file", blob, file.name.replace(/\.[^.]+$/, ".webp"));
        form.append("upload_preset", CL_PRESET);
        try {
          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CL_CLOUD}/image/upload`,
            { method: "POST", body: form }
          );
          const data = await res.json();
          if (!res.ok) return reject(new Error(`Cloudinary: ${data?.error?.message || `HTTP ${res.status}`}`));
          resolve(data.secure_url);
        } catch (e) { reject(e); }
      }, "image/webp", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image load failed")); };
    img.src = objectUrl;
  });

// ─── Section ↔ Element converters ────────────────────────────────────────────
const sectionToElement = (s) => {
  const base = { id: Date.now() + Math.random() };
  if (["h2","h3","h4","h5","h6"].includes(s.type))
    return { ...base, type: s.type, text: s.text, fontWeight: s.fontWeight || "font-bold" };
  if (["h2_with_link","h3_with_link","h4_with_link","h5_with_link","h6_with_link"].includes(s.type))
    return { ...base, type: s.type, textBefore: s.textBefore || "", linkText: s.linkText || "", href: s.href || "", textAfter: s.textAfter || "", fontWeight: s.fontWeight || "font-bold" };
  if (s.type === "p")          return { ...base, type: "p",          text: s.text, fontWeight: s.fontWeight || "font-normal" };
  if (s.type === "quote")      return { ...base, type: "quote",      text: s.text };
  if (s.type === "ul")         return { ...base, type: "ul",         text: s.text };
  if (s.type === "ol")         return { ...base, type: "ol",         text: s.text };
  if (s.type === "table")      return { ...base, type: "table",      headers: s.headers || [], rows: s.rows || [], themed: s.themed || false };
  if (s.type === "image")      return { ...base, type: "image",      src: s.src,  caption: s.caption || "" };
  if (s.type === "p_with_link")
    return { ...base, type: "p_with_link", textBefore: s.textBefore || "", linkText: s.linkText || "", href: s.href || "", textAfter: s.textAfter || "", fontWeight: s.fontWeight || "font-normal" };
  if (s.type === "p_with_bold")
    return { ...base, type: "p_with_bold", parts: s.parts || [], fontWeight: s.fontWeight || "font-normal" };
  if (s.type === "p_with_link_bold")
    return { ...base, type: "p_with_link_bold", partsBefore: s.partsBefore || [], linkText: s.linkText || "", href: s.href || "", partsAfter: s.partsAfter || [], fontWeight: s.fontWeight || "font-normal" };
  return { ...base, type: "p", text: s.text || "" };
};

const toSections = (elements) =>
  elements.map((el) => {
    if (["h2","h3","h4","h5","h6"].includes(el.type))
      return { type: el.type, text: el.text, fontWeight: el.fontWeight };
    if (["h2_with_link","h3_with_link","h4_with_link","h5_with_link","h6_with_link"].includes(el.type))
      return { type: el.type, textBefore: el.textBefore, linkText: el.linkText, href: el.href, textAfter: el.textAfter, fontWeight: el.fontWeight };
    if (el.type === "p")          return { type: "p",    text: el.text, fontWeight: el.fontWeight };
    if (el.type === "quote")      return { type: "quote",text: el.text };
    if (el.type === "ul")         return { type: "ul",   text: el.text };
    if (el.type === "ol")         return { type: "ol",   text: el.text };
    if (el.type === "table")      return { type: "table", headers: el.headers, rows: el.rows, themed: el.themed };
    if (el.type === "image")      return { type: "image",src: el.src, caption: el.caption };
    if (el.type === "p_with_link")
      return { type: "p_with_link", textBefore: el.textBefore, linkText: el.linkText, href: el.href, textAfter: el.textAfter, fontWeight: el.fontWeight };
    if (el.type === "p_with_bold")
      return { type: "p_with_bold", parts: el.parts, fontWeight: el.fontWeight };
    if (el.type === "p_with_link_bold")
      return { type: "p_with_link_bold", partsBefore: el.partsBefore, linkText: el.linkText, href: el.href, partsAfter: el.partsAfter, fontWeight: el.fontWeight };
    return { type: "p", text: el.text || "" };
  });

const createElement = (type) => {
  const base = { id: Date.now() + Math.random(), type };
  switch (type) {
    case "p":          return { ...base, text: "Write your paragraph here…", fontWeight: "font-normal" };
    case "h2":         return { ...base, text: "Section Heading (H2)", fontWeight: "font-bold" };
    case "h3":         return { ...base, text: "Sub-section Heading (H3)", fontWeight: "font-bold" };
    case "h4":         return { ...base, text: "Minor Heading (H4)", fontWeight: "font-bold" };
    case "h5":         return { ...base, text: "Small Heading (H5)", fontWeight: "font-bold" };
    case "h6":         return { ...base, text: "Tiny Heading (H6)", fontWeight: "font-bold" };
    case "h2_with_link": return { ...base, textBefore: "Learn more about", linkText: "managed farmland", href: "https://novaranatureestates.com", textAfter: "near Bangalore.", fontWeight: "font-bold" };
    case "h3_with_link": return { ...base, textBefore: "Explore our", linkText: "project details", href: "https://novaranatureestates.com/projects", textAfter: "here.", fontWeight: "font-bold" };
    case "h4_with_link": return { ...base, textBefore: "See the", linkText: "full guide", href: "https://novaranatureestates.com", textAfter: "for more.", fontWeight: "font-bold" };
    case "h5_with_link": return { ...base, textBefore: "Read about", linkText: "our approach", href: "https://novaranatureestates.com", textAfter: "today.", fontWeight: "font-bold" };
    case "h6_with_link": return { ...base, textBefore: "More at", linkText: "our site", href: "https://novaranatureestates.com", textAfter: "", fontWeight: "font-bold" };
    case "quote":      return { ...base, text: "An insightful quote goes here…" };
    case "ul":         return { ...base, text: ["First point", "Second point", "Third point"] };
    case "ol":         return { ...base, text: ["Step one", "Step two", "Step three"] };
    case "table":      return { ...base, headers: ["Firstname", "Lastname", "Age"], rows: [["Lucas", "Rossi", "24"], ["Sophie", "Dubois", "32"], ["Sam", "Watson", "41"]], themed: false };
    case "image":      return { ...base, src: "", caption: "" };
    case "p_with_link":
      return { ...base, textBefore: "Learn more about", linkText: "managed farmland", href: "https://novaranatureestates.com/projects", textAfter: "near Bangalore.", fontWeight: "font-normal" };
    case "p_with_bold":
      return { ...base, parts: [{ bold: false, text: "This is regular text, and " }, { bold: true, text: "this part is bold" }, { bold: false, text: ", then regular again." }], fontWeight: "font-normal" };
    case "p_with_link_bold":
      return { ...base, partsBefore: [{ bold: false, text: "Discover " }, { bold: true, text: "premium farmland" }], linkText: "invest now", href: "https://novaranatureestates.com", partsAfter: [{ bold: false, text: " for the best returns." }], fontWeight: "font-normal" };
    default: return base;
  }
};

// ─── Heading size map ─────────────────────────────────────────────────────────
const HEADING_SIZE = {
  h2: "text-[20px] sm:text-[24px]",
  h3: "text-[16px] sm:text-[18px]",
  h4: "text-[15px] sm:text-[16px]",
  h5: "text-[13px] sm:text-[14px]",
  h6: "text-[12px] sm:text-[13px]",
};

// ─── TOC heading types ────────────────────────────────────────────────────────
const TOC_TYPES = new Set([
  "h2","h3","h4","h5","h6",
  "h2_with_link","h3_with_link","h4_with_link","h5_with_link","h6_with_link",
]);

const getHeadingTag = (type) => type.replace("_with_link", "");

// ─── Tiny UI ──────────────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <label className="block mb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
    {children}
  </label>
);
const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800
      placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A614F]/20
      focus:border-[#1A614F] transition-all ${className}`}
  />
);
const Textarea = ({ className = "", ...props }) => (
  <textarea
    {...props}
    className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800
      placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A614F]/20
      focus:border-[#1A614F] transition-all resize-none ${className}`}
  />
);
const SectionDivider = ({ children }) => (
  <div className="flex items-center gap-2 py-1">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] whitespace-nowrap">{children}</span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

// ─── Element type catalogue ───────────────────────────────────────────────────
const ELEMENT_TYPES = [
  { type: "p",               icon: Type,      label: "Para" },
  { type: "h2",              icon: Type,      label: "H2" },
  { type: "h3",              icon: Type,      label: "H3" },
  { type: "h4",              icon: Type,      label: "H4" },
  { type: "h5",              icon: Type,      label: "H5" },
  { type: "h6",              icon: Type,      label: "H6" },
  { type: "h2_with_link",    icon: LinkIcon,  label: "H2+Link" },
  { type: "h3_with_link",    icon: LinkIcon,  label: "H3+Link" },
  { type: "h4_with_link",    icon: LinkIcon,  label: "H4+Link" },
  { type: "h5_with_link",    icon: LinkIcon,  label: "H5+Link" },
  { type: "h6_with_link",    icon: LinkIcon,  label: "H6+Link" },
  { type: "quote",           icon: Type,      label: "Quote" },
  { type: "ul",              icon: List,      label: "Bullets" },
  { type: "ol",              icon: List,      label: "Numbered" },
  { type: "table",           icon: List,      label: "Table" },
  { type: "image",           icon: ImageIcon, label: "Image" },
  { type: "p_with_link",     icon: LinkIcon,  label: "Para+Link" },
  { type: "p_with_bold",     icon: Type,      label: "Para+Bold" },
  { type: "p_with_link_bold",icon: LinkIcon,  label: "P+Lnk+Bold" },
];

// ─── Preview section renderer ─────────────────────────────────────────────────
function PreviewSection({ s, usedH3 }) {
  if (["h2","h3","h4","h5","h6"].includes(s.type)) {
    const tag = s.type;
    const base = slugify(s.text || "");
    const count = (usedH3.get(base) || 0) + 1;
    usedH3.set(base, count);
    const id = count === 1 ? base : `${base}-${count}`;
    const sizeClass = HEADING_SIZE[tag];
    return React.createElement(tag, {
      id,
      className: `scroll-mt-28 ${sizeClass} ${s.fontWeight || "font-bold"} text-[#111827]`,
      dangerouslySetInnerHTML: { __html: s.text },
    });
  }

  if (["h2_with_link","h3_with_link","h4_with_link","h5_with_link","h6_with_link"].includes(s.type)) {
    const tag = getHeadingTag(s.type);
    const base = slugify(s.linkText || "");
    const count = (usedH3.get(base) || 0) + 1;
    usedH3.set(base, count);
    const id = count === 1 ? base : `${base}-${count}`;
    const sizeClass = HEADING_SIZE[tag];
    return React.createElement(tag, {
      id,
      className: `scroll-mt-28 ${sizeClass} ${s.fontWeight || "font-bold"} text-[#111827]`,
    }, [
      s.textBefore ? s.textBefore.trimEnd() + " " : "",
      <a key="link" href={s.href} target="_blank" rel="noopener noreferrer"
        className="text-[#E3A600] no-underline hover:opacity-80 transition-opacity">{s.linkText}</a>,
      s.textAfter ? " " + s.textAfter.trimStart() : "",
    ]);
  }

  if (s.type === "quote")
    return (
      <div className="rounded-xl border border-[#F2E6C9] bg-[#FFF8E8] px-4 py-4 text-[13px] sm:text-[14px] text-slate-700">
        <div className="border-l-4 border-[#E3A600] pl-3 italic leading-relaxed">{s.text}</div>
      </div>
    );

  if (s.type === "table") {
    const themed = s.themed;
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-[13px] sm:text-[14px] text-slate-700 border-collapse">
          <thead>
            <tr>
              {(s.headers || []).map((h, i) => (
                <th key={i} className="text-left px-4 py-3 font-bold border border-slate-200 text-[#111827]"
                  style={{ background: themed ? "#e8dfa8" : "#ffffff" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(s.rows || []).map((row, ri) => (
              <tr key={ri} style={{ background: themed ? (ri % 2 === 0 ? "#faf7ec" : "#f5f0d8") : "#ffffff" }}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5 border border-slate-200">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (s.type === "image")
    return (
      <figure className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
        {s.src
          ? <img src={s.src} alt={s.caption || "Blog image"} className="w-full h-auto" />
          : <div className="w-full h-40 flex items-center justify-center text-slate-400 text-sm">No image uploaded</div>
        }
        {s.caption && <figcaption className="px-4 py-3 text-[12px] text-slate-500">{s.caption}</figcaption>}
      </figure>
    );

  if (s.type === "ul")
    return (
      <ul className="list-disc list-outside pl-5 space-y-2 text-[13px] sm:text-[14px] text-slate-600">
        {(s.text || []).map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
      </ul>
    );

  if (s.type === "ol")
    return (
      <ol className="list-decimal list-outside pl-5 space-y-2 text-[13px] sm:text-[14px] text-slate-600">
        {(s.text || []).map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
      </ol>
    );

  if (s.type === "p_with_link")
    return (
      <p className={`text-[13px] sm:text-[14px] leading-relaxed text-slate-600 ${s.fontWeight || ""}`}>
        {s.textBefore && <span>{s.textBefore} </span>}
        <a href={s.href} className="text-[#E3A600] font-semibold underline underline-offset-2 hover:opacity-80">{s.linkText}</a>
        {s.textAfter && <span> {s.textAfter}</span>}
      </p>
    );

  if (s.type === "p_with_bold")
    return (
      <p className={`text-[13px] sm:text-[14px] leading-relaxed text-slate-600 ${s.fontWeight || ""}`}>
        {(s.parts || []).map((part, i) =>
          part.bold
            ? <strong key={i} className="font-semibold text-[#111827]">{part.text}</strong>
            : <span key={i}>{part.text}</span>
        )}
      </p>
    );

  if (s.type === "p_with_link_bold")
    return (
      <p className={`text-[13px] sm:text-[14px] leading-relaxed text-slate-600 ${s.fontWeight || ""}`}>
        {(s.partsBefore || []).map((part, i) =>
          part.bold
            ? <strong key={i} className="font-semibold text-[#111827]">{part.text}</strong>
            : <span key={i}>{part.text}</span>
        )}
        {" "}<a href={s.href} className="text-[#E3A600] font-semibold underline underline-offset-2 hover:opacity-80">{s.linkText}</a>{" "}
        {(s.partsAfter || []).map((part, i) =>
          part.bold
            ? <strong key={i} className="font-semibold text-[#111827]">{part.text}</strong>
            : <span key={i}>{part.text}</span>
        )}
      </p>
    );

  return <p className={`text-[13px] sm:text-[14px] leading-relaxed text-slate-600 ${s.fontWeight || ""}`} dangerouslySetInnerHTML={{ __html: s.text }} />;
}

// ═════════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═════════════════════════════════════════════════════════════════════════════
function LoginScreen() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Email and password are required."); return; }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (!result.success) setError(result.message || "Login failed. Check your credentials.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5] flex items-center justify-center px-4"
      style={{ fontFamily: "'Urbanist', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap');`}</style>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-4"
            style={{ background: "linear-gradient(135deg,#1A614F,#0d3d30)" }}>
            <Leaf size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827]">Novara Blog Builder</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to create &amp; edit blogs</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-7">
          {error && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm mb-5">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email address</Label>
              <Input type="email" value={form.email} placeholder="admin@novaranatureestates.com" autoFocus
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={form.password} placeholder="••••••••"
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm
                transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              style={{ background: loading ? "#1A614F99" : "linear-gradient(135deg,#1A614F,#0d3d30)" }}>
              {loading ? <><Loader size={15} className="animate-spin" /> Signing in…</> : <><LogIn size={15} /> Sign In</>}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">Authorized Novara team members only</p>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOG PICKER
// ═════════════════════════════════════════════════════════════════════════════
function BlogPicker({ onSelect }) {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");

  const filtered = BLOGS.filter(
    (b) =>
      b.title?.toLowerCase().includes(query.toLowerCase()) ||
      b.slug?.toLowerCase().includes(query.toLowerCase()) ||
      b.category?.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Urbanist', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap');`}</style>
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1A614F" }}>
            <Leaf size={15} className="text-white" />
          </div>
          <div>
            <span className="text-[15px] font-bold text-slate-800 leading-none block">Blog Builder</span>
            <span className="text-[10px] text-slate-400">Novara Nature Estates</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "#E9FFF3", color: "#1B9A63" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#1B9A63]" />
            {user?.email || "Logged in"}
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-semibold hover:border-red-300 hover:text-red-500 transition-all">
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-[#111827] mb-2">What would you like to do?</h2>
        <p className="text-sm text-slate-500 mb-8">Create a new blog post, or select an existing one to edit.</p>
        <button onClick={() => onSelect(null)}
          className="w-full mb-8 flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-[#1A614F]/30
            bg-[#F0FDF4] hover:border-[#1A614F] hover:bg-[#E9FFF3] transition-all group text-left">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg,#1A614F,#0d3d30)" }}>
            <Plus size={22} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-[#1A614F] text-base">Create new blog</div>
            <div className="text-sm text-slate-500 mt-0.5">Start fresh with a blank canvas</div>
          </div>
        </button>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Edit existing ({BLOGS.length} blogs)</h3>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search blogs…"
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#1A614F] transition-all w-44" />
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map((blog) => (
            <button key={blog.id} onClick={() => onSelect(blog)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-[#E3A600] hover:shadow-md transition-all group text-left">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100">
                {blog.heroImage || blog.image
                  ? <img src={blog.heroImage || blog.image} alt={blog.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} className="text-slate-300" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 text-sm truncate group-hover:text-[#1A614F] transition-colors">{blog.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#E9FFF3", color: "#1B9A63" }}>{blog.category}</span>
                  <span className="text-[11px] text-slate-400 truncate">{blog.slug}</span>
                </div>
              </div>
              <Edit3 size={14} className="text-slate-300 group-hover:text-[#E3A600] flex-shrink-0 transition-colors" />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">No blogs match "{query}"</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOG EDITOR
// ═════════════════════════════════════════════════════════════════════════════
function BlogEditor({ editingBlog, onBack }) {
  const { token, user, logout } = useAuth();
  const [isEditMode] = useState(!!editingBlog);

  const [elements, setElements]             = useState([]);
  const [selectedId, setSelectedId]         = useState(null);
  const [showAddMenu, setShowAddMenu]       = useState(false);
  const [insertAfterIdx, setInsertAfterIdx] = useState(null);
  const [hoveredInsert, setHoveredInsert]   = useState(null);
  const [showSettings, setShowSettings]     = useState(false);
  const [previewMode, setPreviewMode]       = useState(false);
  const [publishStatus, setPublishStatus]   = useState(null);
  const [publishMsg, setPublishMsg]         = useState("");

  const [meta, setMeta] = useState({
    title: "", headline: "", description: "", keywords: "",
    slug: "", category: "Managed Farmland",
    author: "Novara Nature Estates",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    heroImage: "", imageAlt: "", tags: "",
  });

  const [drafts, setDrafts] = useState([]);
  const [currentDraftKey, setCurrentDraftKey] = useState(null);

  // ── FIX: store both the original id AND the original slug so we can
  //         match the entry in blogs.js even after the user edits the slug.
  const editingBlogId          = React.useRef(editingBlog?.id   ?? null);
  const editingBlogOriginalSlug = React.useRef(editingBlog?.slug ?? "");

  useEffect(() => { loadDrafts(); }, []);

  useEffect(() => {
    if (editingBlog) {
      editingBlogId.current           = editingBlog.id;
      editingBlogOriginalSlug.current = editingBlog.slug || "";
    }
  }, [editingBlog]);

  useEffect(() => {
    if (!editingBlog) return;
    setMeta({
      title:       editingBlog.title       || editingBlog.headline || "",
      headline:    editingBlog.headline    || editingBlog.title    || "",
      description: editingBlog.description || "",
      keywords:    editingBlog.keywords    || "",
      slug:        editingBlog.slug        || "",
      category:    editingBlog.category    || "Managed Farmland",
      author:      editingBlog.author      || "NOVARA NATURE ESTATES",
      date:        editingBlog.date        || "",
      heroImage:   editingBlog.heroImage   || editingBlog.image    || "",
      imageAlt:    editingBlog.imageAlt    || editingBlog.title    || "",
      tags:        (editingBlog.tags || []).join(", "),
    });
    const els = (editingBlog.sections || []).map(sectionToElement);
    setElements(els);
  }, [editingBlog]);

  const selectedEl = elements.find((el) => el.id === selectedId) || null;

  // ── TOC computation ───────────────────────────────────────────────────────
  const toc = useMemo(() => {
    const used = new Map();
    return elements
      .filter((el) => TOC_TYPES.has(el.type))
      .map((el) => {
        const rawText = el.linkText || el.text || "";
        const base = slugify(rawText);
        const count = (used.get(base) || 0) + 1;
        used.set(base, count);
        const id = count === 1 ? base : `${base}-${count}`;
        const level = getHeadingTag(el.type);
        return { id, text: rawText, level };
      });
  }, [elements]);

  const [activeId, setActiveId] = useState("");
  useEffect(() => {
    if (!previewMode || !toc.length) return;
    const headingEls = toc.map((t) => document.getElementById(t.id)).filter(Boolean);
    if (!headingEls.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      { root: null, rootMargin: "-25% 0px -65% 0px", threshold: [0.1, 0.25, 0.5, 0.75, 1] },
    );
    headingEls.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [previewMode, toc]);

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  };

  const addElement = useCallback((type) => {
    const el = createElement(type);
    setElements((prev) => {
      const next = [...prev];
      if (insertAfterIdx === -1) return [el, ...next];
      if (insertAfterIdx !== null) { next.splice(insertAfterIdx + 1, 0, el); return next; }
      return [...next, el];
    });
    setSelectedId(el.id);
    setShowAddMenu(false);
    setInsertAfterIdx(null);
  }, [insertAfterIdx]);

  const updateEl = useCallback(
    (id, patch) => setElements((p) => p.map((el) => el.id === id ? { ...el, ...patch } : el)), []);

  const deleteEl = useCallback((id) => {
    setElements((p) => p.filter((el) => el.id !== id));
    setSelectedId(null);
  }, []);

  const moveEl = useCallback((id, dir) => {
    setElements((prev) => {
      const idx = prev.findIndex((el) => el.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }, []);

  const addListItem    = (id) => updateEl(id, { text: [...(elements.find((e) => e.id === id)?.text || []), "New item"] });
  const updateItem     = (id, idx, val) => updateEl(id, { text: elements.find((e) => e.id === id).text.map((t, i) => i === idx ? val : t) });
  const deleteItem     = (id, idx) => updateEl(id, { text: elements.find((e) => e.id === id).text.filter((_, i) => i !== idx) });

  const addBoldPart    = (id) => updateEl(id, { parts: [...(elements.find((e) => e.id === id)?.parts || []), { bold: false, text: "New part" }] });
  const updatePart     = (id, idx, patch) => updateEl(id, { parts: elements.find((e) => e.id === id).parts.map((p, i) => i === idx ? { ...p, ...patch } : p) });
  const deletePart     = (id, idx) => updateEl(id, { parts: elements.find((e) => e.id === id).parts.filter((_, i) => i !== idx) });

  const addPartBefore  = (id) => updateEl(id, { partsBefore: [...(elements.find((e) => e.id === id)?.partsBefore || []), { bold: false, text: "New part" }] });
  const updatePartB    = (id, idx, patch) => updateEl(id, { partsBefore: elements.find((e) => e.id === id).partsBefore.map((p, i) => i === idx ? { ...p, ...patch } : p) });
  const deletePartB    = (id, idx) => updateEl(id, { partsBefore: elements.find((e) => e.id === id).partsBefore.filter((_, i) => i !== idx) });
  const addPartAfter   = (id) => updateEl(id, { partsAfter: [...(elements.find((e) => e.id === id)?.partsAfter || []), { bold: false, text: "New part" }] });
  const updatePartA    = (id, idx, patch) => updateEl(id, { partsAfter: elements.find((e) => e.id === id).partsAfter.map((p, i) => i === idx ? { ...p, ...patch } : p) });
  const deletePartA    = (id, idx) => updateEl(id, { partsAfter: elements.find((e) => e.id === id).partsAfter.filter((_, i) => i !== idx) });

  const [heroUploading, setHeroUploading]       = useState(false);
  const [contentUploading, setContentUploading] = useState(null);

  const handleHeroUpload = async (file) => {
    if (!file) return;
    setHeroUploading(true);
    try {
      const url = await compressAndUpload(file, { maxW: 1400, quality: 0.82 });
      setMeta((p) => ({ ...p, heroImage: url }));
    } catch (e) { alert("Hero image upload failed: " + e.message); }
    finally { setHeroUploading(false); }
  };

  const handleContentImageUpload = async (id, file) => {
    if (!file) return;
    setContentUploading(id);
    try {
      const url = await compressAndUpload(file, { maxW: 1200, quality: 0.80 });
      updateEl(id, { src: url });
    } catch (e) { alert("Image upload failed: " + e.message); }
    finally { setContentUploading(null); }
  };

  const exportBlogData = () => {
    const sections = toSections(elements);
    const title    = meta.headline || meta.title;
    const slug     = meta.slug || slugify(title) || `blog-${Date.now()}`;
    const tagsArr  = meta.tags ? meta.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    return {
      id:          isEditMode ? editingBlogId.current : Date.now(),
      slug,
      category:    meta.category,
      title:       meta.title || title,
      headline:    title,
      description: meta.description,
      date:        meta.date,
      keywords:    meta.keywords,
      author:      meta.author,
      image:       meta.heroImage,
      heroImage:   meta.heroImage,
      coverImage:  meta.heroImage,
      imageAlt:    meta.imageAlt || title,
      tags:        tagsArr,
      sections,
    };
  };

  const downloadJSON = () => {
    const d = exportBlogData();
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `blog-${d.slug}.json`,
    });
    a.click(); URL.revokeObjectURL(a.href);
  };

  // ── GitHub config ─────────────────────────────────────────────────────────
  const GH_TOKEN  = import.meta.env.VITE_GH_TOKEN;
  const GH_REPO   = "rathnabhoomidevelopers-art/Novara";
  const GH_BRANCH = "main";
  const GH_FILE   = "src/data/blogs.js";

  const fetchCurrentFile = async () => {
    const res = await fetch(
      `https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}?ref=${GH_BRANCH}&t=${Date.now()}`,
      {
        headers: {
          Authorization: `token ${GH_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status} ${res.statusText}`);
    const fileData = await res.json();
    const sha = fileData.sha;
    const binary = atob(fileData.content.replace(/\n/g, ""));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const currentContent = new TextDecoder("utf-8").decode(bytes);

    const stripped = currentContent
      .replace(/^[\s\S]*?export\s+const\s+BLOGS\s*=\s*/, "")
      .replace(/;?\s*$/, "")
      .trim();

    // eslint-disable-next-line no-new-func
    const blogsArray = new Function(`return ${stripped}`)();
    return { sha, blogsArray };
  };

  const publishBlog = async () => {
    if (!meta.headline && !meta.title) {
      alert("Please add a headline first (open ⚙ Settings)."); setShowSettings(true); return;
    }
    if (elements.length === 0) { alert("Please add at least one content block."); return; }

    setPublishStatus("loading");
    setPublishMsg("Fetching latest blogs.js from GitHub…");

    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        setPublishMsg(`Fetching latest SHA from GitHub… (attempt ${attempt}/${MAX_RETRIES})`);
        const { sha, blogsArray } = await fetchCurrentFile();

        const blogData = exportBlogData();
        let newBlogsArray;

        if (isEditMode) {
          setPublishMsg("Updating existing blog entry…");

          // ── FIX: match by id first (robust to type coercion), then fall
          //         back to the ORIGINAL slug (captured at mount time) so that
          //         editing the slug field doesn't cause a new blog to be created.
          const idx = blogsArray.findIndex(
            (b) =>
              String(b.id) === String(editingBlogId.current) ||
              b.slug === editingBlogOriginalSlug.current
          );

          if (idx === -1) {
            throw new Error(
              `Could not find blog with id "${editingBlogId.current}" or original slug "${editingBlogOriginalSlug.current}" in blogs.js. ` +
              `Available ids: ${blogsArray.map((b) => b.id).join(", ")}`
            );
          }

          newBlogsArray = [...blogsArray];
          // Preserve original numeric id; allow all other fields (incl. slug) to update freely.
          newBlogsArray[idx] = {
            ...blogData,
            id: blogsArray[idx].id,
          };
        } else {
          setPublishMsg("Inserting new blog entry…");
          const nextId = Math.max(0, ...blogsArray.map((b) => Number(b.id) || 0)) + 1;
          newBlogsArray = [{ ...blogData, id: nextId }, ...blogsArray];
        }

        const entriesStr = newBlogsArray
          .map((b) => "  " + JSON.stringify(b, null, 2).replace(/\n/g, "\n  "))
          .join(",\n");
        const newContent = `export const BLOGS = [\n${entriesStr}\n];\n`;

        setPublishMsg("Committing to GitHub…");
        const commitMessage = isEditMode
          ? `update blog: ${blogData.slug}`
          : `add blog: ${blogData.slug}`;

        const putRes = await fetch(
          `https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}`,
          {
            method: "PUT",
            headers: {
              Authorization: `token ${GH_TOKEN}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: commitMessage,
              content: btoa(unescape(encodeURIComponent(newContent))),
              sha,
              branch: GH_BRANCH,
            }),
          }
        );

        if (putRes.status === 409) {
          if (attempt < MAX_RETRIES) {
            setPublishMsg(`SHA conflict — retrying… (${attempt}/${MAX_RETRIES})`);
            await new Promise((r) => setTimeout(r, 800 * attempt));
            continue;
          }
          throw new Error(
            "SHA conflict: GitHub rejected the update 3 times. " +
            "Another process may be writing to blogs.js simultaneously. Please try again."
          );
        }

        if (!putRes.ok) {
          const err = await putRes.json().catch(() => ({}));
          throw new Error(err.message || `Commit failed: HTTP ${putRes.status}`);
        }

        // ── FIX: After a successful publish, update the stored original slug
        //         so subsequent saves in the same session use the new slug as
        //         the fallback identifier.
        if (isEditMode) {
          editingBlogOriginalSlug.current = blogData.slug;
        }

        setPublishStatus("success");
        setPublishMsg(
          isEditMode
            ? "✅ Blog updated on GitHub! Vercel will redeploy shortly."
            : "✅ Blog published to GitHub! Vercel will redeploy shortly."
        );
        return;

      } catch (e) {
        if (attempt === MAX_RETRIES || !e.message?.includes("SHA conflict")) {
          console.error("Full publish error:", e);
          setPublishStatus("error");
          setPublishMsg(e.message || "Unknown error occurred.");
          return;
        }
      }
    }
  };

  // ── Drafts ────────────────────────────────────────────────────────────────
  const loadDrafts = () => {
    const allDrafts = Object.keys(localStorage)
      .filter((key) => key.startsWith("draft_"))
      .map((key) => ({
        key,
        data: JSON.parse(localStorage.getItem(key)),
      }));
    setDrafts(allDrafts);
  };

  const saveDraft = () => {
    const key = currentDraftKey || `draft_${Date.now()}`;
    const draftData = { meta, elements, savedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(draftData));
    setCurrentDraftKey(key);
    loadDrafts();
    setPublishStatus("success");
    setPublishMsg("Draft saved successfully ✅");
  };

  const loadDraft = (key) => {
    const draft = JSON.parse(localStorage.getItem(key));
    setMeta(draft.meta);
    setElements(draft.elements);
    setCurrentDraftKey(key);
    setPublishMsg("Draft loaded ✏️");
  };

  const deleteDraft = (key) => {
    localStorage.removeItem(key);
    loadDrafts();
  };

  const progress = [
    { label: "Headline",    done: !!(meta.headline || meta.title) },
    { label: "Hero image",  done: !!meta.heroImage },
    { label: "Slug",        done: !!meta.slug },
    { label: `${elements.length} block${elements.length !== 1 ? "s" : ""}`, done: elements.length > 0 },
    { label: "Description", done: !!meta.description },
  ];

  // ── Builder element renderer ──────────────────────────────────────────────
  const renderBuilder = (el, idx) => {
    const isSelected = selectedId === el.id;
    const ring = `cursor-pointer rounded-lg transition-all outline-none ${
      isSelected
        ? "ring-2 ring-[#1A614F] ring-offset-2"
        : "hover:ring-2 hover:ring-[#E3A600] hover:ring-offset-1"}`;
    const pick = (e) => { e.stopPropagation(); setSelectedId(el.id); };

    const InsertZone = ({ after }) => {
      const key = after ? idx : idx - 0.5;
      return (
        <div onMouseEnter={() => setHoveredInsert(key)} onMouseLeave={() => setHoveredInsert(null)}>
          <button
            className={`w-full flex items-center gap-2 py-1 text-[11px] font-semibold text-[#1A614F] transition-opacity
              ${hoveredInsert === key ? "opacity-100" : "opacity-0"}`}
            onClick={(e) => { e.stopPropagation(); setInsertAfterIdx(after ? idx : idx - 1); setShowAddMenu(true); }}
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1A614F60] to-transparent" />
            <Plus size={11} /> Insert here
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1A614F60] to-transparent" />
          </button>
        </div>
      );
    };

    let content;
    const isHeading = ["h2","h3","h4","h5","h6"].includes(el.type);
    const isHeadingLink = ["h2_with_link","h3_with_link","h4_with_link","h5_with_link","h6_with_link"].includes(el.type);

    if (isHeading) {
      const tag = el.type;
      const sizeClass = HEADING_SIZE[tag];
      content = React.createElement(tag, {
        className: `${sizeClass} ${el.fontWeight || "font-bold"} text-[#111827] ${ring}`,
        onClick: pick,
        contentEditable: true,
        suppressContentEditableWarning: true,
        onBlur: (e) => updateEl(el.id, { text: e.currentTarget.innerText }),
      }, el.text);
    } else if (isHeadingLink) {
      const tag = getHeadingTag(el.type);
      const sizeClass = HEADING_SIZE[tag];
      content = React.createElement(tag, {
        className: `${sizeClass} ${el.fontWeight || "font-bold"} text-[#111827] ${ring}`,
        onClick: pick,
      }, [
        el.textBefore ? el.textBefore + " " : "",
        <span key="link" className="text-[#E3A600] underline">{el.linkText || "link"}</span>,
        el.textAfter ? " " + el.textAfter : "",
      ]);
    } else if (el.type === "quote")
      content = (
        <div className={`rounded-xl border border-[#F2E6C9] bg-[#FFF8E8] px-4 py-4 ${ring}`} onClick={pick}>
          <div className="border-l-4 border-[#E3A600] pl-3 italic text-[13px] text-slate-700 leading-relaxed"
            contentEditable suppressContentEditableWarning onBlur={(e) => updateEl(el.id, { text: e.currentTarget.innerText })}>{el.text}</div>
        </div>
      );
    else if (el.type === "image")
      content = (
        <figure className={`rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 ${ring}`} onClick={pick}>
          {el.src
            ? <img src={el.src} alt={el.caption || ""} className="w-full h-auto" />
            : <div className="w-full h-40 flex flex-col items-center justify-center text-slate-400 gap-2">
                <ImageIcon size={24} className="opacity-40" />
                <p className="text-sm">Select block → upload image in panel</p>
              </div>
          }
          {el.caption && <figcaption className="px-4 py-3 text-[12px] text-slate-500">{el.caption}</figcaption>}
        </figure>
      );
    else if (el.type === "table")
      content = (
        <div className={`overflow-x-auto rounded-xl border border-slate-200 ${ring}`} onClick={pick}>
          <table className="w-full text-[13px] sm:text-[14px] text-slate-700 border-collapse">
            <thead><tr>{(el.headers || []).map((h, i) => (
              <th key={i} className="text-left px-4 py-3 font-bold border border-slate-200 text-[#111827]"
                style={{ background: el.themed ? "#e8dfa8" : "#ffffff" }}>{h}</th>
            ))}</tr></thead>
            <tbody>{(el.rows || []).map((row, ri) => (
              <tr key={ri} style={{ background: el.themed ? (ri % 2 === 0 ? "#faf7ec" : "#f5f0d8") : "#ffffff" }}>
                {row.map((cell, ci) => <td key={ci} className="px-4 py-2.5 border border-slate-200">{cell}</td>)}
              </tr>
            ))}</tbody>
          </table>
        </div>
      );
    else if (el.type === "ul" || el.type === "ol") {
      const Tag = el.type;
      const cls = el.type === "ul" ? "list-disc" : "list-decimal";
      content = (
        <Tag className={`${cls} list-outside pl-5 space-y-1 text-[13px] sm:text-[14px] text-slate-600 ${ring}`} onClick={pick}>
          {(el.text || []).map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
        </Tag>
      );
    } else if (el.type === "p_with_link")
      content = (
        <p className={`text-[13px] sm:text-[14px] leading-relaxed text-slate-600 ${el.fontWeight || ""} ${ring}`} onClick={pick}>
          {el.textBefore && <span>{el.textBefore} </span>}
          <span className="text-[#E3A600] font-semibold underline underline-offset-2">{el.linkText || "link"}</span>
          {el.textAfter && <span> {el.textAfter}</span>}
        </p>
      );
    else if (el.type === "p_with_bold")
      content = (
        <p className={`text-[13px] sm:text-[14px] leading-relaxed text-slate-600 ${el.fontWeight || ""} ${ring}`} onClick={pick}>
          {(el.parts || []).map((part, i) =>
            part.bold
              ? <strong key={i} className="font-semibold text-[#111827]">{part.text}</strong>
              : <span key={i}>{part.text}</span>
          )}
        </p>
      );
    else if (el.type === "p_with_link_bold")
      content = (
        <p className={`text-[13px] sm:text-[14px] leading-relaxed text-slate-600 ${el.fontWeight || ""} ${ring}`} onClick={pick}>
          {(el.partsBefore || []).map((part, i) =>
            part.bold
              ? <strong key={i} className="font-semibold text-[#111827]">{part.text}</strong>
              : <span key={i}>{part.text}</span>
          )}
          {" "}<span className="text-[#E3A600] font-semibold underline underline-offset-2">{el.linkText || "link"}</span>{" "}
          {(el.partsAfter || []).map((part, i) =>
            part.bold
              ? <strong key={i} className="font-semibold text-[#111827]">{part.text}</strong>
              : <span key={i}>{part.text}</span>
          )}
        </p>
      );
    else
      content = (
        <div className="space-y-1">
          {selectedId === el.id && (
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg w-fit"
              onMouseDown={(e) => e.preventDefault()}>
              <button title="Bold selected text"
                onMouseDown={(e) => { e.preventDefault(); document.execCommand("bold"); }}
                className="px-2 py-0.5 rounded text-xs font-bold text-slate-600 hover:bg-[#E9FFF3] hover:text-[#1A614F] transition-all border border-transparent hover:border-[#1A614F]/20"
              ><strong>B</strong></button>
              <button title="Remove bold"
                onMouseDown={(e) => { e.preventDefault(); document.execCommand("removeFormat"); }}
                className="px-2 py-0.5 rounded text-xs text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent"
              >✕ bold</button>
            </div>
          )}
          <p className={`text-[13px] sm:text-[14px] leading-relaxed text-slate-600 ${el.fontWeight || ""} ${ring}`}
            onClick={pick} contentEditable suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: el.text }}
            onBlur={(e) => updateEl(el.id, { text: e.currentTarget.innerHTML })} />
        </div>
      );

    return (
      <React.Fragment key={el.id}>
        {idx === 0 && <InsertZone after={false} />}
        <div onClick={(e) => e.stopPropagation()}>{content}</div>
        <InsertZone after={true} />
      </React.Fragment>
    );
  };

  // ── Element editor panel ──────────────────────────────────────────────────
  const renderEditor = () => {
    if (!selectedEl)
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <Type size={32} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {elements.length > 0 ? "Click a block to edit it" : "Add a content block to start"}
          </p>
        </div>
      );

    const el = selectedEl;
    const isHeading     = ["h2","h3","h4","h5","h6"].includes(el.type);
    const isHeadingLink = ["h2_with_link","h3_with_link","h4_with_link","h5_with_link","h6_with_link"].includes(el.type);

    return (
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 panel-scroll">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase"
            style={{ background: "#E9FFF3", color: "#1B9A63" }}>{el.type}</span>
          <div className="flex gap-1.5">
            <button onClick={() => moveEl(el.id, -1)} title="Move up"
              className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:border-[#1A614F] hover:text-[#1A614F] flex items-center justify-center text-xs transition-all">↑</button>
            <button onClick={() => moveEl(el.id, 1)} title="Move down"
              className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:border-[#1A614F] hover:text-[#1A614F] flex items-center justify-center text-xs transition-all">↓</button>
            <button onClick={() => deleteEl(el.id)}
              className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all">
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {(isHeading || isHeadingLink || ["p","p_with_link","p_with_bold","p_with_link_bold"].includes(el.type)) && (
          <div>
            <Label>Font weight</Label>
            <select
              value={el.fontWeight || (isHeading || isHeadingLink ? "font-bold" : "font-normal")}
              onChange={(e) => updateEl(el.id, { fontWeight: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A614F]/20 focus:border-[#1A614F] transition-all"
            >
              <option value="font-normal">Normal</option>
              <option value="font-medium">Medium</option>
              <option value="font-semibold">Semibold</option>
              <option value="font-bold">Bold</option>
              <option value="font-extrabold">Extra Bold</option>
            </select>
          </div>
        )}

        {isHeading && (
          <div>
            <Label>Heading text</Label>
            <Textarea value={el.text} rows={2}
              onChange={(e) => updateEl(el.id, { text: e.target.value })}
              placeholder="Type your heading…" />
          </div>
        )}

        {isHeadingLink && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
              Preview: <span className="text-slate-600">{el.textBefore} </span>
              <span className="text-[#E3A600] font-semibold underline">{el.linkText}</span>
              <span className="text-slate-600"> {el.textAfter}</span>
            </div>
            <div><Label>Text before link</Label><Input value={el.textBefore || ""} onChange={(e) => updateEl(el.id, { textBefore: e.target.value })} /></div>
            <div><Label>Link text</Label><Input value={el.linkText || ""} onChange={(e) => updateEl(el.id, { linkText: e.target.value })} /></div>
            <div><Label>URL</Label><Input value={el.href || ""} placeholder="https://…" onChange={(e) => updateEl(el.id, { href: e.target.value })} /></div>
            <div><Label>Text after link</Label><Input value={el.textAfter || ""} onChange={(e) => updateEl(el.id, { textAfter: e.target.value })} /></div>
          </div>
        )}

        {["quote"].includes(el.type) && (
          <div>
            <Label>Content</Label>
            <Textarea value={el.text} rows={3}
              onChange={(e) => updateEl(el.id, { text: e.target.value })}
              placeholder="Type your content…" />
          </div>
        )}

        {el.type === "p" && (
          <div>
            <Label>Content</Label>
            <div className="space-y-2">
              <Textarea
                value={el.text.replace(/<strong>/g, "**").replace(/<\/strong>/g, "**")}
                rows={4}
                onChange={(e) => {
                  const html = e.target.value.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                  updateEl(el.id, { text: html });
                }}
                placeholder="Type content… Use **word** to bold"
              />
              <p className="text-[10px] text-slate-400 leading-snug">
                Tip: wrap words in <code className="bg-slate-100 px-1 rounded">**double asterisks**</code> to make them <strong>bold</strong>.
              </p>
            </div>
          </div>
        )}

        {el.type === "p_with_link" && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
              Preview: <span className="text-slate-600">{el.textBefore} </span>
              <span className="text-[#E3A600] font-semibold underline">{el.linkText}</span>
              <span className="text-slate-600"> {el.textAfter}</span>
            </div>
            <div><Label>Text before link</Label><Input value={el.textBefore || ""} onChange={(e) => updateEl(el.id, { textBefore: e.target.value })} /></div>
            <div><Label>Link text</Label><Input value={el.linkText || ""} onChange={(e) => updateEl(el.id, { linkText: e.target.value })} /></div>
            <div><Label>URL</Label><Input value={el.href || ""} placeholder="https://…" onChange={(e) => updateEl(el.id, { href: e.target.value })} /></div>
            <div><Label>Text after link</Label><Input value={el.textAfter || ""} onChange={(e) => updateEl(el.id, { textAfter: e.target.value })} /></div>
          </div>
        )}

        {el.type === "p_with_bold" && (
          <div className="space-y-3">
            <Label>Text parts (toggle bold per part)</Label>
            <div className="space-y-2">
              {(el.parts || []).map((part, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <button onClick={() => updatePart(el.id, i, { bold: !part.bold })}
                    className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                      part.bold ? "bg-[#1A614F] text-white border-[#1A614F]" : "bg-white text-slate-500 border-slate-200"}`}>
                    B
                  </button>
                  <Input value={part.text} onChange={(e) => updatePart(el.id, i, { text: e.target.value })}
                    className={part.bold ? "font-semibold" : ""} />
                  <button onClick={() => deletePart(el.id, i)}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded border border-red-100 text-red-400 hover:bg-red-50">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => addBoldPart(el.id)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 text-xs hover:border-[#1A614F] hover:text-[#1A614F] transition-all">
              <Plus size={11} /> Add part
            </button>
          </div>
        )}

        {el.type === "p_with_link_bold" && (
          <div className="space-y-3">
            <SectionDivider>Parts before link</SectionDivider>
            <div className="space-y-2">
              {(el.partsBefore || []).map((part, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <button onClick={() => updatePartB(el.id, i, { bold: !part.bold })}
                    className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                      part.bold ? "bg-[#1A614F] text-white border-[#1A614F]" : "bg-white text-slate-500 border-slate-200"}`}>
                    B
                  </button>
                  <Input value={part.text} onChange={(e) => updatePartB(el.id, i, { text: e.target.value })} />
                  <button onClick={() => deletePartB(el.id, i)}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded border border-red-100 text-red-400 hover:bg-red-50"><X size={10} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => addPartBefore(el.id)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 text-xs hover:border-[#1A614F] hover:text-[#1A614F] transition-all">
              <Plus size={11} /> Add part before
            </button>

            <SectionDivider>Link</SectionDivider>
            <div><Label>Link text</Label><Input value={el.linkText || ""} onChange={(e) => updateEl(el.id, { linkText: e.target.value })} /></div>
            <div><Label>URL</Label><Input value={el.href || ""} placeholder="https://…" onChange={(e) => updateEl(el.id, { href: e.target.value })} /></div>

            <SectionDivider>Parts after link</SectionDivider>
            <div className="space-y-2">
              {(el.partsAfter || []).map((part, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <button onClick={() => updatePartA(el.id, i, { bold: !part.bold })}
                    className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                      part.bold ? "bg-[#1A614F] text-white border-[#1A614F]" : "bg-white text-slate-500 border-slate-200"}`}>
                    B
                  </button>
                  <Input value={part.text} onChange={(e) => updatePartA(el.id, i, { text: e.target.value })} />
                  <button onClick={() => deletePartA(el.id, i)}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded border border-red-100 text-red-400 hover:bg-red-50"><X size={10} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => addPartAfter(el.id)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 text-xs hover:border-[#1A614F] hover:text-[#1A614F] transition-all">
              <Plus size={11} /> Add part after
            </button>
          </div>
        )}

        {el.type === "image" && (
          <div className="space-y-3">
            <div>
              <Label>Upload image</Label>
              <input type="file" accept="image/*" disabled={contentUploading === el.id}
                onChange={(e) => handleContentImageUpload(el.id, e.target.files[0])} />
              {contentUploading === el.id && (
                <div className="mt-2 flex items-center gap-2 text-xs text-[#1A614F] font-semibold">
                  <Loader size={12} className="animate-spin" /> Compressing &amp; uploading to Cloudinary…
                </div>
              )}
              {contentUploading !== el.id && el.src && (
                <img src={el.src} alt="" className="mt-2 w-full h-28 object-cover rounded-lg border border-slate-100" />
              )}
            </div>
            <div><Label>Caption / alt text</Label>
              <Input value={el.caption || ""} placeholder="Describe the image for SEO…"
                onChange={(e) => updateEl(el.id, { caption: e.target.value })} />
            </div>
          </div>
        )}

        {el.type === "table" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
              <div>
                <div className="text-[12px] font-semibold text-slate-700">Themed style</div>
                <div className="text-[10px] text-slate-400">Warm beige header rows</div>
              </div>
              <button onClick={() => updateEl(el.id, { themed: !el.themed })}
                className={`relative w-10 h-5 rounded-full transition-all ${el.themed ? "bg-[#E3A600]" : "bg-slate-200"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${el.themed ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Column Headers</Label>
                <button onClick={() => updateEl(el.id, { headers: [...(el.headers || []), "New Column"], rows: (el.rows || []).map(r => [...r, ""]) })}
                  className="text-[10px] text-[#1A614F] font-semibold flex items-center gap-0.5 hover:opacity-70">
                  <Plus size={10} /> Col
                </button>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(el.headers || []).map((h, hi) => (
                  <div key={hi} className="flex gap-1 items-center flex-1 min-w-[80px]">
                    <Input value={h} placeholder={`Col ${hi + 1}`}
                      onChange={(e) => updateEl(el.id, { headers: el.headers.map((hh, i) => i === hi ? e.target.value : hh) })} />
                    {(el.headers || []).length > 1 && (
                      <button onClick={() => updateEl(el.id, {
                        headers: el.headers.filter((_, i) => i !== hi),
                        rows: (el.rows || []).map(r => r.filter((_, i) => i !== hi))
                      })} className="shrink-0 w-5 h-5 flex items-center justify-center rounded border border-red-100 text-red-400 hover:bg-red-50">
                        <X size={9} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Rows</Label>
                <button onClick={() => updateEl(el.id, { rows: [...(el.rows || []), (el.headers || []).map(() => "")] })}
                  className="text-[10px] text-[#1A614F] font-semibold flex items-center gap-0.5 hover:opacity-70">
                  <Plus size={10} /> Row
                </button>
              </div>
              <div className="space-y-2">
                {(el.rows || []).map((row, ri) => (
                  <div key={ri} className="flex gap-1 items-center">
                    <span className="text-[10px] text-slate-400 w-4 shrink-0 text-right">{ri + 1}</span>
                    {row.map((cell, ci) => (
                      <Input key={ci} value={cell} placeholder={el.headers?.[ci] || `Col ${ci + 1}`}
                        className="flex-1 min-w-0"
                        onChange={(e) => updateEl(el.id, { rows: el.rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? e.target.value : c) : r) })} />
                    ))}
                    <button onClick={() => updateEl(el.id, { rows: el.rows.filter((_, i) => i !== ri) })}
                      className="shrink-0 w-6 h-6 flex items-center justify-center rounded border border-red-100 text-red-400 hover:bg-red-50">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(el.type === "ul" || el.type === "ol") && (
          <div>
            <Label>List items</Label>
            <div className="space-y-1.5">
              {(el.text || []).map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-[11px] text-slate-400 w-4 text-right shrink-0">{idx + 1}.</span>
                  <Input value={item} onChange={(e) => updateItem(el.id, idx, e.target.value)} />
                  <button onClick={() => deleteItem(el.id, idx)}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded border border-red-100 text-red-400 hover:bg-red-50 transition-all">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => addListItem(el.id)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 text-xs hover:border-[#1A614F] hover:text-[#1A614F] transition-all">
              <Plus size={11} /> Add item
            </button>
          </div>
        )}
      </div>
    );
  };

  const displayTitle = meta.headline || meta.title;

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Urbanist', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .panel-scroll::-webkit-scrollbar { width: 3px; }
        .panel-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        input[type="file"] {
          font-size: 12px; color: #64748b; border: 1.5px dashed #cbd5e1;
          border-radius: 8px; padding: 8px 12px; width: 100%; background: #f8fafc;
          cursor: pointer; transition: border-color .2s;
        }
        input[type="file"]:hover { border-color: #1A614F; }
        [contenteditable]:focus { outline: none; }
        .btn-publish {
          background: linear-gradient(135deg, #1A614F 0%, #0d3d30 100%);
          color: #fff; border: none; padding: 11px 20px; border-radius: 10px;
          font-weight: 700; font-size: 13px; cursor: pointer; width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all .25s; box-shadow: 0 4px 14px rgba(26,97,79,.3);
          font-family: 'Urbanist', sans-serif;
        }
        .btn-publish:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26,97,79,.4); }
        .btn-publish:disabled { opacity: .55; cursor: not-allowed; }
        .btn-ghost {
          background: white; color: #374151; border: 1.5px solid #e2e8f0;
          padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all .2s; font-family: 'Urbanist', sans-serif; flex: 1;
        }
        .btn-ghost:hover { border-color: #1A614F; color: #1A614F; background: #E9FFF3; }
        .btn-danger {
          background: white; color: #dc2626; border: 1.5px solid #fecaca;
          padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all .2s; font-family: 'Urbanist', sans-serif; flex: 1;
        }
        .btn-danger:hover { border-color: #dc2626; background: #fef2f2; }
        .chip {
          background: white; border: 1.5px solid #e2e8f0; color: #475569;
          padding: 6px 4px; border-radius: 8px; font-size: 10px; font-weight: 600;
          cursor: pointer; display: flex; flex-direction: column; align-items: center;
          gap: 3px; transition: all .2s; text-align: center;
        }
        .chip:hover { border-color: #E3A600; color: #b57d00; background: #FFFBEB; }
        .preview-topbar {
          background: linear-gradient(90deg, #1A614F, #0d3d30); padding: 12px 24px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50; box-shadow: 0 2px 12px rgba(26,97,79,.3);
        }
        .toc-scroll::-webkit-scrollbar { width: 3px; }
        .toc-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
      `}</style>

      <div className={`grid min-h-screen ${previewMode ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[360px_1fr]"}`}>

        {/* ─── LEFT PANEL ──────────────────────────────────── */}
        {!previewMode && (
          <div className="bg-white border-r border-slate-200 flex flex-col panel-scroll overflow-y-auto shadow-sm"
            style={{ maxHeight: "100vh", position: "sticky", top: 0 }}>

            <div className="px-5 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={onBack} title="Back to picker"
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#1A614F] hover:text-[#1A614F] transition-all">
                    <ArrowLeft size={14} />
                  </button>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1A614F" }}>
                    {isEditMode ? <Edit3 size={14} className="text-white" /> : <Leaf size={14} className="text-white" />}
                  </div>
                  <div>
                    <h1 className="text-[14px] font-bold text-slate-800 leading-none">
                      {isEditMode ? "Edit Blog" : "New Blog"}
                    </h1>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-none truncate max-w-[140px]">
                      {isEditMode ? (editingBlog.slug) : "Novara Nature Estates"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPreviewMode(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:border-[#1A614F] hover:text-[#1A614F] hover:bg-[#E9FFF3] transition-all">
                    <Eye size={12} /> Preview
                  </button>
                  <button onClick={() => setShowSettings((v) => !v)}
                    className={`p-1.5 rounded-lg border text-xs transition-all ${showSettings ? "bg-[#E9FFF3] border-[#1A614F] text-[#1A614F]" : "border-slate-200 text-slate-500 hover:border-[#1A614F]"}`}>
                    <Settings size={14} />
                  </button>
                </div>
              </div>

              {isEditMode && (
                <div className="mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "#FFF8E8", color: "#b57d00", border: "1px solid #FFCE4C" }}>
                  <Edit3 size={11} /> Editing — changes will update the existing blog
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-3">
                {progress.map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${done ? "bg-[#1B9A63]" : "bg-slate-200"}`} />
                    <span className="text-[10px] text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            {showSettings && (
              <div className="border-b border-slate-100 bg-slate-50/60">
                <div className="px-5 py-4 space-y-3">
                  <SectionDivider>SEO & Meta</SectionDivider>
                  <div>
                    <Label>Page title ({"<title>"} tag)</Label>
                    <Input value={meta.title} placeholder="Top Farming Techniques Near Bangalore"
                      onChange={(e) => setMeta((p) => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Meta description</Label>
                    <Textarea value={meta.description} rows={2} placeholder="Brief description for search results…"
                      onChange={(e) => setMeta((p) => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Keywords</Label>
                      <Input value={meta.keywords} placeholder="farmland, Bangalore"
                        onChange={(e) => setMeta((p) => ({ ...p, keywords: e.target.value }))} /></div>
                    <div><Label>Tags (comma-separated)</Label>
                      <Input value={meta.tags} placeholder="Organic, Eco"
                        onChange={(e) => setMeta((p) => ({ ...p, tags: e.target.value }))} /></div>
                  </div>
                </div>

                <div className="px-5 py-4 space-y-3 border-t border-slate-100">
                  <SectionDivider>Blog Details</SectionDivider>
                  <div>
                    <Label>Headline (H1 on page)</Label>
                    <Input value={meta.headline} placeholder="Your compelling headline…"
                      onChange={(e) => setMeta((p) => ({
                        ...p, headline: e.target.value,
                      }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>URL Slug</Label>
                      <Input value={meta.slug} placeholder="my-blog-post"
                        onChange={(e) => setMeta((p) => ({ ...p, slug: e.target.value }))} />
                    </div>
                    <div><Label>Category</Label>
                      <Input value={meta.category}
                        onChange={(e) => setMeta((p) => ({ ...p, category: e.target.value }))} /></div>
                    <div><Label>Author</Label>
                      <Input value={meta.author}
                        onChange={(e) => setMeta((p) => ({ ...p, author: e.target.value }))} /></div>
                    <div><Label>Date</Label>
                      <Input value={meta.date}
                        onChange={(e) => setMeta((p) => ({ ...p, date: e.target.value }))} /></div>
                  </div>
                  <div>
                    <Label>Hero image</Label>
                    <input type="file" accept="image/*" disabled={heroUploading}
                      onChange={(e) => handleHeroUpload(e.target.files[0])} />
                    {heroUploading && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-[#1A614F] font-semibold">
                        <Loader size={12} className="animate-spin" /> Compressing &amp; uploading to Cloudinary…
                      </div>
                    )}
                    {!heroUploading && meta.heroImage && (
                      <div className="mt-2 relative">
                        <img src={meta.heroImage} alt="hero" className="w-full h-24 object-cover rounded-lg border border-slate-100" />
                        <button onClick={() => setMeta((p) => ({ ...p, heroImage: "" }))}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">×</button>
                      </div>
                    )}
                  </div>
                  <div><Label>Hero image alt text</Label>
                    <Input value={meta.imageAlt} placeholder="Farmland near Bangalore"
                      onChange={(e) => setMeta((p) => ({ ...p, imageAlt: e.target.value }))} /></div>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 space-y-3">
                  <SectionDivider>My Drafts</SectionDivider>
                  <div className="space-y-2 max-h-60 overflow-auto">
                    {drafts.length === 0 && (
                      <p className="text-sm opacity-60">No drafts yet</p>
                    )}
                    {drafts.map((d) => (
                      <div key={d.key} className="p-3 border rounded-lg flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-sm">{d.data.meta.headline || "Untitled"}</h4>
                          <p className="text-xs opacity-60">{new Date(d.data.savedAt).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => loadDraft(d.key)} className="btn-ghost">Edit</button>
                          <button onClick={() => deleteDraft(d.key)} className="btn-danger">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 space-y-3">
                  <SectionDivider>Save & Publish</SectionDivider>
                  <button onClick={saveDraft} className="btn-ghost w-full">💾 Save as Draft</button>
                  <button onClick={downloadJSON} className="btn-ghost w-full"><Upload size={12} /> Download JSON</button>
                  <button onClick={publishBlog} disabled={publishStatus === "loading"} className="btn-publish">
                    {publishStatus === "loading"
                      ? <><Loader size={14} className="animate-spin" /> {publishMsg || "Publishing…"}</>
                      : <><Send size={14} /> {isEditMode ? "Update Blog on GitHub" : "Publish to GitHub"}</>
                    }
                  </button>
                  {publishStatus === "success" && (
                    <div className="flex items-center gap-2 text-[#1B9A63] bg-[#E9FFF3] border border-green-200 rounded-lg px-3 py-2 text-xs font-medium">
                      <CheckCircle size={13} /> {publishMsg}
                    </div>
                  )}
                  {publishStatus === "error" && (
                    <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs font-medium">
                      <AlertCircle size={13} className="mt-0.5 shrink-0" /> {publishMsg}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">{user?.email}</span>
                    <button onClick={logout} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-500 transition-colors">
                      <LogOut size={10} /> Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add block */}
            <div className="px-5 py-4 border-b border-slate-100">
              <button onClick={() => { setShowAddMenu((v) => !v); setInsertAfterIdx(null); }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg font-semibold text-sm text-white hover:opacity-90 transition-all shadow-sm"
                style={{ background: "#1A614F" }}>
                <span className="flex items-center gap-2"><Plus size={15} /> Add Content Block</span>
                {showAddMenu ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showAddMenu && (
                <div className="mt-3 grid grid-cols-4 gap-1.5">
                  {ELEMENT_TYPES.map(({ type, icon: Icon, label }) => (
                    <button key={type} onClick={() => addElement(type)} className="chip">
                      <Icon size={12} /><span className="leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {renderEditor()}
          </div>
        )}

        {/* ─── CANVAS ─────────────────────────────────────── */}
        <div className="bg-white overflow-y-auto" onClick={() => !previewMode && setSelectedId(null)}>
          {previewMode && (
            <div className="preview-topbar">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#E3A600" }} />
                <span className="text-white font-bold text-sm">
                  {isEditMode ? "Edit Preview" : "Live Preview"} — BlogDetail Layout
                </span>
              </div>
              <button onClick={() => setPreviewMode(false)}
                className="flex items-center gap-2 bg-white/15 border border-white/25 text-white px-4 py-1.5 rounded-lg hover:bg-white/25 transition-all text-xs font-semibold">
                <EyeOff size={13} /> Back to Editor
              </button>
            </div>
          )}

          <section className="w-full bg-white" style={{ fontFamily: "'Urbanist', sans-serif" }}>
            <div className="relative">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-6 sm:py-10 flex overflow-x-hidden">

                {/* Social sidebar */}
                <div className="hidden lg:block w-[80px] mr-6">
                  <div className="sticky top-64 flex flex-col gap-4">
                    {[
                      { Icon: Facebook,      hover: "hover:bg-[#1877F2]", href: "https://www.facebook.com/profile.php?id=61585877764871" },
                      { Icon: MessageCircle, hover: "hover:bg-[#25D366]", href: "https://wa.me/918660200662" },
                      { Icon: Instagram,     hover: "hover:bg-[#E1306C]", href: "https://www.instagram.com/novaranatureestates/" },
                      { Icon: Youtube,       hover: "hover:bg-[#FF0000]", href: "https://www.youtube.com/@NovaraNatureEstates" },
                    ].map(({ Icon, hover, href }, i) => (
                      <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-[#8A8A8A] ${hover} hover:text-white transition`}
                        style={{ background: "#FFF6E6" }}>
                        <Icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Blog content */}
                <div className="flex-1 min-w-0 w-0 max-w-4xl">
                  <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-700 cursor-default">
                    <span className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center">
                      <ChevronLeft className="h-4 w-4" />
                    </span>
                    Back to Blog
                  </span>

                  <div className="mt-4">
                    <span className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold"
                      style={{ background: "#E9FFF3", color: "#1B9A63" }}>
                      {meta.category || "Category"}
                    </span>
                  </div>

                  <h1 className="mt-3 text-[22px] sm:text-[28px] font-bold text-[#111827] leading-tight">
                    {displayTitle || <span className="text-slate-300 italic font-normal text-xl">Your headline appears here…</span>}
                  </h1>

                  <div className="mt-2 text-[12px] text-slate-500 flex items-center gap-3">
                    <span>{meta.author}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{meta.date}</span>
                  </div>

                  <div className="mt-5 rounded-2xl overflow-hidden border border-slate-100 bg-slate-100">
                    {meta.heroImage
                      ? <img src={meta.heroImage} alt={meta.imageAlt || displayTitle || "Blog hero"} className="w-full h-[210px] sm:h-full object-cover" />
                      : <div className="w-full h-[210px] flex flex-col items-center justify-center gap-2 text-slate-400">
                          <ImageIcon size={28} className="opacity-30" />
                          <p className="text-sm">Hero image — upload in ⚙ Settings</p>
                        </div>
                    }
                  </div>

                  <div className="mt-6 space-y-5">
                    {elements.length === 0
                      ? <div className="text-center py-20 text-slate-300">
                          <Type size={48} className="mx-auto mb-3 opacity-40" />
                          <p className="text-slate-400 text-base font-medium">No content blocks yet</p>
                          <p className="text-slate-300 text-sm mt-1">Add blocks using the panel on the left</p>
                        </div>
                      : previewMode
                        ? (() => {
                            const usedH = new Map();
                            return elements.map((el, i) => {
                              let s;
                              if (["h2","h3","h4","h5","h6"].includes(el.type))
                                s = { type: el.type, text: el.text, fontWeight: el.fontWeight };
                              else if (["h2_with_link","h3_with_link","h4_with_link","h5_with_link","h6_with_link"].includes(el.type))
                                s = { type: el.type, textBefore: el.textBefore, linkText: el.linkText, href: el.href, textAfter: el.textAfter, fontWeight: el.fontWeight };
                              else if (el.type === "image")
                                s = { type: "image", src: el.src, caption: el.caption };
                              else if (el.type === "p_with_link")
                                s = { type: "p_with_link", textBefore: el.textBefore, linkText: el.linkText, href: el.href, textAfter: el.textAfter, fontWeight: el.fontWeight };
                              else if (el.type === "p_with_bold")
                                s = { type: "p_with_bold", parts: el.parts, fontWeight: el.fontWeight };
                              else if (el.type === "p_with_link_bold")
                                s = { type: "p_with_link_bold", partsBefore: el.partsBefore, linkText: el.linkText, href: el.href, partsAfter: el.partsAfter, fontWeight: el.fontWeight };
                              else if (el.type === "table")
                                s = { type: "table", headers: el.headers, rows: el.rows, themed: el.themed };
                              else if (el.type === "ul" || el.type === "ol")
                                s = { type: el.type, text: el.text };
                              else
                                s = { type: el.type, text: el.text, fontWeight: el.fontWeight };
                              return <PreviewSection key={i} s={s} usedH3={usedH} />;
                            });
                          })()
                        : elements.map((el, idx) => renderBuilder(el, idx))
                    }
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════════════════
export default function NovaraBlogBuilder() {
  const { isAuthenticated, loading } = useAuth();
  const [screen, setScreen] = useState("picker");
  const [editingBlog, setEditingBlog] = useState(null);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader size={28} className="animate-spin" style={{ color: "#1A614F" }} />
          <span className="text-sm">Verifying session…</span>
        </div>
      </div>
    );

  if (!isAuthenticated) return <LoginScreen />;

  if (screen === "picker")
    return (
      <BlogPicker
        onSelect={(blog) => {
          setEditingBlog(blog);
          setScreen("editor");
        }}
      />
    );

  return (
    <BlogEditor
      editingBlog={editingBlog}
      onBack={() => { setScreen("picker"); setEditingBlog(null); }}
    />
  );
}
