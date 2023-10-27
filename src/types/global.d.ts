import type { MMLConfig } from "./config"

declare global {
  interface Window {
    config: MMLConfig
    // TODO: add types defined on preload.ts
  }

  declare const MAIN_WINDOW_WEBPACK_ENTRY: string
  declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
}
