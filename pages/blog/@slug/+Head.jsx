import { usePageContext } from "vike-react/usePageContext"
import { BLOGS } from "../../../src/data/blogs"
import { buildBlogSchema } from "../../../src/utils/schema"

export default function Head() {
  const pageContext = usePageContext()
  const slug = pageContext.routeParams?.slug
  const blog = BLOGS.find((b) => b.slug === slug)

  // Read directly from data — don't rely on pageContext.description
  const title = blog?.title || 'Blog | SkyUp Digital'
  const description = blog?.description || ''
  const keywords = blog?.keywords || ''

  const schemaGraph = blog ? buildBlogSchema(blog) : []

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {slug && (
        <link rel="canonical" href={`https://www.novaranatureestates.com/blogs/${slug}`} />
      )}
      {schemaGraph.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  )
}