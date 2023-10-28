import type { Configuration } from "webpack"

import { commonPlugins } from "./webpack.plugins"
import { rendererRules } from "./webpack.rules"

const rendererConfig: Configuration = {
  // XXX: should add `optimization` key for production?
  // XXX: should add `cache` key for developing?
  devtool: "inline-source-map",
  module: {
    rules: rendererRules,
  },
  plugins: commonPlugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
  // ! prevent `UnhandledSchemeError` ref: https://github.com/webpack/webpack/issues/13290
  // TODO: remove modules exclude node:process
  externals: {
    "node:fs": {},
    "node:fs/promises": {},
    "node:process": {},
    "node:path": {},
  },
}

export { rendererConfig }
