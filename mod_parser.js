const AdmZip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');

const config = require('./config')

class InstallPackage {
    constructor(zip) {
        this.zip = zip

        const metaEntry = zip.getEntry('pd3mod.json')
        if (!metaEntry) {
            throw Error('pd3mod.json was not found in the .pd3mod package')
        }
        const metaContent = zip.readFile(metaEntry).toString('utf8')
        this.meta = JSON.parse(metaContent)
    }

    async install() {
        const id = this.meta["id"]
        const iconPath = this.meta["icon"]
        const gamePath = config.getConfigValue("gameDirectory")
        const modPath = path.join(gamePath, "PAYDAY3/Binaries/Win64/mods", id)
        const pakPath = path.join(gamePath, `PAYDAY3/Content/Paks/~mods/0000-${id}`)

        await fs.ensureDir(modPath)
        await fs.ensureDir(pakPath)

        const pd3mod = this.zip.getEntry("pd3mod.json")
        const icon = this.zip.getEntry(iconPath)
        const ue4ssLua = getCaseInsensitiveEntry(this.zip, "scripts/")
        const ue4ssDlls = getCaseInsensitiveEntry(this.zip, "dlls/")
        const pak = getCaseInsensitiveEntry(this.zip, "paks/")

        this.zip.extractEntryTo(pd3mod, modPath, true, true, false, null)
        this.zip.extractEntryTo(icon, modPath, true, true, false, null)
        if (ue4ssLua)
            this.zip.extractEntryTo(ue4ssLua, path.join(modPath, "scripts"), false, true, false, null)
        if (ue4ssDlls)
            this.zip.extractEntryTo(ue4ssDlls, path.join(modPath, "dlls"), false, true, false, null)
        if (pak)
            this.zip.extractEntryTo(pak, path.join(modPath, pakPath), false, true, false, null)
    }
}

function getCaseInsensitiveEntry(zip, path) {
    for (let entry of zip.getEntries()) {
        if (entry.entryName.toLowerCase() === path.toLowerCase()) {
            return entry
        }
    }
}

function fromPath(packagePath) {
    const zip = new AdmZip(packagePath)
    return new InstallPackage(zip)
}

module.exports = {
    InstallPackage,
    fromPath
}
