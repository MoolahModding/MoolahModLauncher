const AdmZip = require('adm-zip');

class InstallPackage {
    constructor(zip, meta) {
        this.zip = zip;
        this.meta = meta;
    }

    install() {
        // Installation code goes here
        // You can use this.zip and this.meta here
    }

    disable() {
        // Disable code goes here
        // You can use this.zip and this.meta here
    }
}

function installPackage(zipFilePath) {
    const zip = new AdmZip(zipFilePath)
    const meta = readAndExtractMeta(zip)
}

function readAndExtractMeta(zip) {
    const metaEntry = zip.getEntry('pd3mod.json')
    if (!metaEntry) {
        throw Error('pd3mod.json was not found in the .pd3mod package')
    }

    const metaContentBuffer = zip.readFile(metaEntry)
    const metaContentString = metaContentBuffer.toString('utf8')
    return JSON.parse(metaContentString)
}

module.exports = {
    installPackage,
}
