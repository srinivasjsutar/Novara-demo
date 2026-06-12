
// pages/admin/blog-builder/+Page.jsx
// Vike page wrapper — wraps the builder with AuthProvider

import { AuthProvider } from "../../../src/context/AuthContext";
import NovaraBlogBuilder from "../../../src/pages/BlogBuilder";

export default function Page() {
  return (
    <AuthProvider>
      <NovaraBlogBuilder />
    </AuthProvider>
  );
}