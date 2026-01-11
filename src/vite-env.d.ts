/// <reference types="vite/client" />

// For Vercel deployment: Make API URL optional
// This allows the app to build even if VITE_API_URL is not set
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

