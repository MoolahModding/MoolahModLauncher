const AdmZip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');

const config = require('./config')
const {dialog, app} = require("electron");

class PD3ModInstallPackage {
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

        // TODO: enable UE4SS mod in mods.txt
    }
}

class PakModInstallPackage {
    constructor(pakPath) {
        this.pakPath = pakPath
    }

    async install() {
        // TODO: auto generate meta:
        //       1. id pak name sanitized
        //       2. version (0.0.0)
        //       3. environment (*)
        //       4. schemaVersion (1)

        // TODO: copy pak to game
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
    if (packagePath.toLowerCase().endsWith(".pak")) {
        return new PakModInstallPackage(packagePath)
    }

    const zip = new AdmZip(packagePath)
    return new PD3ModInstallPackage(zip)
}

function installAllPackages(packagePaths) {
    let failedInstalls = [];

    let packagePromises = packagePaths.map(packagePath => {
        let installPackage = fromPath(packagePath)
        return installPackage.install()
            .catch(reason => failedInstalls.push({packagePath: packagePath, error: reason}));
    });

    Promise.all(packagePromises)
        .finally(() => {
            // TODO: do not quit when installed from window
            if (failedInstalls.length === 0) {
                dialog.showMessageBox(null, {
                    title: "All mods installed successfully",
                    message: `Successfully installed all mods`
                }).then(() => app.quit());
            } else {
                let failedModErrors = failedInstalls
                    .map(install => `${install.packagePath}: ${install.error}`)
                    .join('\n');
                dialog.showErrorBox("Failed to install mod packages", "Failed to install mod(s):\n" + failedModErrors);
                app.quit()
            }
        });
}

module.exports = {
    installAllPackages
}
