import { existsSync, writeFileSync, readFileSync } from "node:fs"
import path from "node:path"
import { exit } from "node:process"

export interface ConfigType {
  keepLauncherOpen: boolean,
  gameDirectory: string
}

type ConfigKey = keyof ConfigType

const defaultConfig = {
  keepLauncherOpen: false,
  gameDirectory: ""
} as const satisfies ConfigType

const defaultConfigPath = "./config.json" as const

class Config {
  private config: ConfigType
  private configPath: string

  constructor(config: ConfigType, configPath: string) {
    this.config = config
    this.configPath = configPath
  }

  public setConfigValue<T extends ConfigKey>(name: T, newValue: ConfigType[T]) {
    const oldValue = this.config[name]
    this.config[name] = newValue
    try {
      this.save()
    } catch (err) {
      console.error(err)
      this.config[name] = oldValue
    }
  }

  public getConfigValue<T extends ConfigKey>(name: T): ConfigType[T] {
    return this.config[name]
  }

  private save() {
    writeFileSync(this.configPath, JSON.stringify(this.config, null, 2))
  }

  public static load(configPath?: string): Config {
    const confPath = configPath ?? defaultConfigPath
    if (existsSync(confPath)) {
      try {
        const configFile = readFileSync(confPath)
        return new Config(JSON.parse(configFile.toString()), confPath)
      } catch (err) {
        console.error(err)
        exit(1)
      }
    } else {
      writeFileSync(confPath, JSON.stringify(defaultConfig, null, 2))
      return new Config(defaultConfig, confPath)
    }
  }
}

export const config = Config.load()

const gameDir = config.getConfigValue("gameDirectory")
const binaryType = isWinGDK() ? "WinGDK" : "Win64"

function isWinGDK(): boolean {
  return existsSync(path.join(gameDir, "appxmanifest.xml"))
}

export function getModsDirectory(): string {
  return path.join(gameDir, `PAYDAY3/Binaries/${binaryType}/mods`)
}

export function getGameExecutable(): string {
  return path.join(gameDir, `PAYDAY3/Binaries/${binaryType}/PAYDAY3Client-${binaryType}-Shipping.exe`)
}
