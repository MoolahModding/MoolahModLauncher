import type { ForgeConfig } from '@electron-forge/shared-types'

const config: ForgeConfig = {
    packagerConfig: {
        asar: true,
    },
    rebuildConfig: {},
    makers: [
        // Only Windows supported for now
        // We can add darwin/linux later for Wine/Proton users
        {
            name: '@electron-forge/maker-squirrel',
            config: {},
        }
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
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
