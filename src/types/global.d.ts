import type { MMLConfigType, MMLConfigKeyType } from "./config"

declare global {
  interface Window {
    moolah: {
      config: {
        setConfigValue: <T extends MMLConfigKeyType>(
          key: T,
          value: MMLConfigType[T]
        ) => Promise<void>
        getConfigValue: <T extends MMLConfigKeyType>(key: T) => MMLConfigType[T]
      }
      events: {
        launchGame: () => void
        installMods: (paths: string[]) => void
      }
    }
    // TODO: add types defined on preload.ts
  }

  declare const MAIN_WINDOW_WEBPACK_ENTRY: string
  declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
}
