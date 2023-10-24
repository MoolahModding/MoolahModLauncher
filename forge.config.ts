import type { ForgeConfig } from '@electron-forge/shared-types'

import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { WebpackPlugin } from "@electron-forge/plugin-webpack"
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives"
import { mainConfig } from './webpack.main.config'
import { rendererConfig } from './webpack.renderer.config'

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    // Only Windows supported for now
    // We can add darwin/linux later for Wine/Proton users
    new MakerSquirrel(), new MakerZIP()
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      devContentSecurityPolicy: 'default-src \'self\' \'unsafe-inline\' data:; script-src \'self\' \'unsafe-eval\' \'unsafe-inline\' data:',
      mainConfig: mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [{
          html: "./src/assets/index.html",
          js: "./src/assets/index.js",
          name: "main_window",
          preload: {
            js: "./src/preload.ts"
          }
        }]
      },
    })
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'MoolahModding',
          name: 'MoolahModLauncher'
        },
        prerelease: true
      }
    }
  ]
}

export default config
