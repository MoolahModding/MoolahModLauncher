var fs = require("node:fs");

var config;

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

module.exports = {
  loadConfig: load,
  saveConfig: save,
  setConfigValue: set,
  getConfigValue: get
}