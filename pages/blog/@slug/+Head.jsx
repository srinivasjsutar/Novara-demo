import { usePageContext } from "vike-react/usePageContext"
import { BLOGS } from "../../../src/data/blogs"

export default function Head() {
  const pageContext = usePageContext()
  const slug = pageContext.routeParams?.slug
  const blog = BLOGS.find((b) => b.slug === slug)

  // Read directly from data — don't rely on pageContext.description
  const title = blog?.title || 'Blog | SkyUp Digital'
  const description = blog?.description || ''
 const keywords = blog?.keywords || ''

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {slug && (
        <link rel="canonical" href={`https://www.novaranatureestates.com/blogs/${slug}`} />
      )}
    </>
  )
}