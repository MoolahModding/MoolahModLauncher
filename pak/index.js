"use strict";

const { promisify } = require("util");

const internal = require("./index.node");

class PakReader {
  constructor(inner) {
    this.inner = inner;
  }
  getMountPoint() {
    return internal.pakReaderGetMountPoint.call(this.inner);
  }
  getFiles() {
    return internal.pakReaderGetFiles.call(this.inner);
  }
  getFile(name) {
    return internal.pakReaderGetFile.call(this.inner, name);
  }
}

module.exports = {
  read: async (...args) => new PakReader(await internal.pakReaderRead(...args)),
};

