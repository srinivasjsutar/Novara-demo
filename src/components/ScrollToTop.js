import { useEffect } from "react";
import { usePageContext } from "vike-react/usePageContext";

export default function ScrollToTop() {
  const { urlPathname } = usePageContext();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [urlPathname]);

  return null;
}