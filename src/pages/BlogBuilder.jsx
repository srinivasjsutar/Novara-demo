import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Bold, Italic, Underline, Link as LinkIcon, Unlink, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Image as ImageIcon,
  Palette, ChevronDown, Eye, EyeOff, Home, FileText, Image as MediaIcon,
  Leaf, LogIn, LogOut, Loader, AlertCircle, CheckCircle, Send, Search,
  Edit3, ArrowLeft, Plus, Upload, Settings, Calendar, Globe,
  CircleDot, ChevronsUpDown, Code2, ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BLOGS } from "../data/blogs";
import { SCHEMA_DEFS, initSchemas, normalizeSchemas, schemaGraphToString, parseJsonLd, extractToData } from "../utils/schema";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://novara-backend-one.vercel.app";

const SITE_BASE = "https://www.novaranatureestates.com/blog/";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const slugify = (str = "") =>
  str.toLowerCase().trim()
    .replace(/[""''"`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// Extracts YouTube video ID from any standard YouTube URL format
const getYouTubeId = (url = "") => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
};

const escapeHtml = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

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

// ─── sections[]  →  editor HTML ───────────────────────────────────────────────
// Rebuilds the rich-text HTML shown inside the content box from a saved blog.
const partsToHtml = (parts = []) =>
  parts.map((p) => (p.bold ? `<strong>${escapeHtml(p.text)}</strong>` : escapeHtml(p.text))).join("");

const sectionsToHtml = (sections = []) =>
  sections.map((s) => {
    if (["h1","h2","h3","h4","h5","h6"].includes(s.type))
      return `<${s.type}>${escapeHtml(s.text || "")}</${s.type}>`;

    if (["h1_with_link","h2_with_link","h3_with_link","h4_with_link","h5_with_link","h6_with_link"].includes(s.type)) {
      const tag = s.type.replace("_with_link", "");
      return `<${tag}>${escapeHtml(s.textBefore || "")} <a href="${escapeHtml(s.href || "#")}" style="color:#E3A600">${escapeHtml(s.linkText || "")}</a> ${escapeHtml(s.textAfter || "")}</${tag}>`;
    }

    if (s.type === "p")
      return `<p>${s.text || ""}</p>`; // text may already contain inline HTML

    if (s.type === "p_with_bold")
      return `<p>${partsToHtml(s.parts)}</p>`;

    if (s.type === "p_with_link")
      return `<p>${escapeHtml(s.textBefore || "")} <a href="${escapeHtml(s.href || "#")}" style="color:#E3A600">${escapeHtml(s.linkText || "")}</a> ${escapeHtml(s.textAfter || "")}</p>`;

    if (s.type === "p_with_link_bold")
      return `<p>${partsToHtml(s.partsBefore)} <a href="${escapeHtml(s.href || "#")}" style="color:#E3A600">${escapeHtml(s.linkText || "")}</a> ${partsToHtml(s.partsAfter)}</p>`;

    if (s.type === "quote")
      return `<blockquote>${escapeHtml(s.text || "")}</blockquote>`;

    if (s.type === "ul")
      return `<ul>${(s.text || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;

    if (s.type === "ol")
      return `<ol>${(s.text || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ol>`;

    if (s.type === "image")
      return `<figure${s.videoUrl ? ` data-video-url="${escapeHtml(s.videoUrl)}"` : ""}><img src="${escapeHtml(s.src || "")}" alt="${escapeHtml(s.caption || "")}" />${s.caption ? `<figcaption>${escapeHtml(s.caption)}</figcaption>` : ""}</figure>`;

    if (s.type === "table") {
      const head = `<thead><tr>${(s.headers || []).map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>`;
      const body = `<tbody>${(s.rows || []).map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
      return `<table data-themed="${s.themed ? "1" : "0"}">${head}${body}</table>`;
    }

    return `<p>${escapeHtml(s.text || "")}</p>`;
  }).join("");

// ─── editor HTML  →  sections[] ───────────────────────────────────────────────
// Parses what the user typed back into the section schema the live site renders.
const htmlToSections = (html = "") => {
  if (typeof document === "undefined") return [];
  const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, "text/html");
  const root = doc.getElementById("root");
  const out = [];

  const hasRealText = (el) => (el.textContent || "").replace(/\u00a0/g, " ").trim().length > 0;

  root.childNodes.forEach((node) => {
    // raw text node → paragraph
    if (node.nodeType === 3) {
      const t = node.textContent.trim();
      if (t) out.push({ type: "p", text: t, fontWeight: "font-normal" });
      return;
    }
    if (node.nodeType !== 1) return;

    const tag = node.tagName.toLowerCase();
    const img = node.querySelector ? node.querySelector("img") : null;

    if (/^h[1-6]$/.test(tag)) {
      if (hasRealText(node)) out.push({ type: tag, text: node.textContent.trim(), fontWeight: "font-bold" });
      return;
    }
    if (tag === "ul" || tag === "ol") {
      const items = Array.from(node.querySelectorAll(":scope > li")).map((li) => li.textContent.trim()).filter(Boolean);
      if (items.length) out.push({ type: tag, text: items });
      return;
    }
    if (tag === "blockquote") {
      if (hasRealText(node)) out.push({ type: "quote", text: node.textContent.trim() });
      return;
    }
    if (tag === "figure" || tag === "img" || (img && !hasRealText(node))) {
      const imgEl = tag === "img" ? node : img;
      const src = imgEl?.getAttribute("src") || "";
      const alt = imgEl?.getAttribute("alt") || "";
      const title = imgEl?.getAttribute("title") || "";
      const cap = node.querySelector ? (node.querySelector("figcaption")?.textContent.trim() || "") : "";
      const videoUrl = (tag === "figure" ? node.getAttribute("data-video-url") : null) || "";
      if (src) out.push({ type: "image", src, alt, title, caption: cap, videoUrl });
      return;
    }
    if (tag === "table") {
      const headers = Array.from(node.querySelectorAll("thead th, thead td")).map((c) => c.textContent.trim());
      const bodyRows = Array.from(node.querySelectorAll("tbody tr"));
      const rowSource = bodyRows.length ? bodyRows : Array.from(node.querySelectorAll("tr")).slice(headers.length ? 1 : 0);
      const rows = rowSource.map((tr) => Array.from(tr.querySelectorAll("td,th")).map((c) => c.textContent.trim()));
      out.push({ type: "table", headers, rows, themed: node.getAttribute("data-themed") === "1" });
      return;
    }
    // p / div / anything else with content → paragraph (keeps inline HTML)
    if (hasRealText(node) || img) {
      if (img && !hasRealText(node)) {
        out.push({ type: "image", src: img.getAttribute("src") || "", caption: "" });
      } else {
        out.push({ type: "p", text: node.innerHTML.trim(), fontWeight: "font-normal" });
      }
    }
  });

  return out;
};

// ─── Preview renderer (mirrors BlogDetails) ───────────────────────────────────
function PreviewSection({ s, usedH3, onPlayVideo }) {
  if (["h1","h2","h3","h4","h5","h6"].includes(s.type)) {
    const base = slugify(s.text || "");
    const count = (usedH3.get(base) || 0) + 1; usedH3.set(base, count);
    const id = count === 1 ? base : `${base}-${count}`;
    const size = {
      h1: "text-[24px] sm:text-[30px]", h2: "text-[20px] sm:text-[24px]", h3: "text-[16px] sm:text-[18px]",
      h4: "text-[15px] sm:text-[16px]", h5: "text-[13px] sm:text-[14px]", h6: "text-[12px] sm:text-[13px]",
    }[s.type];
    return React.createElement(s.type, { id, className: `scroll-mt-28 ${size} font-bold text-[#111827]` }, s.text);
  }
  if (s.type === "quote")
    return <div className="rounded-xl border border-[#F2E6C9] bg-[#FFF8E8] px-4 py-4 text-[14px] text-slate-700"><div className="border-l-4 border-[#E3A600] pl-3 italic leading-relaxed">{s.text}</div></div>;
  if (s.type === "image")
    return (
      <figure className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative group">
        {s.src ? (
          <div className="relative">
            <img
              src={s.src}
              alt={s.alt || s.caption || ""}
              title={s.title || undefined}
              className="w-full h-auto"
            />
            {s.videoUrl && getYouTubeId(s.videoUrl) && (
              <button
                type="button"
                onClick={() => onPlayVideo && onPlayVideo(s.videoUrl)}
                className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/35 transition-colors"
                aria-label="Play video"
              >
                <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <svg viewBox="0 0 24 24" fill="#E3A600" width="26" height="26"><path d="M8 5v14l11-7z" /></svg>
                </span>
              </button>
            )}
          </div>
        ) : null}
        {s.caption && <figcaption className="px-4 py-3 text-[12px] text-slate-500">{s.caption}</figcaption>}
      </figure>
    );
  if (s.type === "ul")
    return <ul className="list-disc list-outside pl-5 space-y-2 text-[14px] text-slate-600">{(s.text || []).map((i, k) => <li key={k}>{i}</li>)}</ul>;
  if (s.type === "ol")
    return <ol className="list-decimal list-outside pl-5 space-y-2 text-[14px] text-slate-600">{(s.text || []).map((i, k) => <li key={k}>{i}</li>)}</ol>;
  if (s.type === "table")
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-[14px] text-slate-700 border-collapse">
          <thead><tr>{(s.headers || []).map((h, i) => <th key={i} className="text-left px-4 py-3 font-bold border border-slate-200" style={{ background: s.themed ? "#e8dfa8" : "#fff" }}>{h}</th>)}</tr></thead>
          <tbody>{(s.rows || []).map((r, ri) => <tr key={ri} style={{ background: s.themed ? (ri % 2 ? "#f5f0d8" : "#faf7ec") : "#fff" }}>{r.map((c, ci) => <td key={ci} className="px-4 py-2.5 border border-slate-200">{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  return <p className="text-[14px] leading-relaxed text-slate-600" dangerouslySetInnerHTML={{ __html: s.text }} />;
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
    if (!form.email || !form.password) { setError("Enter your email and password to continue."); return; }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (!result.success) setError(result.message || "Login failed. Check your credentials.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ fontFamily: "'Urbanist', sans-serif", background: "#F4F1E8" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap');`}</style>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-4" style={{ background: "linear-gradient(135deg,#1A614F,#0d3d30)" }}>
            <Leaf size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827]">Novara Blog Builder</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to create &amp; edit blogs</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-7">
          {error && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm mb-5">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email address</label>
              <input type="email" value={form.email} placeholder="blogger@gmail.com" autoFocus
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A614F]/30 focus:border-[#1A614F]" />
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Password</label>
              <input type="password" value={form.password} placeholder="••••••••"
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A614F]/30 focus:border-[#1A614F]" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-60 shadow-md hover:shadow-lg"
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
  const filtered = BLOGS.filter((b) =>
    b.headline?.toLowerCase().includes(query.toLowerCase()) ||
    b.title?.toLowerCase().includes(query.toLowerCase()) ||
    b.slug?.toLowerCase().includes(query.toLowerCase()) ||
    b.category?.toLowerCase().includes(query.toLowerCase()),
  );

  const pickerNavItems = [
    { id: "home",      label: "Home",      Icon: Home,       active: false, onClick: () => onSelect(null) },
    { id: "blog",      label: "Blogs",     Icon: FileText,   active: true,  onClick: () => {} },
    { id: "media",     label: "Media",     Icon: MediaIcon,  active: false, onClick: () => onSelect(null) },
    { id: "redirects", label: "Redirects", Icon: ArrowRight, active: false, onClick: () => onSelect(null) },
  ];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Urbanist', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-[184px] shrink-0 flex flex-col text-[#EAF4EF]" style={{ background: "linear-gradient(180deg,#1A614F 0%,#10463782 60%,#0d3d30 100%)" }}>
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md" style={{ background: "#E3A600" }}><Leaf size={16} className="text-[#15302A]" /></div>
          <div className="leading-tight">
            <div className="text-[15px] font-extrabold tracking-tight text-white">Novara</div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#E3A600]">Nature Estates</div>
          </div>
        </div>
        <nav className="py-3 px-2.5 flex-1 space-y-1">
          {pickerNavItems.map(({ id, label, Icon, active, onClick }) => (
            <button key={id} onClick={onClick}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-xl transition-all"
              style={active
                ? { background: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: 700, boxShadow: "inset 3px 0 0 #E3A600" }
                : { color: "#CADFD5" }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="text-[11px] text-[#9FC1B5] truncate mb-1.5">{user?.email}</div>
          <button onClick={logout} className="flex items-center gap-1.5 text-[12px] text-[#CADFD5] hover:text-white transition-colors">
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col" style={{ background: "#F4F1E8" }}>
        {/* top bar */}
        <div className="h-16 bg-white border-b border-[#ECE6D6] flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-[19px] font-extrabold text-[#15302A] tracking-tight">Blog Builder</h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "#E9FFF3", color: "#1B9A63" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#1B9A63]" />{user?.email || "Logged in"}
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full px-6 py-10">
          <h2 className="text-2xl font-bold text-[#111827] mb-2">What would you like to do?</h2>
          <p className="text-sm text-slate-500 mb-8">Create a new blog post, or open an existing one to edit.</p>
          <button onClick={() => onSelect(null)}
            className="w-full mb-8 flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-[#1A614F]/30 bg-[#F0FDF4] hover:border-[#1A614F] hover:bg-[#E9FFF3] transition-all group text-left">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg,#1A614F,#0d3d30)" }}>
              <Plus size={22} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-[#1A614F] text-base">Create new blog</div>
              <div className="text-sm text-slate-500 mt-0.5">Start fresh with a blank post</div>
            </div>
          </button>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Edit existing ({BLOGS.length} blogs)</h3>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search blogs…"
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#1A614F] w-44" />
            </div>
          </div>
          <div className="space-y-2">
            {filtered.map((blog) => (
              <button key={blog.id} onClick={() => onSelect(blog)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-[#E3A600] hover:shadow-md transition-all group text-left">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100">
                  {blog.heroImage || blog.image
                    ? <img src={blog.heroImage || blog.image} alt={blog.headline || blog.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} className="text-slate-300" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 text-sm group-hover:text-[#1A614F]" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{blog.headline || blog.title}</div>
                  <div className="text-[11px] text-[#1A614F] font-mono truncate mt-0.5 opacity-70 group-hover:opacity-100">https://www.novaranatureestates.com/blog/{blog.slug}</div>
                </div>
                <Edit3 size={14} className="text-slate-300 group-hover:text-[#E3A600] flex-shrink-0" />
              </button>
            ))}
            {filtered.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">No blogs match "{query}"</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TOOLBAR
// ═════════════════════════════════════════════════════════════════════════════
const SWATCHES = ["#111827", "#1A614F", "#E3A600", "#1A614F", "#b32d2e", "#6b7280", "#ffffff"];

function ToolbarButton({ title, onClick, active, children }) {
  return (
    <button type="button" title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`nv-toolbtn ${active ? "active" : ""}`}>
      {children}
    </button>
  );
}

function Toolbar({ exec, onLink, onUnlink, onImage, format, setFormat, color, setColor, imageUploading }) {
  const [colorOpen, setColorOpen] = useState(false);
  const sep = <span className="mx-0.5 w-px self-stretch my-1 bg-[#E6E1D3]" />;

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[#F0EBDD] bg-[#FCFBF6] rounded-t-[18px]">
      {/* Format / Paragraph + H1–H6 */}
      <div className="relative">
        <select
          value={format}
          onChange={(e) => { setFormat(e.target.value); }}
          className="h-9 pl-3 pr-8 text-[13px] font-medium text-[#2F4A40] bg-white border border-[#E2DCCB] rounded-[9px] appearance-none cursor-pointer focus:outline-none focus:border-[#1A614F]"
          style={{ minWidth: 124 }}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#2F4A40]" />
      </div>
      {sep}

      <ToolbarButton title="Bold (Ctrl+B)" onClick={() => exec("bold")}><Bold size={16} /></ToolbarButton>
      <ToolbarButton title="Italic (Ctrl+I)" onClick={() => exec("italic")}><Italic size={16} /></ToolbarButton>
      <ToolbarButton title="Underline (Ctrl+U)" onClick={() => exec("underline")}><Underline size={16} /></ToolbarButton>
      {sep}

      <ToolbarButton title="Bulleted list" onClick={() => exec("insertUnorderedList")}><List size={16} /></ToolbarButton>
      <ToolbarButton title="Numbered list" onClick={() => exec("insertOrderedList")}><ListOrdered size={16} /></ToolbarButton>
      {sep}

      <ToolbarButton title="Align left" onClick={() => exec("justifyLeft")}><AlignLeft size={16} /></ToolbarButton>
      <ToolbarButton title="Align center" onClick={() => exec("justifyCenter")}><AlignCenter size={16} /></ToolbarButton>
      <ToolbarButton title="Align right" onClick={() => exec("justifyRight")}><AlignRight size={16} /></ToolbarButton>
      <ToolbarButton title="Justify" onClick={() => exec("justifyFull")}><AlignJustify size={16} /></ToolbarButton>
      {sep}

      <ToolbarButton title="Insert link" onClick={onLink}><LinkIcon size={16} /></ToolbarButton>
      <ToolbarButton title="Remove link" onClick={onUnlink}><Unlink size={16} /></ToolbarButton>
      {sep}

      {/* Text color */}
      <div className="relative">
        <ToolbarButton title="Text color" onClick={() => setColorOpen((v) => !v)}>
          <span className="flex flex-col items-center leading-none">
            <Palette size={15} />
            <span className="w-4 h-[3px] mt-[2px] rounded-sm" style={{ background: color }} />
          </span>
        </ToolbarButton>
        {colorOpen && (
          <div className="absolute z-30 mt-1 p-2 bg-white border border-[#DDD7C7] rounded-md shadow-lg" onMouseDown={(e) => e.preventDefault()}>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {SWATCHES.map((c) => (
                <button key={c} type="button" title={c}
                  onClick={() => { setColor(c); exec("foreColor", c); setColorOpen(false); }}
                  className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform" style={{ background: c }} />
              ))}
            </div>
            <input type="color" value={color}
              onChange={(e) => { setColor(e.target.value); exec("foreColor", e.target.value); }}
              className="w-full h-7 cursor-pointer rounded border border-slate-200" />
          </div>
        )}
      </div>
      {sep}

      <ToolbarButton title="Insert image" onClick={onImage}>
        {imageUploading ? <Loader size={16} className="animate-spin" /> : <ImageIcon size={16} />}
      </ToolbarButton>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOG EDITOR  (WordPress-style)
// ═════════════════════════════════════════════════════════════════════════════
function BlogEditor({ editingBlog, onBack }) {
  const { user, logout } = useAuth();
  const isEditMode = !!editingBlog;

  const bodyRef = useRef(null);
  const fileInputRef = useRef(null);          // content image
  const heroInputRef = useRef(null);          // featured image
  const savedSelection = useRef(null);

  const [format, setFormat] = useState("p");
  const [color, setColor] = useState("#111827");
  const [imageUploading, setImageUploading] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroPreview, setHeroPreview] = useState("");

  const [previewMode, setPreviewMode] = useState(false);
  const [activeNav, setActiveNav] = useState("blog");
  const [showSettings, setShowSettings] = useState(true);
  const [showDrafts, setShowDrafts] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [showSchema, setShowSchema] = useState(true);
  const [showJsonLd, setShowJsonLd] = useState(false);
  const [schemas, setSchemas] = useState(() => initSchemas());
  const [imageVideoPopup, setImageVideoPopup] = useState(null); // { videoUrl } for content image lightbox
  const [pendingImageUrl, setPendingImageUrl] = useState(null); // url of just-uploaded content image awaiting meta
  const [contentImageMeta, setContentImageMeta] = useState({ alt: "", title: "", caption: "", description: "", videoUrl: "" });
  const [bodySnapshot, setBodySnapshot] = useState(""); // snapshot of editor HTML for preview

  const [publishStatus, setPublishStatus] = useState(null);
  const [publishMsg, setPublishMsg] = useState("");

  const [drafts, setDrafts] = useState([]);
  const [currentDraftKey, setCurrentDraftKey] = useState(null);

  const [meta, setMeta] = useState({
    title: "", description: "", keywords: "", slug: "",
    category: "Managed Farmland", author: "Novara Nature Estates",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    heroImage: "", imageAlt: "", imageTitle: "", imageCaption: "", imageDescription: "", videoUrl: "", tags: "",
  });

  const editingBlogId = useRef(editingBlog?.id ?? null);
  const editingBlogOriginalSlug = useRef(editingBlog?.slug ?? "");
  const initialHtml = useRef("");

  // Build initial body + meta from the blog being edited
  if (initialHtml.current === "" && editingBlog) {
    initialHtml.current = sectionsToHtml(editingBlog.sections || []);
  }

  useEffect(() => { loadDrafts(); }, []);

  useEffect(() => {
    if (!editingBlog) return;
    editingBlogId.current = editingBlog.id;
    editingBlogOriginalSlug.current = editingBlog.slug || "";
    setMeta({
      title:            editingBlog.headline       || editingBlog.title || "",
      description:      editingBlog.description    || "",
      keywords:         editingBlog.keywords       || "",
      slug:             editingBlog.slug           || "",
      category:         editingBlog.category       || "Managed Farmland",
      author:           editingBlog.author         || "Novara Nature Estates",
      date:             editingBlog.date           || "",
      heroImage:        editingBlog.heroImage      || editingBlog.image || "",
      imageAlt:         editingBlog.imageAlt       || editingBlog.title || "",
      imageTitle:       editingBlog.imageTitle     || "",
      imageCaption:     editingBlog.imageCaption   || "",
      imageDescription: editingBlog.imageDescription || "",
      videoUrl:         editingBlog.videoUrl         || "",
      tags:             (editingBlog.tags || []).join(", "),
    });
    setSchemas(normalizeSchemas(editingBlog.schemas));
    // Seed the image→video map from existing sections
    (editingBlog.sections || []).forEach((s) => {
      if (s.type === "image" && s.src && s.videoUrl) {
        imageVideoMapRef.current[s.src] = s.videoUrl;
      }
    });
    const html = sectionsToHtml(editingBlog.sections || []);
    if (bodyRef.current) bodyRef.current.innerHTML = html;
  }, [editingBlog]);

  // ── Rich-text commands ──────────────────────────────────────────────────────
  const focusBody = () => { if (bodyRef.current) bodyRef.current.focus(); };

  // The toolbar controls (especially the native <select>) steal focus from the
  // editor, which collapses/loses the caret — so execCommand would then run
  // against nothing (headings wouldn't stick, unlink would have no target).
  // We continuously remember the last caret/selection that was inside the
  // editor and restore it right before running any command.
  const selectionInsideBody = (range) =>
    bodyRef.current && range && bodyRef.current.contains(range.commonAncestorContainer);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const r = sel.getRangeAt(0);
      if (selectionInsideBody(r)) savedSelection.current = r.cloneRange();
    }
  };
  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedSelection.current && sel) {
      try { sel.removeAllRanges(); sel.addRange(savedSelection.current); } catch (_) {}
    }
  };

  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount && selectionInsideBody(sel.getRangeAt(0))) {
        savedSelection.current = sel.getRangeAt(0).cloneRange();
      }
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  const exec = useCallback((cmd, value = null) => {
    focusBody();
    restoreSelection();
    try { document.execCommand("styleWithCSS", false, true); } catch (_) {}
    document.execCommand(cmd, false, value);
    saveSelection();
    syncFormatState();
  }, []);

  const syncFormatState = () => {
    try {
      const block = (document.queryCommandValue("formatBlock") || "p").toLowerCase();
      setFormat(/^h[1-6]$/.test(block) ? block : "p");
    } catch (_) {}
  };

  // Guarantee the editor's text always lives inside a block element. Typing into
  // a brand-new (empty) contentEditable produces a bare text node with no block
  // wrapper, and formatBlock can't turn a bare text node into a heading — it
  // wipes it and the format never sticks. Seeding a <p> (and making Enter create
  // <p>) keeps headings working.
  const ensureEditable = () => {
    const el = bodyRef.current;
    if (!el) return;
    try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch (_) {}
    const html = el.innerHTML.trim();
    if (html === "" || html === "<br>") {
      el.innerHTML = "<p><br></p>";
      const sel = window.getSelection();
      const r = document.createRange();
      r.selectNodeContents(el.firstChild);
      r.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r);
      savedSelection.current = r.cloneRange();
    }
  };

  const onEditorFocus = () => { ensureEditable(); };

  const handleFormatChange = (val) => {
    setFormat(val);
    const el = bodyRef.current;
    if (!el) return;
    el.focus();
    ensureEditable();

    // Pick the block to convert from the live selection, falling back to the
    // last caret we saved while the editor had focus.
    const sel = window.getSelection();
    let range = (sel && sel.rangeCount && selectionInsideBody(sel.getRangeAt(0)))
      ? sel.getRangeAt(0)
      : savedSelection.current;
    if (!range) return;

    // Find the top-level block (direct child of the editor) holding the caret.
    let block = range.startContainer;
    block = block.nodeType === 1 ? block : block.parentElement;
    while (block && block.parentElement !== el) block = block.parentElement;
    if (!block || block.parentElement !== el) {
      document.execCommand("formatBlock", false, val.toUpperCase());
      syncFormatState();
      return;
    }

    // Convert by swapping the tag directly — deterministic, immune to the
    // focus/selection juggling that execCommand("formatBlock") depends on.
    const newEl = document.createElement(val);
    while (block.firstChild) newEl.appendChild(block.firstChild);
    if (!newEl.firstChild) newEl.appendChild(document.createElement("br"));
    block.replaceWith(newEl);

    // keep the caret at the end of the converted block so typing continues in it
    const r = document.createRange();
    r.selectNodeContents(newEl);
    r.collapse(false);
    if (sel) { sel.removeAllRanges(); sel.addRange(r); }
    savedSelection.current = r.cloneRange();
    syncFormatState();
  };

  const onLink = () => {
    focusBody();
    restoreSelection();
    const url = window.prompt("Enter the URL (https://…)");
    if (!url) return;
    restoreSelection(); // the prompt dialog drops the selection — put it back
    document.execCommand("createLink", false, url);
    if (bodyRef.current) {
      bodyRef.current.querySelectorAll("a:not([data-styled])").forEach((a) => {
        a.style.color = "#E3A600";
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
        a.setAttribute("data-styled", "1");
      });
    }
    saveSelection();
  };

  const onUnlink = () => {
    focusBody();
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      // If the caret is just inside a link (nothing highlighted), select the
      // whole <a> first so execCommand("unlink") has something to remove.
      let node = sel.anchorNode;
      let a = node ? (node.nodeType === 1 ? node : node.parentElement) : null;
      while (a && a !== bodyRef.current && a.tagName !== "A") a = a.parentElement;
      if (a && a.tagName === "A") {
        const range = document.createRange();
        range.selectNode(a);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    document.execCommand("unlink");
    saveSelection();
    syncFormatState();
  };

  // ── Image insert (content) ──────────────────────────────────────────────────
  const onImageClick = () => {
    // remember caret so the image lands where the user was typing
    const sel = window.getSelection();
    if (sel && sel.rangeCount) savedSelection.current = sel.getRangeAt(0).cloneRange();
    fileInputRef.current?.click();
  };

  const imageVideoMapRef = useRef({}); // maps imageUrl → youTubeUrl

  const handleContentImage = async (file) => {
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await compressAndUpload(file, { maxW: 1200, quality: 0.8 });
      // Show meta panel instead of window.prompt
      setPendingImageUrl(url);
      setContentImageMeta({ alt: "", title: "", caption: "", description: "", videoUrl: "" });
    } catch (e) { alert("Image upload failed: " + e.message); }
    finally { setImageUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const insertContentImage = () => {
    if (!pendingImageUrl) return;
    const { alt, title, caption, videoUrl } = contentImageMeta;
    const ytId = getYouTubeId(videoUrl);
    if (ytId) imageVideoMapRef.current[pendingImageUrl] = videoUrl;

    // Build the figure element directly in the DOM — more reliable than execCommand
    const figure = document.createElement("figure");
    if (videoUrl) figure.setAttribute("data-video-url", videoUrl);
    const img = document.createElement("img");
    img.src = pendingImageUrl;
    img.alt = alt || "";
    if (title) img.title = title;
    figure.appendChild(img);
    if (caption) {
      const figcap = document.createElement("figcaption");
      figcap.textContent = caption;
      figure.appendChild(figcap);
    }
    const spacer = document.createElement("p");
    spacer.innerHTML = "<br/>";

    const body = bodyRef.current;
    if (!body) return;

    // Try to insert at saved caret position; fallback to appending at end
    const sel = window.getSelection();
    let inserted = false;
    if (savedSelection.current) {
      try {
        body.focus();
        sel.removeAllRanges();
        sel.addRange(savedSelection.current);
        const range = sel.getRangeAt(0);
        range.deleteContents();
        // Insert spacer first so caret lands after the figure
        range.insertNode(spacer);
        range.insertNode(figure);
        // Move caret after the spacer
        const newRange = document.createRange();
        newRange.setStartAfter(spacer);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        inserted = true;
      } catch (_) {}
    }
    if (!inserted) {
      body.appendChild(figure);
      body.appendChild(spacer);
    }

    setPendingImageUrl(null);
    setContentImageMeta({ alt: "", title: "", caption: "", description: "", videoUrl: "" });
    // Snapshot immediately — direct DOM read is synchronous
    if (bodyRef.current) setBodySnapshot(bodyRef.current.innerHTML);
  };

  const cancelContentImage = () => {
    setPendingImageUrl(null);
    setContentImageMeta({ alt: "", title: "", caption: "", description: "", videoUrl: "" });
  };

  const handleHeroImage = async (file) => {
    if (!file) return;
    // instant local thumbnail while the upload runs
    let localPreview = "";
    try { localPreview = URL.createObjectURL(file); setHeroPreview(localPreview); } catch (_) {}
    setHeroUploading(true);
    try {
      const url = await compressAndUpload(file, { maxW: 1400, quality: 0.82 });
      setMeta((p) => ({ ...p, heroImage: url }));
    } catch (e) { alert("Featured image upload failed: " + e.message); }
    finally {
      setHeroUploading(false);
      setHeroPreview("");
      if (localPreview) { try { URL.revokeObjectURL(localPreview); } catch (_) {} }
      if (heroInputRef.current) heroInputRef.current.value = "";
    }
  };

  // ── Export / publish ──────────────────────────────────────────────────────
  const exportBlogData = () => {
    const html = bodyRef.current ? bodyRef.current.innerHTML : initialHtml.current;
    const rawSections = htmlToSections(html);
    // Attach stored YouTube URLs to image sections before publishing
    const sections = rawSections.map((s) =>
      s.type === "image" && s.src && imageVideoMapRef.current[s.src]
        ? { ...s, videoUrl: imageVideoMapRef.current[s.src] }
        : s
    );
    const title = meta.title;
    const slug  = meta.slug || slugify(title) || `blog-${Date.now()}`;
    const tagsArr = meta.tags ? meta.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    return {
      id:          isEditMode ? editingBlogId.current : Date.now(),
      slug, category: meta.category,
      title: meta.title || title, headline: title,
      description: meta.description, date: meta.date,
      keywords: meta.keywords, author: meta.author,
      image: meta.heroImage, heroImage: meta.heroImage, coverImage: meta.heroImage,
      imageAlt: meta.imageAlt || title,
      imageTitle: meta.imageTitle,
      imageCaption: meta.imageCaption,
      imageDescription: meta.imageDescription,
      videoUrl: meta.videoUrl,
      tags: tagsArr, sections,
      schemas,
    };
  };

  const downloadJSON = () => {
    const d = exportBlogData();
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `blog-${d.slug}.json` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  // ── GitHub publish ──────────────────────────────────────────────────────────
  const GH_TOKEN  = import.meta.env.VITE_GH_TOKEN;
  const GH_REPO   = "rathnabhoomidevelopers-art/Novara";
  const GH_BRANCH = "main";
  const GH_FILE   = "src/data/blogs.js";

  const fetchCurrentFile = async () => {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}?ref=${GH_BRANCH}&t=${Date.now()}`,
      { headers: { Authorization: `token ${GH_TOKEN}`, Accept: "application/vnd.github.v3+json" }, cache: "no-store" });
    if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status} ${res.statusText}`);
    const fileData = await res.json();
    const sha = fileData.sha;
    const binary = atob(fileData.content.replace(/\n/g, ""));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const currentContent = new TextDecoder("utf-8").decode(bytes);
    const stripped = currentContent.replace(/^[\s\S]*?export\s+const\s+BLOGS\s*=\s*/, "").replace(/;?\s*$/, "").trim();
    // eslint-disable-next-line no-new-func
    const blogsArray = new Function(`return ${stripped}`)();
    return { sha, blogsArray };
  };

  const publishBlog = async () => {
    if (!meta.title) { alert("Add a title before publishing."); return; }
    const html = bodyRef.current ? bodyRef.current.innerHTML : "";
    if (!htmlToSections(html).length) { alert("Add some content before publishing."); return; }

    setPublishStatus("loading");
    setPublishMsg("Fetching latest blogs.js…");
    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        setPublishMsg(`Fetching latest version… (${attempt}/${MAX_RETRIES})`);
        const { sha, blogsArray } = await fetchCurrentFile();
        const blogData = exportBlogData();
        let newBlogsArray;

        if (isEditMode) {
          setPublishMsg("Updating existing post…");
          const idx = blogsArray.findIndex((b) =>
            String(b.id) === String(editingBlogId.current) || b.slug === editingBlogOriginalSlug.current);
          if (idx === -1) throw new Error(`Could not find the original post in blogs.js (id "${editingBlogId.current}").`);
          newBlogsArray = [...blogsArray];
          newBlogsArray[idx] = { ...blogData, id: blogsArray[idx].id };
        } else {
          setPublishMsg("Adding new post…");
          const nextId = Math.max(0, ...blogsArray.map((b) => Number(b.id) || 0)) + 1;
          newBlogsArray = [{ ...blogData, id: nextId }, ...blogsArray];
        }

        const entriesStr = newBlogsArray.map((b) => "  " + JSON.stringify(b, null, 2).replace(/\n/g, "\n  ")).join(",\n");
        const newContent = `export const BLOGS = [\n${entriesStr}\n];\n`;

        setPublishMsg("Committing to GitHub…");
        const putRes = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}`, {
          method: "PUT",
          headers: { Authorization: `token ${GH_TOKEN}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
          body: JSON.stringify({
            message: isEditMode ? `update blog: ${blogData.slug}` : `add blog: ${blogData.slug}`,
            content: btoa(unescape(encodeURIComponent(newContent))), sha, branch: GH_BRANCH,
          }),
        });

        if (putRes.status === 409) {
          if (attempt < MAX_RETRIES) { setPublishMsg(`Sync conflict — retrying… (${attempt}/${MAX_RETRIES})`); await new Promise((r) => setTimeout(r, 800 * attempt)); continue; }
          throw new Error("Sync conflict: GitHub rejected the update 3 times. Please try again.");
        }
        if (!putRes.ok) { const err = await putRes.json().catch(() => ({})); throw new Error(err.message || `Commit failed: HTTP ${putRes.status}`); }

        if (isEditMode) editingBlogOriginalSlug.current = blogData.slug;
        setPublishStatus("success");
        setPublishMsg(isEditMode ? "Updated. Vercel will redeploy shortly." : "Published. Vercel will redeploy shortly.");
        return;
      } catch (e) {
        if (attempt === MAX_RETRIES || !e.message?.includes("Sync conflict")) {
          setPublishStatus("error"); setPublishMsg(e.message || "Something went wrong."); return;
        }
      }
    }
  };

  // ── Drafts ──────────────────────────────────────────────────────────────────
  const loadDrafts = () => {
    if (typeof localStorage === "undefined") return;
    setDrafts(Object.keys(localStorage).filter((k) => k.startsWith("draft_")).map((key) => ({ key, data: JSON.parse(localStorage.getItem(key)) })));
  };
  const saveDraft = () => {
    const key = currentDraftKey || `draft_${Date.now()}`;
    const body = bodyRef.current ? bodyRef.current.innerHTML : "";
    localStorage.setItem(key, JSON.stringify({ meta, body, schemas, savedAt: new Date().toISOString() }));
    setCurrentDraftKey(key); loadDrafts();
    setPublishStatus("success"); setPublishMsg("Draft saved.");
  };
  const loadDraft = (key) => {
    const d = JSON.parse(localStorage.getItem(key));
    setMeta(d.meta);
    setSchemas(normalizeSchemas(d.schemas));
    if (bodyRef.current) bodyRef.current.innerHTML = d.body || "";
    setCurrentDraftKey(key); setShowDrafts(false);
    setPublishStatus("success"); setPublishMsg("Draft loaded.");
  };
  const deleteDraft = (key) => { localStorage.removeItem(key); loadDrafts(); };

  // ── Schema config helpers ─────────────────────────────────────────────────
  const setSchemaCfg   = (id, patch) => setSchemas((p) => ({ ...p, [id]: { ...p[id], ...patch } }));
  const setSchemaField = (id, key, val) =>
    setSchemas((p) => ({ ...p, [id]: { ...p[id], data: { ...p[id].data, [key]: val } } }));
  const setSchemaItem  = (id, idx, key, val) =>
    setSchemas((p) => {
      const items = [...(p[id].data.items || [])];
      items[idx] = { ...items[idx], [key]: val };
      return { ...p, [id]: { ...p[id], data: { ...p[id].data, items } } };
    });
  const addSchemaItem = (id, def) =>
    setSchemas((p) => ({ ...p, [id]: { ...p[id], data: { ...p[id].data, items: [...(p[id].data.items || []), def.newItem()] } } }));
  const removeSchemaItem = (id, idx) =>
    setSchemas((p) => ({ ...p, [id]: { ...p[id], data: { ...p[id].data, items: (p[id].data.items || []).filter((_, k) => k !== idx) } } }));

  // Save a pasted (Upload) schema: parse it, fill the Default fields with its
  // values, and switch to Default mode so the blogger can edit field-by-field.
  const [schemaSavedId, setSchemaSavedId] = useState(null);
  const saveUploadedSchema = (def) => {
    const cfg = schemas[def.id];
    const parsed = parseJsonLd(cfg.json);
    const obj = Array.isArray(parsed) ? parsed[0] : parsed;
    if (!obj) return; // invalid JSON — the ⚠ indicator already shows
    const data = extractToData(def.id, obj);
    if (!data) return;
    setSchemaCfg(def.id, { data, mode: "default" });
    setSchemaSavedId(def.id);
    setTimeout(() => setSchemaSavedId((cur) => (cur === def.id ? null : cur)), 2500);
  };

  // Combined JSON-LD preview of every enabled schema
  const jsonLdPreview = useMemo(() => schemaGraphToString(schemas), [schemas]);
  const enabledSchemaCount = useMemo(
    () => Object.values(schemas).filter((s) => s.enabled).length, [schemas]);

  // Flatten an object schema's data into editable leaf rows {path,value} and
  // write a value back by its dot path (so every key shows and stays editable).
  const flattenLeaves = (obj, prefix = "") => {
    let rows = [];
    Object.entries(obj || {}).forEach(([k, v]) => {
      const path = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object" && !Array.isArray(v)) {
        rows = rows.concat(flattenLeaves(v, path));
      } else if (Array.isArray(v)) {
        rows.push({ path, value: JSON.stringify(v) });
      } else {
        rows.push({ path, value: v == null ? "" : String(v) });
      }
    });
    return rows;
  };
  const setSchemaPath = (id, path, value) =>
    setSchemas((p) => {
      const keys = path.split(".");
      const root = { ...(p[id].data || {}) };
      let cur = root;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = (cur[keys[i]] && typeof cur[keys[i]] === "object") ? { ...cur[keys[i]] } : {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return { ...p, [id]: { ...p[id], data: root } };
    });
  const pathLabel = (path) => {
    const parts = path.split(".");
    return { key: parts[parts.length - 1], parent: parts.slice(0, -1).join(" › ") };
  };

  // ── Preview sections ──────────────────────────────────────────────────────
  // Always keep sections computed — preview reads them the moment it opens
  const computeSections = useCallback(() => {
    const html = (bodyRef.current ? bodyRef.current.innerHTML : "") || bodySnapshot;
    const sections = htmlToSections(html);
    return sections.map((s) => {
      if (s.type === "image" && s.src) {
        const storedVideo = imageVideoMapRef.current[s.src];
        return storedVideo ? { ...s, videoUrl: storedVideo } : s;
      }
      return s;
    });
  }, [bodySnapshot]);

  const previewSections = useMemo(() => {
    if (!previewMode) return [];
    return computeSections();
  }, [previewMode, computeSections]);

  // ─────────────────────────────────────────────────────────────────────────
  const navItems = [
    { id: "blog",      label: "Home",      Icon: Home,       onClick: () => setActiveNav("blog") },
    { id: "home",      label: "Blogs",     Icon: FileText,   onClick: onBack },
    { id: "media",     label: "Media",     Icon: MediaIcon,  onClick: () => { setActiveNav("media"); setShowSettings(true); heroInputRef.current?.focus?.(); } },
    { id: "redirects", label: "Redirects", Icon: ArrowRight, onClick: () => setActiveNav("redirects") },
  ];

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Urbanist', sans-serif", background: "#F4F1E8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .nv-root, .nv-root * { font-family:'Urbanist','Poppins',sans-serif; }
        .wp-editor a { color:#E3A600; }
        .wp-editor h1 { font-size:28px; font-weight:800; margin:.6em 0 .3em; color:#15302A; }
        .wp-editor h2 { font-size:23px; font-weight:700; margin:.6em 0 .3em; color:#15302A; }
        .wp-editor h3 { font-size:19px; font-weight:700; margin:.6em 0 .3em; color:#15302A; }
        .wp-editor h4 { font-size:16px; font-weight:700; margin:.6em 0 .3em; color:#15302A; }
        .wp-editor h5 { font-size:14px; font-weight:700; margin:.6em 0 .3em; color:#15302A; }
        .wp-editor h6 { font-size:13px; font-weight:700; margin:.6em 0 .3em; color:#15302A; }
        .wp-editor p { margin:0 0 1em; line-height:1.75; color:#3c4a44; }
        .wp-editor ul { list-style:disc; padding-left:1.6em; margin:0 0 1em; }
        .wp-editor ol { list-style:decimal; padding-left:1.6em; margin:0 0 1em; }
        .wp-editor li { margin:.25em 0; line-height:1.65; color:#3c4a44; }
        .wp-editor blockquote { border-left:4px solid #E3A600; background:#FBF6E9; padding:10px 14px; margin:0 0 1em; font-style:italic; color:#475569; border-radius:10px; }
        .wp-editor figure { margin:0 0 1em; }
        .wp-editor figure img { max-width:100%; height:auto; border-radius:14px; display:block; }
        .wp-editor figcaption { font-size:12px; color:#64748b; padding:6px 2px; }
        .wp-editor table { border-collapse:collapse; width:100%; margin:0 0 1em; }
        .wp-editor th, .wp-editor td { border:1px solid #E6E1D3; padding:8px 12px; text-align:left; }
        .wp-editor:empty:before { content:attr(data-placeholder); color:#9aa39d; }
        .wp-editor:focus { outline:none; }
        input[type="file"] { font-size:12px; color:#5B6B63; border:1.5px dashed #CBBF9E; border-radius:12px; padding:9px 12px; width:100%; background:#FCFBF6; cursor:pointer; }
        .meta-box { background:#fff; border:1px solid #ECE6D6; border-radius:18px; margin-bottom:18px; box-shadow:0 1px 2px rgba(21,48,42,.04), 0 6px 18px rgba(21,48,42,.05); overflow:hidden; }
        .meta-box-head { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid #F0EBDD; }
        .meta-box-title { font-size:14.5px; font-weight:800; color:#1A614F; letter-spacing:-.01em; }
        .wp-primary { background:#1A614F; color:#fff; border:none; padding:9px 18px; border-radius:999px; font-weight:700; font-size:13px; cursor:pointer; transition:all .18s; box-shadow:0 2px 8px rgba(26,97,79,.25); }
        .wp-primary:hover:not(:disabled) { background:#134E3F; transform:translateY(-1px); }
        .wp-primary:disabled { opacity:.55; cursor:not-allowed; }
        .wp-secondary { background:#fff; color:#1A614F; border:1.5px solid #1A614F; padding:7px 14px; border-radius:999px; font-weight:700; font-size:12px; cursor:pointer; transition:all .15s; }
        .wp-secondary:hover { background:#EAF4EF; }
        .wp-button-primary { background:#1A614F; color:#fff; border:none; padding:7px 16px; border-radius:999px; font-weight:700; font-size:12px; cursor:pointer; transition:background .15s; }
        .wp-button-primary:hover:not(:disabled) { background:#134E3F; }
        .wp-link { color:#1A614F; font-size:12px; font-weight:600; cursor:pointer; }
        .wp-link:hover { color:#E3A600; text-decoration:underline; }
        .wp-input { width:100%; padding:9px 12px; font-size:13px; color:#1f2a26; border:1px solid #E2DCCB; border-radius:10px; background:#fff; transition:border-color .15s, box-shadow .15s; }
        .wp-input:focus { outline:none; border-color:#1A614F; box-shadow:0 0 0 3px rgba(26,97,79,.12); }
        .wp-input::placeholder { color:#aab0a8; }
        .nv-toolbtn { height:34px; min-width:34px; padding:0 7px; display:flex; align-items:center; justify-content:center; border-radius:9px; color:#2F4A40; border:1px solid transparent; transition:all .12s; }
        .nv-toolbtn:hover { background:#EAF4EF; }
        .nv-toolbtn.active { background:#1A614F; color:#fff; }
        .row-scroll::-webkit-scrollbar { width:6px; } .row-scroll::-webkit-scrollbar-thumb { background:#cfc8b4; border-radius:4px; }
      `}</style>

      {/* ── PREVIEW OVERLAY ───────────────────────────────────────────── */}
      {previewMode && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto nv-root">
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3" style={{ background: "linear-gradient(90deg,#1A614F,#0d3d30)" }}>
            <div className="flex items-center gap-3 text-white">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#E3A600" }} />
              <span className="font-bold text-sm">Preview — how this post will look</span>
            </div>
            <button onClick={() => setPreviewMode(false)} className="flex items-center gap-2 bg-white/15 border border-white/25 text-white px-4 py-1.5 rounded-lg hover:bg-white/25 text-xs font-semibold">
              <EyeOff size={13} /> Back to editor
            </button>
          </div>
          <article className="max-w-3xl mx-auto px-6 py-10">
            <span className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: "#E9FFF3", color: "#1B9A63" }}>{meta.category}</span>
            <h1 className="mt-3 text-[26px] sm:text-[34px] font-bold text-[#111827] leading-tight">{meta.title || "Untitled post"}</h1>
            <div className="mt-2 text-[13px] text-slate-500 flex items-center gap-3"><span>{meta.author}</span><span className="h-1 w-1 rounded-full bg-slate-300" /><span>{meta.date}</span></div>
            {meta.heroImage && (
              <figure className="mt-5">
                <div className="relative rounded-2xl overflow-hidden border border-slate-100 group">
                  <img src={meta.heroImage} alt={meta.imageAlt} title={meta.imageTitle || undefined} className="w-full object-cover" />
                </div>
                {meta.imageCaption && <figcaption className="mt-2 text-[13px] text-slate-500 text-center">{meta.imageCaption}</figcaption>}
              </figure>
            )}
            <div className="mt-7 space-y-5">
              {(() => {
                const used = new Map();
                return previewSections.map((s, i) => (
                  <PreviewSection key={i} s={s} usedH3={used} onPlayVideo={(url) => setImageVideoPopup({ videoUrl: url })} />
                ));
              })()}
            </div>
          </article>
        </div>
      )}

      {/* ── CONTENT IMAGE VIDEO LIGHTBOX ──────────────────────────── */}
      {imageVideoPopup && (() => {
        const vid = getYouTubeId(imageVideoPopup.videoUrl);
        return (
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setImageVideoPopup(null)}
          >
            <div
              className="relative w-full max-w-3xl mx-4"
              style={{ aspectRatio: "16/9" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setImageVideoPopup(null)}
                className="absolute -top-9 right-0 text-white text-sm font-semibold flex items-center gap-1.5 hover:text-[#E3A600] transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><path d="M18 6L6 18M6 6l12 12"/></svg>
                Close
              </button>
              {vid ? (
                <iframe
                  src={`https://www.youtube.com/embed/${vid}?autoplay=1&rel=0`}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  className="w-full h-full rounded-xl border-0"
                  title="YouTube video"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-[#15302A] flex items-center justify-center text-white text-sm">
                  Invalid YouTube URL — cannot preview.
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <div className="flex min-h-screen nv-root">
        {/* ── LEFT NAV (Novara) ──────────────────────────────── */}
        <aside className="w-[184px] shrink-0 flex flex-col text-[#EAF4EF]" style={{ background: "linear-gradient(180deg,#1A614F 0%,#10463782 60%,#0d3d30 100%)" }}>
          <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md" style={{ background: "#E3A600" }}><Leaf size={16} className="text-[#15302A]" /></div>
            <div className="leading-tight">
              <div className="text-[15px] font-extrabold tracking-tight text-white">Novara</div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#E3A600]">Nature Estates</div>
            </div>
          </div>
          <nav className="py-3 px-2.5 flex-1 space-y-1">
            {navItems.map(({ id, label, Icon, onClick }) => {
              const active = activeNav === id;
              return (
                <button key={id} onClick={onClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-xl transition-all"
                  style={active
                    ? { background: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: 700, boxShadow: "inset 3px 0 0 #E3A600" }
                    : { color: "#CADFD5" }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                  <Icon size={16} /> {label}
                </button>
              );
            })}
          </nav>
          <div className="px-4 py-4 border-t border-white/10">
            <div className="text-[11px] text-[#9FC1B5] truncate mb-1.5">{user?.email}</div>
            <button onClick={logout} className="flex items-center gap-1.5 text-[12px] text-[#CADFD5] hover:text-white transition-colors">
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </aside>

        {/* ── MAIN ────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* top bar */}
          <div className="h-16 bg-white border-b border-[#ECE6D6] flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="w-9 h-9 rounded-xl border border-[#E2DCCB] flex items-center justify-center text-[#1A614F] hover:bg-[#EAF4EF] hover:border-[#1A614F] transition-colors"><ArrowLeft size={16} /></button>
              <h1 className="text-[19px] font-extrabold text-[#15302A] tracking-tight">{isEditMode ? "Edit Post" : "Add New Post"}</h1>
              {isEditMode && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#FBF1D2", color: "#9a6b00" }}>Editing</span>}
            </div>
            <button onClick={() => { if (pendingImageUrl) insertContentImage(); setTimeout(() => { const html = bodyRef.current ? bodyRef.current.innerHTML : ""; setBodySnapshot(html); setPreviewMode(true); }, 20); }} className="wp-secondary flex items-center gap-1.5"><Eye size={13} /> Preview</button>
          </div>

          <div className="flex-1 flex gap-6 px-6 py-7 items-start" style={{ background: "#F7F4EB" }}>
            {/* CONTENT COLUMN */}
            {activeNav === "redirects" ? (
              <div className="flex-1 min-w-0">
                <div className="bg-white border border-[#ECE6D6] rounded-2xl shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ArrowRight size={18} className="text-[#1A614F]" />
                    <h2 className="text-[18px] font-extrabold text-[#15302A]">Redirects</h2>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full ml-1" style={{ background: "#E9FFF3", color: "#1B9A63" }}>{BLOGS.length} blogs</span>
                  </div>
                  <p className="text-[13px] text-[#646970] mb-4">Edit any blog redirect slug. Changes commit directly to <code className="bg-[#F4F1E8] px-1.5 py-0.5 rounded text-[12px]">blogs.js</code> and update everywhere instantly.</p>
                  <RedirectsBox
                    ghToken={GH_TOKEN}
                    ghRepo={GH_REPO}
                    ghBranch={GH_BRANCH}
                    ghFile={GH_FILE}
                    fetchCurrentFile={fetchCurrentFile}
                    inline={true}
                  />
                </div>
              </div>
            ) : (
            <div className="flex-1 min-w-0">
              {/* Title (H1) */}
              <input
                value={meta.title}
                onChange={(e) => setMeta((p) => ({ ...p, slug: (p.slug || ""), title: e.target.value }))}
                placeholder="Add title"
                className="w-full bg-white border border-[#ECE6D6] rounded-2xl px-5 py-4 text-[1.7em] font-extrabold text-[#15302A] placeholder:text-[#aab0a8] placeholder:font-semibold focus:outline-none focus:border-[#1A614F] focus:shadow-[0_0_0_3px_rgba(26,97,79,.12)] shadow-sm"
              />

              {/* Permalink / slug */}
              <div className="mt-2 flex items-center flex-wrap gap-2 text-[13px] text-[#5B6B63]">
                <span className="font-semibold">Permalink:</span>
                <span className="text-[#1A614F]">{SITE_BASE}</span>
                <input
                  value={meta.slug}
                  onChange={(e) => setMeta((p) => ({ ...p, slug: e.target.value }))}
                  onBlur={(e) => { if (!e.target.value && meta.title) setMeta((p) => ({ ...p, slug: slugify(meta.title) })); }}
                  placeholder="post-slug"
                  className="px-2 py-1 rounded border border-[#DDD7C7] bg-[#F4F1E8] text-[#15302A] focus:outline-none focus:border-[#1A614F] min-w-[160px]"
                />
              </div>

              {/* Add Media */}
              <div className="mt-4 flex items-center gap-2">
                <button onClick={onImageClick} className="wp-secondary flex items-center gap-1.5">
                  {imageUploading ? <Loader size={13} className="animate-spin" /> : <ImageIcon size={13} />} Add Media
                </button>
                <span className="text-[11px] text-[#646970]">Insert an image at your cursor</span>
              </div>

              {/* Editor box */}
              <div className="mt-3 bg-white border border-[#ECE6D6] rounded-2xl shadow-sm overflow-hidden">
                <Toolbar
                  exec={exec}
                  onLink={onLink} onUnlink={onUnlink} onImage={onImageClick}
                  format={format} setFormat={handleFormatChange}
                  color={color} setColor={setColor}
                  imageUploading={imageUploading}
                />
                <div
                  ref={bodyRef}
                  className="wp-editor px-5 py-4 text-[15px] min-h-[440px]"
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder="Start writing your post…"
                  onFocus={onEditorFocus}
                  onKeyUp={(e) => { syncFormatState(e); if (bodyRef.current) setBodySnapshot(bodyRef.current.innerHTML); }}
                  onMouseUp={syncFormatState}
                  onInput={() => { if (bodyRef.current) setBodySnapshot(bodyRef.current.innerHTML); }}
                />
              </div>

              {/* hidden file inputs */}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleContentImage(e.target.files[0])} />

              {/* CONTENT IMAGE META PANEL */}
              {pendingImageUrl && (
                <div className="meta-box mt-4">
                  <div className="meta-box-head">
                    <span className="meta-box-title flex items-center gap-1.5"><ImageIcon size={13} /> Image details</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Preview */}
                    <div className="relative rounded-xl overflow-hidden border border-[#E6E1D3] bg-[#F4F1E8]">
                      <img src={pendingImageUrl} alt="preview" className="w-full max-h-48 object-cover" />
                    </div>

                    {/* YouTube video URL */}
                    <label className="block">
                      <span className="block mb-1 text-[11px] font-semibold text-[#5B6B63]">YouTube video URL <span className="text-[#787c82] font-normal">(optional — adds play button overlay)</span></span>
                      <input
                        value={contentImageMeta.videoUrl}
                        onChange={(e) => setContentImageMeta((p) => ({ ...p, videoUrl: e.target.value }))}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-2.5 py-1.5 text-[12px] rounded border border-[#DDD7C7] focus:outline-none focus:border-[#1A614F]"
                      />
                      {contentImageMeta.videoUrl && getYouTubeId(contentImageMeta.videoUrl) && (
                        <span className="mt-1 flex items-center gap-1 text-[11px] text-[#1B9A63] font-semibold">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M8 5v14l11-7z"/></svg>
                          Valid YouTube URL detected
                        </span>
                      )}
                    </label>

                    {/* Alt text */}
                    <label className="block">
                      <span className="block mb-1 text-[11px] font-semibold text-[#5B6B63]">Alt text <span className="text-[#787c82] font-normal">(SEO)</span></span>
                      <input
                        value={contentImageMeta.alt}
                        onChange={(e) => setContentImageMeta((p) => ({ ...p, alt: e.target.value }))}
                        placeholder="Describe the image for search engines"
                        className="w-full px-2.5 py-1.5 text-[12px] rounded border border-[#DDD7C7] focus:outline-none focus:border-[#1A614F]"
                      />
                    </label>

                    {/* Title */}
                    <label className="block">
                      <span className="block mb-1 text-[11px] font-semibold text-[#5B6B63]">Title</span>
                      <input
                        value={contentImageMeta.title}
                        onChange={(e) => setContentImageMeta((p) => ({ ...p, title: e.target.value }))}
                        placeholder="Image title attribute"
                        className="w-full px-2.5 py-1.5 text-[12px] rounded border border-[#DDD7C7] focus:outline-none focus:border-[#1A614F]"
                      />
                    </label>

                    {/* Caption */}
                    <label className="block">
                      <span className="block mb-1 text-[11px] font-semibold text-[#5B6B63]">Caption</span>
                      <input
                        value={contentImageMeta.caption}
                        onChange={(e) => setContentImageMeta((p) => ({ ...p, caption: e.target.value }))}
                        placeholder="Shown below the image"
                        className="w-full px-2.5 py-1.5 text-[12px] rounded border border-[#DDD7C7] focus:outline-none focus:border-[#1A614F]"
                      />
                    </label>

                    {/* Description */}
                    <label className="block">
                      <span className="block mb-1 text-[11px] font-semibold text-[#5B6B63]">Description</span>
                      <textarea
                        rows={2}
                        value={contentImageMeta.description}
                        onChange={(e) => setContentImageMeta((p) => ({ ...p, description: e.target.value }))}
                        placeholder="Longer description of the image"
                        className="w-full px-2.5 py-1.5 text-[12px] rounded border border-[#DDD7C7] focus:outline-none focus:border-[#1A614F] resize-none"
                      />
                    </label>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button onClick={insertContentImage} className="wp-primary flex items-center gap-1.5">
                        <ImageIcon size={13} /> Insert into post
                      </button>
                      <button onClick={cancelContentImage} className="wp-secondary">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* POST SETTINGS / SEO BOX */}
              <div className="meta-box mt-5">
                <button className="meta-box-head w-full" onClick={() => setShowSettings((v) => !v)}>
                  <span className="meta-box-title flex items-center gap-1.5"><Settings size={13} /> Post settings &amp; SEO</span>
                  <ChevronDown size={15} className={`text-[#787c82] transition-transform ${showSettings ? "rotate-180" : ""}`} />
                </button>
                {showSettings && (
                  <div className="p-3 space-y-3">
                    <Field label="Meta title (<title>)"><input value={meta.title} onChange={(e) => setMeta((p) => ({ ...p, title: e.target.value }))} placeholder="Project Name | Location" className="wp-input" /></Field>
                    <Field label="Meta description"><textarea rows={3} value={meta.description} onChange={(e) => setMeta((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description for search results…" className="wp-input resize-none" /></Field>
                    <Field label="Focus keyword(s)"><input value={meta.keywords} onChange={(e) => setMeta((p) => ({ ...p, keywords: e.target.value }))} placeholder="farmland near bangalore" className="wp-input" /></Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Category"><input value={meta.category} onChange={(e) => setMeta((p) => ({ ...p, category: e.target.value }))} className="wp-input" /></Field>
                      <Field label="Author"><input value={meta.author} onChange={(e) => setMeta((p) => ({ ...p, author: e.target.value }))} className="wp-input" /></Field>
                    </div>
                    <Field label="Tags (comma-separated)"><input value={meta.tags} onChange={(e) => setMeta((p) => ({ ...p, tags: e.target.value }))} placeholder="Organic, Eco" className="wp-input" /></Field>
                  </div>
                )}
              </div>

              {/* SCHEMAS CONTAINER */}
              <div className="meta-box mt-5">
                <button className="meta-box-head w-full" onClick={() => setShowSchema((v) => !v)}>
                  <span className="meta-box-title flex items-center gap-1.5">
                    <Code2 size={13} /> Schemas{enabledSchemaCount ? ` (${enabledSchemaCount} active)` : ""}
                  </span>
                  <ChevronDown size={15} className={`text-[#787c82] transition-transform ${showSchema ? "rotate-180" : ""}`} />
                </button>
                {showSchema && (
                  <div className="p-4 space-y-3">
                    <p className="text-[12px] text-[#646970] leading-relaxed">
                      Turn on the schemas this post needs. Use <strong>Default</strong> to fill the fixed
                      fields, or <strong>Upload</strong> to paste your own JSON-LD. Each enabled schema is
                      added to the published page.
                    </p>

                    {SCHEMA_DEFS.map((def) => {
                      const cfg = schemas[def.id];
                      if (!cfg) return null;
                      return (
                        <div key={def.id} className="border border-[#E6E1D3] rounded">
                          {/* Section header: enable + mode */}
                          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#F4F1E8] border-b border-[#E6E1D3]">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={cfg.enabled}
                                onChange={(e) => setSchemaCfg(def.id, { enabled: e.target.checked })} />
                              <span className="text-[13px] font-bold text-[#15302A]">{def.label}</span>
                            </label>
                            {cfg.enabled && (
                              <div className="flex rounded overflow-hidden border border-[#DDD7C7] text-[11px] font-semibold shrink-0">
                                {[["default", "Default"], ["upload", "Upload"]].map(([m, lbl]) => (
                                  <button key={m} type="button" onClick={() => setSchemaCfg(def.id, { mode: m })}
                                    className={`px-2.5 py-1 ${cfg.mode === m ? "bg-[#1A614F] text-white" : "bg-white text-[#1A614F]"}`}>
                                    {lbl}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {cfg.enabled && (
                            <div className="p-3">
                              {/* ── Upload mode ── */}
                              {cfg.mode === "upload" ? (
                                <>
                                  <textarea
                                    rows={6}
                                    value={cfg.json}
                                    onChange={(e) => setSchemaCfg(def.id, { json: e.target.value })}
                                    placeholder={`Paste your ${def.label} JSON or full <script type="application/ld+json"> block…`}
                                    className="wp-input resize-y"
                                    style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px" }}
                                  />
                                  <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="text-[11px]">
                                      {cfg.json.trim()
                                        ? (parseJsonLd(cfg.json)
                                            ? <span className="text-[#1B9A63]">✓ Valid JSON-LD</span>
                                            : <span className="text-[#b32d2e]">⚠ Invalid JSON — check the syntax.</span>)
                                        : <span className="text-[#787c82]">Paste a schema, then Save to load it into the editable fields.</span>}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => saveUploadedSchema(def)}
                                      disabled={!cfg.json.trim() || !parseJsonLd(cfg.json)}
                                      className="wp-button-primary disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                    >
                                      Save &amp; edit
                                    </button>
                                  </div>
                                </>
                              ) : def.kind === "object" ? (
                                /* ── Default mode: editable key→value pairs of the schema ── */
                                <div>
                                {schemaSavedId === def.id && (
                                  <p className="mb-2 text-[11px] text-[#1B9A63] font-semibold">✓ Saved — values loaded below, edit as needed.</p>
                                )}
                                <div className="grid grid-cols-[150px_1fr] gap-x-2 gap-y-2 items-start">
                                  {flattenLeaves(cfg.data).map(({ path, value }) => {
                                    const { key, parent } = pathLabel(path);
                                    const long = typeof value === "string" && value.length > 60;
                                    return (
                                      <React.Fragment key={path}>
                                        <span className="text-[11px] pt-2 leading-tight">
                                          <span className="font-semibold text-[#15302A]">{key}</span>
                                          {parent && <span className="block text-[10px] text-[#a7aaad]">{parent}</span>}
                                        </span>
                                        {long ? (
                                          <textarea rows={3} value={value}
                                            onChange={(e) => setSchemaPath(def.id, path, e.target.value)}
                                            className="wp-input resize-y" />
                                        ) : (
                                          <input value={value}
                                            onChange={(e) => setSchemaPath(def.id, path, e.target.value)}
                                            className="wp-input" />
                                        )}
                                      </React.Fragment>
                                    );
                                  })}
                                </div>
                                </div>
                              ) : (
                                /* ── Default mode: repeatable items (FAQ / breadcrumb) ── */
                                <div className="space-y-2">
                                  {schemaSavedId === def.id && (
                                    <p className="text-[11px] text-[#1B9A63] font-semibold">✓ Saved — values loaded, edit as needed.</p>
                                  )}
                                  {(cfg.data.items || []).map((it, idx) => (
                                    <div key={idx} className="border border-[#E6E1D3] rounded p-2 space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-semibold text-[#787c82]">#{idx + 1}</span>
                                        <button onClick={() => removeSchemaItem(def.id, idx)}
                                          className="text-[11px] text-[#b32d2e] hover:underline">Remove</button>
                                      </div>
                                      {def.itemFields.map((f) => (
                                        f.type === "textarea" ? (
                                          <textarea key={f.key} rows={2} value={it[f.key] || ""} placeholder={f.label}
                                            onChange={(e) => setSchemaItem(def.id, idx, f.key, e.target.value)}
                                            className="wp-input resize-y" />
                                        ) : (
                                          <input key={f.key} value={it[f.key] || ""} placeholder={f.label}
                                            onChange={(e) => setSchemaItem(def.id, idx, f.key, e.target.value)}
                                            className="wp-input" />
                                        )
                                      ))}
                                    </div>
                                  ))}
                                  <button onClick={() => addSchemaItem(def.id, def)} className="wp-secondary flex items-center gap-1">
                                    <Plus size={12} /> {def.addLabel}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div>
                      <button onClick={() => setShowJsonLd((v) => !v)} className="wp-link flex items-center gap-1">
                        {showJsonLd ? "Hide" : "View"} generated JSON-LD
                      </button>
                      {showJsonLd && (
                        <pre className="mt-2 max-h-72 overflow-auto rounded bg-[#15302A] text-[#9be8c0] text-[11px] leading-relaxed p-3 row-scroll whitespace-pre-wrap">{jsonLdPreview || "// Enable a schema to see its JSON-LD"}</pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* RIGHT SIDEBAR — meta boxes */}
            <div className="w-[280px] shrink-0">
              {/* PUBLISH BOX (matches reference) */}
              <div className="meta-box">
                <div className="meta-box-head">
                  <span className="meta-box-title">Publish</span>
                  <ChevronsUpDown size={15} className="text-[#787c82]" />
                </div>
                <div className="p-3">
                  <div className="flex justify-end mb-3">
                    <button onClick={() => { if (pendingImageUrl) insertContentImage(); setTimeout(() => { const html = bodyRef.current ? bodyRef.current.innerHTML : ""; setBodySnapshot(html); setPreviewMode(true); }, 20); }} className="wp-secondary">Preview Changes</button>
                  </div>
                  <ul className="space-y-2.5 text-[13px] text-[#5B6B63]">
                    <li className="flex items-center gap-2">
                      <CircleDot size={14} className="text-[#787c82]" />
                      Status: <strong className="text-[#15302A]">Published</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe size={14} className="text-[#787c82]" />
                      Visibility: <strong className="text-[#15302A]">Public</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#787c82]" />
                      {editingDate ? (
                        <input autoFocus value={meta.date} onBlur={() => setEditingDate(false)}
                          onChange={(e) => setMeta((p) => ({ ...p, date: e.target.value }))}
                          className="px-2 py-0.5 text-[12px] rounded border border-[#DDD7C7] focus:outline-none focus:border-[#1A614F]" />
                      ) : (
                        <span>Published on: <strong className="text-[#15302A]">{meta.date || "—"}</strong></span>
                      )}
                      {!editingDate && <button className="wp-link" onClick={() => setEditingDate(true)}>Edit</button>}
                    </li>
                  </ul>

                  {(publishStatus === "success" || publishStatus === "error") && (
                    <div className={`mt-3 flex items-start gap-2 rounded px-2.5 py-2 text-[12px] font-medium ${publishStatus === "success" ? "bg-[#edfaef] text-[#1B9A63] border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                      {publishStatus === "success" ? <CheckCircle size={13} className="mt-0.5 shrink-0" /> : <AlertCircle size={13} className="mt-0.5 shrink-0" />}
                      {publishMsg}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-[#E6E1D3] flex items-center justify-between">
                    <button onClick={onBack} className="text-[12px] text-[#b32d2e] hover:text-[#8a2424] hover:underline">Move to Trash</button>
                    <button onClick={publishBlog} disabled={publishStatus === "loading"} className="wp-primary flex items-center gap-1.5">
                      {publishStatus === "loading" ? <><Loader size={13} className="animate-spin" /> Updating…</> : <><Send size={13} /> {isEditMode ? "Update" : "Publish"}</>}
                    </button>
                  </div>
                </div>
              </div>

              {/* FEATURED IMAGE BOX */}
              <div className="meta-box">
                <div className="meta-box-head"><span className="meta-box-title">Featured image</span></div>
                <div className="p-3">
                  {/* Thumbnail preview — shows play overlay when a video URL is set */}
                  {(meta.heroImage || heroPreview) ? (
                    <div className="relative group">
                      <img src={meta.heroImage || heroPreview} alt="featured" className="w-full h-28 object-cover rounded border border-slate-100" />
                      {heroUploading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded bg-black/40 text-white text-[11px] font-semibold gap-2">
                          <Loader size={13} className="animate-spin" /> Uploading…
                        </div>
                      )}
                      {/* Play overlay — only shown when videoUrl is filled */}
                      <button onClick={() => setMeta((p) => ({ ...p, heroImage: "" }))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 z-10">×</button>
                    </div>
                  ) : (
                    <div className="w-full h-28 rounded border border-dashed border-[#DDD7C7] bg-[#F4F1E8] flex flex-col items-center justify-center text-[#a7aaad] gap-1 select-none">
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      <span className="text-[11px]">No featured image yet</span>
                    </div>
                  )}

                  <div className="mt-2">
                    <input ref={heroInputRef} type="file" accept="image/*" disabled={heroUploading} onChange={(e) => handleHeroImage(e.target.files[0])} />
                    {heroUploading && <div className="mt-2 flex items-center gap-2 text-xs text-[#1A614F] font-semibold"><Loader size={12} className="animate-spin" /> Uploading…</div>}
                  </div>

                  <div className="mt-2 space-y-2">
                    <label className="block">
                      <span className="block mb-1 text-[11px] font-semibold text-[#5B6B63]">Alt text <span className="text-[#787c82] font-normal">(SEO)</span></span>
                      <input value={meta.imageAlt} onChange={(e) => setMeta((p) => ({ ...p, imageAlt: e.target.value }))} placeholder="Describe the image for search engines"
                        className="w-full px-2.5 py-1.5 text-[12px] rounded border border-[#DDD7C7] focus:outline-none focus:border-[#1A614F]" />
                    </label>
                    <label className="block">
                      <span className="block mb-1 text-[11px] font-semibold text-[#5B6B63]">Title</span>
                      <input value={meta.imageTitle} onChange={(e) => setMeta((p) => ({ ...p, imageTitle: e.target.value }))} placeholder="Image title attribute"
                        className="w-full px-2.5 py-1.5 text-[12px] rounded border border-[#DDD7C7] focus:outline-none focus:border-[#1A614F]" />
                    </label>
                    <label className="block">
                      <span className="block mb-1 text-[11px] font-semibold text-[#5B6B63]">Caption</span>
                      <input value={meta.imageCaption} onChange={(e) => setMeta((p) => ({ ...p, imageCaption: e.target.value }))} placeholder="Shown below the image"
                        className="w-full px-2.5 py-1.5 text-[12px] rounded border border-[#DDD7C7] focus:outline-none focus:border-[#1A614F]" />
                    </label>
                    <label className="block">
                      <span className="block mb-1 text-[11px] font-semibold text-[#5B6B63]">Description</span>
                      <textarea rows={2} value={meta.imageDescription} onChange={(e) => setMeta((p) => ({ ...p, imageDescription: e.target.value }))} placeholder="Longer description of the image"
                        className="w-full px-2.5 py-1.5 text-[12px] rounded border border-[#DDD7C7] focus:outline-none focus:border-[#1A614F] resize-none" />
                    </label>
                  </div>
                </div>
              </div>

              {/* DRAFTS BOX */}
              <div className="meta-box">
                <button className="meta-box-head w-full" onClick={() => setShowDrafts((v) => !v)}>
                  <span className="meta-box-title">Drafts &amp; export</span>
                  <ChevronDown size={15} className={`text-[#787c82] transition-transform ${showDrafts ? "rotate-180" : ""}`} />
                </button>
                {showDrafts && (
                  <div className="p-3 space-y-2">
                    <div className="flex gap-2">
                      <button onClick={saveDraft} className="wp-secondary flex-1">Save draft</button>
                      <button onClick={downloadJSON} className="wp-secondary flex-1 flex items-center justify-center gap-1"><Upload size={12} /> JSON</button>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-auto row-scroll">
                      {drafts.length === 0 && <p className="text-[12px] text-[#646970]">No saved drafts.</p>}
                      {drafts.map((d) => (
                        <div key={d.key} className="flex items-center justify-between gap-2 p-2 border border-[#E6E1D3] rounded">
                          <div className="min-w-0">
                            <div className="text-[12px] font-semibold text-[#15302A] truncate">{d.data.meta?.title || "Untitled"}</div>
                            <div className="text-[10px] text-[#646970]">{new Date(d.data.savedAt).toLocaleString()}</div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => loadDraft(d.key)} className="wp-link">Open</button>
                            <button onClick={() => deleteDraft(d.key)} className="text-[12px] text-[#b32d2e] hover:underline">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Redirects Box ────────────────────────────────────────────────────
function RedirectsBox({ ghToken, ghRepo, ghBranch, ghFile, fetchCurrentFile, inline = false }) {
  const SITE_BLOG_BASE = "https://www.novaranatureestates.com/blog/";
  const [query, setQuery]         = useState("");
  const [blogs, setBlogs]         = useState(() => BLOGS.map((b) => ({ id: b.id, title: b.title, headline: b.headline, slug: b.slug })));
  const [editingId, setEditingId] = useState(null);
  const [editSlug, setEditSlug]   = useState("");
  const [savingId, setSavingId]   = useState(null);
  const [savedId, setSavedId]     = useState(null);
  const [errorId, setErrorId]     = useState(null);
  const [errorMsg, setErrorMsg]   = useState("");
  const [copiedId, setCopiedId]   = useState(null);

  const filtered = blogs.filter((b) =>
    b.headline?.toLowerCase().includes(query.toLowerCase()) ||
    b.title?.toLowerCase().includes(query.toLowerCase()) ||
    b.slug?.toLowerCase().includes(query.toLowerCase())
  );

  const startEdit = (blog) => { setEditingId(blog.id); setEditSlug(blog.slug); setErrorId(null); setErrorMsg(""); };
  const cancelEdit = () => { setEditingId(null); setEditSlug(""); };

  const saveSlug = async (blog) => {
    const newSlug = editSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/, "");
    if (!newSlug || newSlug === blog.slug) { cancelEdit(); return; }
    setSavingId(blog.id); setErrorId(null);
    try {
      const { sha, blogsArray } = await fetchCurrentFile();
      const idx = blogsArray.findIndex((b) => String(b.id) === String(blog.id) || b.slug === blog.slug);
      if (idx === -1) throw new Error("Blog not found in blogs.js");
      const updated = [...blogsArray];
      updated[idx] = { ...updated[idx], slug: newSlug };
      const entriesStr = updated.map((b) => "  " + JSON.stringify(b, null, 2).replace(/\n/g, "\n  ")).join(",\n");
      const newContent = `export const BLOGS = [\n${entriesStr}\n];\n`;
      const putRes = await fetch(`https://api.github.com/repos/${ghRepo}/contents/${ghFile}`, {
        method: "PUT",
        headers: { Authorization: `token ${ghToken}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
        body: JSON.stringify({ message: `update redirect: ${blog.slug} -> ${newSlug}`, content: btoa(unescape(encodeURIComponent(newContent))), sha, branch: ghBranch }),
      });
      if (!putRes.ok) { const err = await putRes.json().catch(() => ({})); throw new Error(err.message || `Commit failed: HTTP ${putRes.status}`); }
      setBlogs((prev) => prev.map((b) => String(b.id) === String(blog.id) ? { ...b, slug: newSlug } : b));
      setSavedId(blog.id); setTimeout(() => setSavedId(null), 2500); setEditingId(null);
    } catch (e) { setErrorId(blog.id); setErrorMsg(e.message || "Save failed"); }
    finally { setSavingId(null); }
  };

  const copyLink = (slug) => {
    navigator.clipboard.writeText(SITE_BLOG_BASE + slug).then(() => { setCopiedId(slug); setTimeout(() => setCopiedId(null), 2000); });
  };

  const listContent = (
    <div className={`space-y-2 ${inline ? "" : "p-3"}`}>
      {!inline && <p className="text-[11px] text-[#646970] leading-relaxed">Edit any blog’s redirect slug. Changes save to <code className="bg-[#F4F1E8] px-1 rounded">blogs.js</code> immediately.</p>}
      <div className="relative">
        <Search size={inline ? 13 : 11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search blogs…"
          className={`w-full pl-7 pr-2.5 py-1.5 rounded border border-[#DDD7C7] focus:outline-none focus:border-[#1A614F] bg-white ${inline ? "text-[13px]" : "text-[11px]"}`} />
      </div>
      <div className={`space-y-2 overflow-auto row-scroll ${inline ? "max-h-[60vh]" : "max-h-64"}`}>
        {filtered.map((blog) => {
          const isEditing = editingId === blog.id;
          const isSaving  = savingId === blog.id;
          const isSaved   = savedId === blog.id;
          const isError   = errorId === blog.id;
          return (
            <div key={blog.id} className="rounded-lg border border-[#E6E1D3] bg-white overflow-hidden">
              <div className={`flex items-center justify-between gap-1 ${inline ? "px-3 pt-2.5 pb-1" : "px-2.5 pt-2 pb-1"}`}>
                <span className={`font-semibold text-[#15302A] leading-snug flex-1 ${inline ? "text-[13px]" : "text-[11px]"}`} style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{blog.headline || blog.title}</span>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => copyLink(blog.slug)} title="Copy URL"
                    className={`rounded flex items-center justify-center text-[#5B6B63] hover:text-[#1A614F] hover:bg-[#EAF4EF] transition-colors ${inline ? "w-6 h-6" : "w-5 h-5"}`}>
                    {copiedId === blog.slug ? <CheckCircle size={inline ? 13 : 11} className="text-[#1B9A63]" /> : <LinkIcon size={inline ? 13 : 11} />}
                  </button>
                  {!isEditing ? (
                    <button onClick={() => startEdit(blog)} title="Edit slug"
                      className={`rounded flex items-center justify-center text-[#5B6B63] hover:text-[#1A614F] hover:bg-[#EAF4EF] transition-colors ${inline ? "w-6 h-6" : "w-5 h-5"}`}>
                      <Edit3 size={inline ? 13 : 11} />
                    </button>
                  ) : (
                    <button onClick={cancelEdit} title="Cancel"
                      className={`rounded flex items-center justify-center text-[#b32d2e] hover:bg-red-50 transition-colors font-bold ${inline ? "w-6 h-6 text-[13px]" : "w-5 h-5 text-[11px]"}`}>
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <div className={inline ? "px-3 pb-3" : "px-2.5 pb-2"}>
                {!isEditing ? (
                  <div className={`text-[#1A614F] font-mono truncate ${inline ? "text-[12px]" : "text-[10px]"}`}>{SITE_BLOG_BASE}{blog.slug}</div>
                ) : (
                  <div className="space-y-1.5 mt-1">
                    <div className={`text-slate-400 font-mono truncate ${inline ? "text-[11px]" : "text-[10px]"}`}>{SITE_BLOG_BASE}</div>
                    <input autoFocus value={editSlug} onChange={(e) => setEditSlug(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveSlug(blog); if (e.key === "Escape") cancelEdit(); }}
                      className={`w-full px-2 py-1 font-mono rounded border border-[#1A614F] focus:outline-none focus:ring-1 focus:ring-[#1A614F]/30 text-[#15302A] ${inline ? "text-[13px]" : "text-[11px]"}`}
                      placeholder="new-slug-here" />
                    <button onClick={() => saveSlug(blog)} disabled={isSaving}
                      className={`w-full flex items-center justify-center gap-1 py-1.5 rounded font-bold text-white transition-all disabled:opacity-60 ${inline ? "text-[13px]" : "text-[11px]"}`}
                      style={{ background: "linear-gradient(135deg,#1A614F,#0d3d30)" }}>
                      {isSaving ? <><Loader size={inline ? 13 : 11} className="animate-spin" /> Saving…</> : <><Send size={inline ? 13 : 11} /> Save redirect</>}
                    </button>
                  </div>
                )}
                {isSaved && <div className={`mt-1 flex items-center gap-1 text-[#1B9A63] font-semibold ${inline ? "text-[12px]" : "text-[10px]"}`}><CheckCircle size={inline ? 12 : 10} /> Saved!</div>}
                {isError && <div className={`mt-1 text-red-600 font-semibold ${inline ? "text-[12px]" : "text-[10px]"}`}>{errorMsg}</div>}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className={`text-[#646970] text-center py-3 ${inline ? "text-[13px]" : "text-[11px]"}`}>No blogs match “{query}”</p>}
      </div>
    </div>
  );

  if (inline) return listContent;

  return (
    <div className="meta-box">
      <button className="meta-box-head w-full" onClick={() => {}}>
        <span className="meta-box-title flex items-center gap-1.5"><LinkIcon size={13} /> Redirects</span>
      </button>
      {listContent}
    </div>
  );
}

// small labelled field used in the settings box
function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block mb-1 text-[11px] font-semibold text-[#5B6B63]">{label}</span>
      {children}
    </label>
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4F1E8" }}>
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader size={28} className="animate-spin" style={{ color: "#1A614F" }} />
          <span className="text-sm">Verifying session…</span>
        </div>
      </div>
    );

  if (!isAuthenticated) return <LoginScreen />;
  if (screen === "picker")
    return <BlogPicker onSelect={(blog) => { setEditingBlog(blog); setScreen("editor"); }} />;
  return <BlogEditor editingBlog={editingBlog} onBack={() => { setScreen("picker"); setEditingBlog(null); }} />;
}