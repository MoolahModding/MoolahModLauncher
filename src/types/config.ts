import type { config } from "../config"

export interface ConfigType {
  keepLauncherOpen: boolean
  gameDirectory: string
}

export type MMLConfig = typeof config
