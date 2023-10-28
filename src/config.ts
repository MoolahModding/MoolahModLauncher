import { writeFile, readFile, lstat } from "node:fs/promises"
import path from "node:path"
import { exit } from "node:process"

import type { ConfigType } from "./types/config"

type ConfigKey = keyof ConfigType

const defaultConfig = {
  keepLauncherOpen: false,
  gameDirectory: "",
} as const satisfies ConfigType

const defaultConfigPath = "./config.json" as const

class ConfigInternal {
  private config: ConfigType
  private configPath: string

  constructor(config: ConfigType, configPath: string) {
    this.config = config
    this.configPath = configPath
  }

  public async setConfigValue<T extends ConfigKey>(
    name: T,
    newValue: ConfigType[T]
  ) {
    const oldValue = this.config[name]
    this.config[name] = newValue
    try {
      await this.save()
    } catch (err) {
      console.error(err)
      this.config[name] = oldValue
    }
  }

  public getConfigValue<T extends ConfigKey>(name: T): ConfigType[T] {
    return this.config[name]
  }

  private async save() {
    await writeFile(this.configPath, JSON.stringify(this.config, null, 2))
  }

  public static async load(configPath?: string): Promise<ConfigInternal> {
    const confPath = configPath ?? defaultConfigPath
    try {
      const configFile = await readFile(confPath)
      return new ConfigInternal(
        JSON.parse(configFile.toString()) as ConfigType,
        confPath
      ) // TODO: safe parse JSON
    } catch {
      try {
        await writeFile(confPath, JSON.stringify(defaultConfig, null, 2))
        return new ConfigInternal(defaultConfig, confPath)
      } catch (err) {
        console.error(err)
        exit(1)
      }
    }
  }
}

export const config = await ConfigInternal.load()

const gameDir = config.getConfigValue("gameDirectory")
const binaryType = (await isWinGDK()) ? "WinGDK" : "Win64"

async function isWinGDK(): Promise<boolean> {
  try {
    return (await lstat(path.join(gameDir, "appxmanifest.xml"))).isFile()
  } catch {
    return false
  }
}

export function getModsDirectory(): string {
  return path.join(gameDir, `PAYDAY3/Binaries/${binaryType}/mods`)
}

export function getGameExecutable(): string {
  return path.join(
    gameDir,
    `PAYDAY3/Binaries/${binaryType}/PAYDAY3Client-${binaryType}-Shipping.exe`
  )
}
