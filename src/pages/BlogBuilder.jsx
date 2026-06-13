import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Bold, Italic, Underline, Link as LinkIcon, Unlink, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Image as ImageIcon,
  Palette, ChevronDown, Eye, EyeOff, Home, FileText, Image as MediaIcon,
  Leaf, LogIn, LogOut, Loader, AlertCircle, CheckCircle, Send, Search,
  Edit3, ArrowLeft, Plus, Upload, Settings, Calendar, Globe,
  CircleDot, ChevronsUpDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BLOGS } from "../data/blogs";

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
      return `<figure><img src="${escapeHtml(s.src || "")}" alt="${escapeHtml(s.caption || "")}" />${s.caption ? `<figcaption>${escapeHtml(s.caption)}</figcaption>` : ""}</figure>`;

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
      const src = (tag === "img" ? node.getAttribute("src") : img?.getAttribute("src")) || "";
      const cap = node.querySelector ? (node.querySelector("figcaption")?.textContent.trim() || "") : "";
      if (src) out.push({ type: "image", src, caption: cap });
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
function PreviewSection({ s, usedH3 }) {
  if (["h2","h3","h4","h5","h6"].includes(s.type)) {
    const base = slugify(s.text || "");
    const count = (usedH3.get(base) || 0) + 1; usedH3.set(base, count);
    const id = count === 1 ? base : `${base}-${count}`;
    const size = {
      h2: "text-[20px] sm:text-[24px]", h3: "text-[16px] sm:text-[18px]",
      h4: "text-[15px] sm:text-[16px]", h5: "text-[13px] sm:text-[14px]", h6: "text-[12px] sm:text-[13px]",
    }[s.type];
    return React.createElement(s.type, { id, className: `scroll-mt-28 ${size} font-bold text-[#111827]` }, s.text);
  }
  if (s.type === "quote")
    return <div className="rounded-xl border border-[#F2E6C9] bg-[#FFF8E8] px-4 py-4 text-[14px] text-slate-700"><div className="border-l-4 border-[#E3A600] pl-3 italic leading-relaxed">{s.text}</div></div>;
  if (s.type === "image")
    return <figure className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">{s.src ? <img src={s.src} alt={s.caption || ""} className="w-full h-auto" /> : null}{s.caption && <figcaption className="px-4 py-3 text-[12px] text-slate-500">{s.caption}</figcaption>}</figure>;
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ fontFamily: "'Urbanist', sans-serif", background: "#f0f0f1" }}>
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
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2271b1]/30 focus:border-[#2271b1]" />
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Password</label>
              <input type="password" value={form.password} placeholder="••••••••"
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2271b1]/30 focus:border-[#2271b1]" />
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
    b.title?.toLowerCase().includes(query.toLowerCase()) ||
    b.slug?.toLowerCase().includes(query.toLowerCase()) ||
    b.category?.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Urbanist', sans-serif", background: "#f0f0f1" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap');`}</style>
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1A614F" }}><Leaf size={15} className="text-white" /></div>
          <div>
            <span className="text-[15px] font-bold text-slate-800 leading-none block">Blog Builder</span>
            <span className="text-[10px] text-slate-400">Novara Nature Estates</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "#E9FFF3", color: "#1B9A63" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#1B9A63]" />{user?.email || "Logged in"}
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-semibold hover:border-red-300 hover:text-red-500 transition-all">
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-10">
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
                  ? <img src={blog.heroImage || blog.image} alt={blog.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} className="text-slate-300" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 text-sm truncate group-hover:text-[#1A614F]">{blog.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#E9FFF3", color: "#1B9A63" }}>{blog.category}</span>
                  <span className="text-[11px] text-slate-400 truncate">{blog.slug}</span>
                </div>
              </div>
              <Edit3 size={14} className="text-slate-300 group-hover:text-[#E3A600] flex-shrink-0" />
            </button>
          ))}
          {filtered.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">No blogs match “{query}”</div>}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TOOLBAR
// ═════════════════════════════════════════════════════════════════════════════
const SWATCHES = ["#111827", "#1A614F", "#E3A600", "#2271b1", "#b32d2e", "#6b7280", "#ffffff"];

function ToolbarButton({ title, onClick, active, children }) {
  return (
    <button type="button" title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`h-8 min-w-8 px-1.5 flex items-center justify-center rounded-[3px] text-[#3c434a] border border-transparent transition-colors
        ${active ? "bg-[#dcdcde] border-[#c3c4c7]" : "hover:bg-[#f0f0f1] hover:border-[#c3c4c7]"}`}>
      {children}
    </button>
  );
}

function Toolbar({ exec, onLink, onUnlink, onImage, format, setFormat, color, setColor, imageUploading }) {
  const [colorOpen, setColorOpen] = useState(false);
  const sep = <span className="mx-0.5 w-px self-stretch my-1 bg-[#dcdcde]" />;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[#dcdcde] bg-[#f6f7f7] rounded-t-[3px]">
      {/* Format / Paragraph + H1–H6 */}
      <div className="relative">
        <select
          value={format}
          onChange={(e) => { setFormat(e.target.value); }}
          className="h-8 pl-2 pr-7 text-[13px] text-[#3c434a] bg-white border border-[#c3c4c7] rounded-[3px] appearance-none cursor-pointer focus:outline-none focus:border-[#2271b1]"
          style={{ minWidth: 118 }}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#3c434a]" />
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
          <div className="absolute z-30 mt-1 p-2 bg-white border border-[#c3c4c7] rounded-md shadow-lg" onMouseDown={(e) => e.preventDefault()}>
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

  const [previewMode, setPreviewMode] = useState(false);
  const [activeNav, setActiveNav] = useState("blog");
  const [showSettings, setShowSettings] = useState(true);
  const [showDrafts, setShowDrafts] = useState(false);
  const [editingDate, setEditingDate] = useState(false);

  const [publishStatus, setPublishStatus] = useState(null);
  const [publishMsg, setPublishMsg] = useState("");

  const [drafts, setDrafts] = useState([]);
  const [currentDraftKey, setCurrentDraftKey] = useState(null);

  const [meta, setMeta] = useState({
    title: "", description: "", keywords: "", slug: "",
    category: "Managed Farmland", author: "Novara Nature Estates",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    heroImage: "", imageAlt: "", tags: "",
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
      title:       editingBlog.headline    || editingBlog.title || "",
      description: editingBlog.description  || "",
      keywords:    editingBlog.keywords     || "",
      slug:        editingBlog.slug         || "",
      category:    editingBlog.category     || "Managed Farmland",
      author:      editingBlog.author       || "Novara Nature Estates",
      date:        editingBlog.date         || "",
      heroImage:   editingBlog.heroImage    || editingBlog.image || "",
      imageAlt:    editingBlog.imageAlt     || editingBlog.title || "",
      tags:        (editingBlog.tags || []).join(", "),
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

  const handleContentImage = async (file) => {
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await compressAndUpload(file, { maxW: 1200, quality: 0.8 });
      focusBody();
      const sel = window.getSelection();
      if (savedSelection.current) { sel.removeAllRanges(); sel.addRange(savedSelection.current); }
      const figure = `<figure><img src="${url}" alt="" /><figcaption>Add a caption…</figcaption></figure><p><br/></p>`;
      document.execCommand("insertHTML", false, figure);
    } catch (e) { alert("Image upload failed: " + e.message); }
    finally { setImageUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleHeroImage = async (file) => {
    if (!file) return;
    setHeroUploading(true);
    try {
      const url = await compressAndUpload(file, { maxW: 1400, quality: 0.82 });
      setMeta((p) => ({ ...p, heroImage: url }));
    } catch (e) { alert("Featured image upload failed: " + e.message); }
    finally { setHeroUploading(false); if (heroInputRef.current) heroInputRef.current.value = ""; }
  };

  // ── Export / publish ──────────────────────────────────────────────────────
  const exportBlogData = () => {
    const html = bodyRef.current ? bodyRef.current.innerHTML : initialHtml.current;
    const sections = htmlToSections(html);
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
      imageAlt: meta.imageAlt || title, tags: tagsArr, sections,
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
    localStorage.setItem(key, JSON.stringify({ meta, body, savedAt: new Date().toISOString() }));
    setCurrentDraftKey(key); loadDrafts();
    setPublishStatus("success"); setPublishMsg("Draft saved.");
  };
  const loadDraft = (key) => {
    const d = JSON.parse(localStorage.getItem(key));
    setMeta(d.meta);
    if (bodyRef.current) bodyRef.current.innerHTML = d.body || "";
    setCurrentDraftKey(key); setShowDrafts(false);
    setPublishStatus("success"); setPublishMsg("Draft loaded.");
  };
  const deleteDraft = (key) => { localStorage.removeItem(key); loadDrafts(); };

  // ── Preview sections ──────────────────────────────────────────────────────
  const previewSections = useMemo(() => {
    if (!previewMode) return [];
    const html = bodyRef.current ? bodyRef.current.innerHTML : "";
    return htmlToSections(html);
  }, [previewMode]);

  // ─────────────────────────────────────────────────────────────────────────
  const navItems = [
    { id: "home",  label: "Home",  Icon: Home,      onClick: onBack },
    { id: "blog",  label: "Blog",  Icon: FileText,  onClick: () => setActiveNav("blog") },
    { id: "media", label: "Media", Icon: MediaIcon, onClick: () => { setActiveNav("media"); setShowSettings(true); heroInputRef.current?.focus?.(); } },
  ];

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Urbanist', sans-serif", background: "#f0f0f1" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .wp-editor a { color:#E3A600; }
        .wp-editor h1 { font-size:26px; font-weight:700; margin:.6em 0 .3em; color:#111827; }
        .wp-editor h2 { font-size:22px; font-weight:700; margin:.6em 0 .3em; color:#111827; }
        .wp-editor h3 { font-size:18px; font-weight:700; margin:.6em 0 .3em; color:#111827; }
        .wp-editor h4 { font-size:16px; font-weight:700; margin:.6em 0 .3em; color:#111827; }
        .wp-editor h5 { font-size:14px; font-weight:700; margin:.6em 0 .3em; color:#111827; }
        .wp-editor h6 { font-size:13px; font-weight:700; margin:.6em 0 .3em; color:#111827; }
        .wp-editor p { margin:0 0 1em; line-height:1.7; color:#374151; }
        .wp-editor ul { list-style:disc; padding-left:1.6em; margin:0 0 1em; }
        .wp-editor ol { list-style:decimal; padding-left:1.6em; margin:0 0 1em; }
        .wp-editor li { margin:.25em 0; line-height:1.6; color:#374151; }
        .wp-editor blockquote { border-left:4px solid #E3A600; background:#FFF8E8; padding:10px 14px; margin:0 0 1em; font-style:italic; color:#475569; border-radius:6px; }
        .wp-editor figure { margin:0 0 1em; }
        .wp-editor figure img { max-width:100%; height:auto; border-radius:10px; display:block; }
        .wp-editor figcaption { font-size:12px; color:#64748b; padding:6px 2px; }
        .wp-editor table { border-collapse:collapse; width:100%; margin:0 0 1em; }
        .wp-editor th, .wp-editor td { border:1px solid #d1d5db; padding:8px 12px; text-align:left; }
        .wp-editor:empty:before { content:attr(data-placeholder); color:#9ca3af; }
        .wp-editor:focus { outline:none; }
        input[type="file"] { font-size:12px; color:#64748b; border:1.5px dashed #c3c4c7; border-radius:6px; padding:8px 12px; width:100%; background:#fff; cursor:pointer; }
        .meta-box { background:#fff; border:1px solid #c3c4c7; border-radius:4px; margin-bottom:16px; }
        .meta-box-head { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #dcdcde; }
        .meta-box-title { font-size:14px; font-weight:700; color:#1d2327; }
        .wp-primary { background:#2271b1; color:#fff; border:1px solid #2271b1; padding:7px 14px; border-radius:3px; font-weight:600; font-size:13px; cursor:pointer; transition:background .15s; }
        .wp-primary:hover:not(:disabled) { background:#135e96; }
        .wp-primary:disabled { opacity:.6; cursor:not-allowed; }
        .wp-secondary { background:#f6f7f7; color:#2271b1; border:1px solid #2271b1; padding:6px 12px; border-radius:3px; font-weight:600; font-size:12px; cursor:pointer; }
        .wp-secondary:hover { background:#f0f6fc; }
        .wp-link { color:#2271b1; font-size:12px; cursor:pointer; }
        .wp-link:hover { color:#135e96; text-decoration:underline; }
        .wp-input { width:100%; padding:7px 10px; font-size:13px; color:#1d2327; border:1px solid #c3c4c7; border-radius:3px; background:#fff; }
        .wp-input:focus { outline:none; border-color:#2271b1; box-shadow:0 0 0 1px #2271b1; }
        .row-scroll::-webkit-scrollbar { width:6px; } .row-scroll::-webkit-scrollbar-thumb { background:#c3c4c7; border-radius:4px; }
      `}</style>

      {/* ── PREVIEW OVERLAY ───────────────────────────────────────────── */}
      {previewMode && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
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
            {meta.heroImage && <img src={meta.heroImage} alt={meta.imageAlt} className="mt-5 w-full rounded-2xl border border-slate-100 object-cover" />}
            <div className="mt-7 space-y-5">
              {(() => { const used = new Map(); return previewSections.map((s, i) => <PreviewSection key={i} s={s} usedH3={used} />); })()}
            </div>
          </article>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* ── LEFT NAV (WordPress style) ──────────────────────────────── */}
        <aside className="w-[160px] shrink-0 flex flex-col text-[#f0f0f1]" style={{ background: "#1d2327" }}>
          <div className="flex items-center gap-2 px-4 h-12 border-b border-black/30">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#1A614F" }}><Leaf size={13} className="text-white" /></div>
            <span className="text-[13px] font-bold tracking-tight">Novara</span>
          </div>
          <nav className="py-2 flex-1">
            {navItems.map(({ id, label, Icon, onClick }) => {
              const active = activeNav === id;
              return (
                <button key={id} onClick={onClick}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors"
                  style={active ? { background: "#2271b1", color: "#fff", fontWeight: 600 } : { color: "#c3c4c7" }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#2c3338"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                  <Icon size={16} /> {label}
                </button>
              );
            })}
          </nav>
          <div className="px-4 py-3 border-t border-black/30">
            <div className="text-[11px] text-[#a7aaad] truncate mb-1.5">{user?.email}</div>
            <button onClick={logout} className="flex items-center gap-1.5 text-[12px] text-[#c3c4c7] hover:text-white transition-colors">
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </aside>

        {/* ── MAIN ────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* top bar */}
          <div className="h-12 bg-white border-b border-[#c3c4c7] flex items-center justify-between px-5">
            <div className="flex items-center gap-2.5">
              <button onClick={onBack} className="w-7 h-7 rounded border border-[#c3c4c7] flex items-center justify-center text-[#50575e] hover:border-[#2271b1] hover:text-[#2271b1]"><ArrowLeft size={14} /></button>
              <h1 className="text-[16px] font-semibold text-[#1d2327]">{isEditMode ? "Edit Post" : "Add New Post"}</h1>
              {isEditMode && <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ background: "#FFF8E8", color: "#b57d00", border: "1px solid #FFCE4C" }}>Editing</span>}
            </div>
            <button onClick={() => setPreviewMode(true)} className="wp-secondary flex items-center gap-1.5"><Eye size={13} /> Preview</button>
          </div>

          <div className="flex-1 flex gap-5 px-5 py-5 items-start" style={{ background: "#f0f0f1" }}>
            {/* CONTENT COLUMN */}
            <div className="flex-1 min-w-0">
              {/* Title (H1) */}
              <input
                value={meta.title}
                onChange={(e) => setMeta((p) => ({ ...p, slug: (p.slug || ""), title: e.target.value }))}
                placeholder="Add title"
                className="w-full bg-white border border-[#c3c4c7] rounded-[3px] px-4 py-3 text-[1.7em] font-semibold text-[#1d2327] placeholder:text-[#646970] placeholder:font-normal focus:outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]"
              />

              {/* Permalink / slug */}
              <div className="mt-2 flex items-center flex-wrap gap-2 text-[13px] text-[#50575e]">
                <span className="font-semibold">Permalink:</span>
                <span className="text-[#2271b1]">{SITE_BASE}</span>
                <input
                  value={meta.slug}
                  onChange={(e) => setMeta((p) => ({ ...p, slug: e.target.value }))}
                  onBlur={(e) => { if (!e.target.value && meta.title) setMeta((p) => ({ ...p, slug: slugify(meta.title) })); }}
                  placeholder="post-slug"
                  className="px-2 py-1 rounded border border-[#c3c4c7] bg-[#f6f7f7] text-[#1d2327] focus:outline-none focus:border-[#2271b1] min-w-[160px]"
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
              <div className="mt-3 bg-white border border-[#c3c4c7] rounded-[3px]">
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
                  onKeyUp={syncFormatState}
                  onMouseUp={syncFormatState}
                />
              </div>

              {/* hidden file inputs */}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleContentImage(e.target.files[0])} />
            </div>

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
                    <button onClick={() => setPreviewMode(true)} className="wp-secondary">Preview Changes</button>
                  </div>
                  <ul className="space-y-2.5 text-[13px] text-[#50575e]">
                    <li className="flex items-center gap-2">
                      <CircleDot size={14} className="text-[#787c82]" />
                      Status: <strong className="text-[#1d2327]">Published</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe size={14} className="text-[#787c82]" />
                      Visibility: <strong className="text-[#1d2327]">Public</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#787c82]" />
                      {editingDate ? (
                        <input autoFocus value={meta.date} onBlur={() => setEditingDate(false)}
                          onChange={(e) => setMeta((p) => ({ ...p, date: e.target.value }))}
                          className="px-2 py-0.5 text-[12px] rounded border border-[#c3c4c7] focus:outline-none focus:border-[#2271b1]" />
                      ) : (
                        <span>Published on: <strong className="text-[#1d2327]">{meta.date || "—"}</strong></span>
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

                  <div className="mt-4 pt-3 border-t border-[#dcdcde] flex items-center justify-between">
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
                  {meta.heroImage ? (
                    <div className="relative">
                      <img src={meta.heroImage} alt="featured" className="w-full h-28 object-cover rounded border border-slate-100" />
                      <button onClick={() => setMeta((p) => ({ ...p, heroImage: "" }))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">×</button>
                    </div>
                  ) : null}
                  <div className={meta.heroImage ? "mt-2" : ""}>
                    <input ref={heroInputRef} type="file" accept="image/*" disabled={heroUploading} onChange={(e) => handleHeroImage(e.target.files[0])} />
                    {heroUploading && <div className="mt-2 flex items-center gap-2 text-xs text-[#1A614F] font-semibold"><Loader size={12} className="animate-spin" /> Uploading…</div>}
                  </div>
                  <input value={meta.imageAlt} onChange={(e) => setMeta((p) => ({ ...p, imageAlt: e.target.value }))} placeholder="Alt text for SEO"
                    className="mt-2 w-full px-2.5 py-1.5 text-[12px] rounded border border-[#c3c4c7] focus:outline-none focus:border-[#2271b1]" />
                </div>
              </div>

              {/* POST SETTINGS / SEO BOX */}
              <div className="meta-box">
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
                        <div key={d.key} className="flex items-center justify-between gap-2 p-2 border border-[#dcdcde] rounded">
                          <div className="min-w-0">
                            <div className="text-[12px] font-semibold text-[#1d2327] truncate">{d.data.meta?.title || "Untitled"}</div>
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

// small labelled field used in the settings box
function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block mb-1 text-[11px] font-semibold text-[#50575e]">{label}</span>
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f0f0f1" }}>
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