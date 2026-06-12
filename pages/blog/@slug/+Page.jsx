import { usePageContext } from "vike-react/usePageContext";
import BlogDetail from "../../../src/pages/BlogDetails";

export default function Page() {
  const pageContext = usePageContext();
  const slug = pageContext.routeParams?.slug;
  return <BlogDetail vikeSlug={slug} />;
}