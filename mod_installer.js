const AdmZip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');
const toposort = require('toposort')
const {globSync} = require('glob')

const config = require('./config')
const {dialog, app} = require("electron");
const {getModsDirectory} = require("./config");

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
        const modPath = path.join(getModsDirectory(), id)
        const pakPath = path.join(gamePath, `PAYDAY3/Content/Paks/~mods/0000-${id}`)

        await fs.ensureDir(modPath)

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
            await this.#enableUe4ssMod(id)
        if (pak)
            await fs.ensureDir(pakPath)
            this.zip.extractEntryTo(pak, path.join(modPath, pakPath), false, true, false, null)
    }

    async #enableUe4ssMod(id) {
        const modsTxt = path.join(getModsDirectory(), "mods.txt")
        fs.ensureFile(modsTxt)

        const content = await fs.readFile(modsTxt, 'utf8')
        const lines = content.split('\n')

        const keybindsIndex = lines.findIndex(line => line.toLowerCase().startsWith('keybinds'))
        let newIndex = keybindsIndex

        for (let i = keybindsIndex - 1; i >= 0; i--) {
            if (!lines[i].startsWith(';') && lines[i].trim()) {
                newIndex = i + 1
                break
            }
        }

        lines.splice(newIndex, 0, `${id} : 1`);
        const newContent = lines.join('\n');
        await fs.writeFile(path, newContent);
    }
}

class PakModInstallPackage {
    constructor(packagePath) {
        this.packagePath = packagePath
    }

    async install() {
        const gamePath = config.getConfigValue("gameDirectory")
        const id = this.#createIdFromPackagePath(this.packagePath)
        const modDirPath = path.join(config.getModsDirectory(), id) // FIXME: handle WinGDK
        const pakDirPath = path.join(gamePath, `PAYDAY3/Content/Paks/~mods/0000-${id}`)

        await fs.ensureDir(modDirPath)
        await fs.ensureDir(pakDirPath)

        // Auto-generated pd3mod.json, bare minimum properties
        const modMeta = {
            id: id,
            version: '0.0.0',
            environment: '*',
            schemaVersion: 1,
        };

        const modMetaStr = JSON.stringify(modMeta, null, 2);

        // Write to the file
        await fs.writeFile(path.join(modDirPath, 'pd3mod.json'), modMetaStr);
        const pakDestinationPath = path.join(pakDirPath, path.basename(this.packagePath))
        await fs.copy(this.packagePath, pakDestinationPath)
    }

    #createIdFromPackagePath(pakPath) {
        let id = path.parse(pakPath).name
        if (id.endsWith("_P")) {
            id = id.slice(0, -2)
        }
        id = id.toLowerCase()

        // Remove illegal characters
        id = id.replace(/[^a-z0-9-_]/g, '')
        id = id.replace(/.*pakchunk[0-9]+-/g, '')

        // Ensure string starts with [a-z]
        if (/^[a-z]/.test(id)) {
            id = id.replace(/^[^a-z]+/, '');
        } else {
            id = 'z' + id;
        }

        id = id.substring(0, 64)
        return id
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
    if (path.extname(packagePath).toLowerCase() === ".pak") {
        return new PakModInstallPackage(packagePath)
    }

    const zip = new AdmZip(packagePath)
    return new PD3ModInstallPackage(zip)
}

function resolveLoadOrder() {
    nodes = [] // All mod ids
    edges = [] // Dependencies between mod ids
    metaFiles = globSync(path.join(config.getModsDirectory(), "*/pd3mod.json"), {windowsPathsNoEscape: true})

    for (let metaFile of metaFiles) {
        const meta = JSON.parse(fs.readFileSync(metaFile))
        nodes.push(meta["id"])
        if (meta["depends"]) {
            for (let dependencyId in meta["depends"]) {
                edges.push([meta["id"], dependencyId])
            }
        }
    }

    return toposort.array(nodes, edges)
}

function updateLoadOrder() {
    const loadOrder = resolveLoadOrder()
    // TODO: update mods.txt and pak dirs
}

function installAllPackages(packagePaths, quitOnComplete) {
    let failedInstalls = [];

    let packagePromises = packagePaths.map(packagePath => {
        let installPackage = fromPath(packagePath)
        return installPackage.install()
            .catch(reason => failedInstalls.push({packagePath: packagePath, error: reason}));
    });

    Promise.all(packagePromises)
        .finally(() => {
            updateLoadOrder()
            if (failedInstalls.length === 0) {
                dialog.showMessageBox(null, {
                    title: "All mods installed successfully",
                    message: `Successfully installed all mods`
                }).then(() => {
                    if (quitOnComplete) app.quit()
                });
            } else {
                let failedModErrors = failedInstalls
                    .map(install => `${install.packagePath}: ${install.error}`)
                    .join('\n');
                dialog.showErrorBox("Failed to install mod packages", "Failed to install mod(s):\n" + failedModErrors);
                if (quitOnComplete) app.quit()
            }
        });
}

module.exports = {
    installAllPackages
}
