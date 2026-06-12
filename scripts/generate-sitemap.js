/**
 * generate-sitemap.js
 *
 * Automatically generates all sitemap XML files from your data sources.
 * Runs automatically before every build via the "prebuild" npm script.
 *
 * To run manually:  node scripts/generate-sitemap.js
 *
 * What it generates:
 *   public/sitemap.xml          → index of all sub-sitemaps
 *   public/sitemap-blog.xml     → one <url> per blog slug (from src/data/blogs.js)
 *   public/sitemap-pages.xml    → static pages
 *   public/sitemap-projects.xml → project pages (edit PROJECTS array below)
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { BLOGS } from '../src/data/blogs.js'

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL = 'https://www.novaranatureestates.com'

/**
 * Static pages — add or remove entries here when you add new pages.
 * slug: '' means the homepage.
 */
const STATIC_PAGES = [
  { slug: '',                  changefreq: 'monthly', priority: '1.0' },
  { slug: 'why-novara',        changefreq: 'monthly', priority: '0.7' },
  { slug: 'projects',          changefreq: 'monthly', priority: '0.7' },
  { slug: 'blogs',             changefreq: 'weekly',  priority: '0.8' },
  { slug: 'privacy-policy',    changefreq: 'yearly',  priority: '0.3' },
  { slug: 'terms-conditions',  changefreq: 'yearly',  priority: '0.3' },
  { slug: 'contact-us',        changefreq: 'monthly', priority: '0.6' },
]

/**
 * Projects — add a new entry here whenever you launch a new project.
 * slug: the URL path segment (e.g. 'ecovara-bangalore' → /ecovara-bangalore)
 */
const PROJECTS = [
  { slug: 'ecovara-bangalore', changefreq: 'daily', priority: '0.8' },
  // { slug: 'your-next-project', changefreq: 'daily', priority: '0.8' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir  = resolve(__dirname, '../public')

/** ISO-8601 timestamp in IST (+05:30) */
function nowIST() {
  const now = new Date()
  // Convert UTC → IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000
  const ist = new Date(now.getTime() + istOffset)
  const iso = ist.toISOString().replace('Z', '+05:30')
  return iso
}

/**
 * Parse a blog date string like "May 3, 2026" → ISO-8601 string in IST.
 * Falls back to nowIST() if parsing fails.
 */
function parseBlogDate(dateStr) {
  if (!dateStr) return nowIST()
  const parsed = new Date(dateStr)
  if (isNaN(parsed.getTime())) return nowIST()
  const istOffset = 5.5 * 60 * 60 * 1000
  const ist = new Date(parsed.getTime() + istOffset)
  return ist.toISOString().replace('Z', '+05:30')
}

function writeFile(filename, content) {
  const filePath = resolve(publicDir, filename)
  writeFileSync(filePath, content, 'utf8')
  console.log(`✅  Written: public/${filename}`)
}

// ─── Generators ───────────────────────────────────────────────────────────────

function generateBlogSitemap() {
  const now = nowIST()
  const urls = BLOGS.map((blog) => {
    const lastmod = parseBlogDate(blog.date)
    return `  <url>
    <loc>${BASE_URL}/blogs/${blog.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

function generatePagesSitemap() {
  const now = nowIST()
  const urls = STATIC_PAGES.map(({ slug, changefreq, priority }) => {
    const loc = slug ? `${BASE_URL}/${slug}` : `${BASE_URL}/`
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

function generateProjectsSitemap() {
  const now = nowIST()
  const urls = PROJECTS.map(({ slug, changefreq, priority }) => `  <url>
    <loc>${BASE_URL}/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

function generateSitemapIndex() {
  const now = nowIST()
  const sitemaps = ['sitemap-pages.xml', 'sitemap-blog.xml', 'sitemap-projects.xml']
  const entries = sitemaps.map((name) => `  <sitemap>
    <loc>${BASE_URL}/${name}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log(`\n🗺️  Generating sitemaps from ${BLOGS.length} blog(s) and ${PROJECTS.length} project(s)...\n`)

writeFile('sitemap-blog.xml',     generateBlogSitemap())
writeFile('sitemap-pages.xml',    generatePagesSitemap())
writeFile('sitemap-projects.xml', generateProjectsSitemap())
writeFile('sitemap.xml',          generateSitemapIndex())

console.log('\n✨  All sitemaps updated successfully!\n')