// pages/admin/blog-builder/+config.js
//
// IMPORTANT: this file MUST be named "+config.js" (with the leading "+").
// A plain "config.js" is ignored by Vike — that is why the page settings here
// never took effect before.
//
// The blog builder is an auth-gated, browser-only tool (localStorage,
// contentEditable, document.execCommand). Render it purely on the client so it
// always mounts and is interactive; there is no server-render to "hydrate",
// which was the step leaving the Sign In button dead on the static deploy.
// prerender:true still emits a small static HTML shell so the URL exists.

export default {
  ssr: false,
  prerender: true,
  title: "Blog Builder — Novara Nature Estates",
};