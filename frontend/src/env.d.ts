/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // 其他Vite环境变量...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }