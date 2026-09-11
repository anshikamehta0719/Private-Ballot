/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BALLOT_CONTRACT_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
