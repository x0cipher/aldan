"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

export default function ApiDocsPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <ApiReferenceReact
        configuration={{
          spec: {
            url: "/api/v1/openapi.json",
          },
          theme: "kepler",
          darkMode: true,
          hideModels: false,
          showSidebar: true,
        }}
      />
    </div>
  );
}
