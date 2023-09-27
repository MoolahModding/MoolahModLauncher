const fs = require("node:fs");
const path = require("node:path");

let config;

const defaultConfig = {
  keepLauncherOpen: false,
  gameDirectory: ""
}

function load() {
  if(!fs.existsSync("./config.json")) {
    fs.writeFileSync("./config.json", JSON.stringify(defaultConfig, null, 2));
  }

  config = JSON.parse(fs.readFileSync("./config.json"));
}

function save() {
  fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));
}

function set(name, newValue) {
  console.log(config);
  config[name] = newValue;
}

function get(name) {
  return config[name];
}

function isWinGDK() {
  const gameDir = get("gameDirectory")
  return fs.existsSync(path.join(gameDir, "appxmanifest.xml"));
}

function getModsDirectory() {
  const gameDir = get("gameDirectory")
  const binaryType = isWinGDK() ? "WinGDK" : "Win64"
  return path.join(gameDir, `PAYDAY3/Binaries/${binaryType}/mods`)
}

function getGameExecutable() {
  const gameDir = get("gameDirectory")
  const binaryType = isWinGDK() ? "WinGDK" : "Win64"
  return path.join(gameDir, `PAYDAY3/Binaries/${binaryType}/PAYDAY3Client-${binaryType}-Shipping.exe`)
}

module.exports = {
  loadConfig: load,
  saveConfig: save,
  setConfigValue: set,
  getConfigValue: get,
  getModsDirectory,
  getGameExecutable
}