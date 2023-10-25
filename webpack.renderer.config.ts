import type { Configuration } from "webpack"

import { commonPlugins } from "./webpack.plugins"
import { rendererRules } from "./webpack.rules"

const rendererConfig: Configuration = {
  // XXX: should add `optimization` key for production?
  // XXX: should add `cache` key for developing?
  module: {
    rules: rendererRules,
  },
  plugins: commonPlugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
  // ! prevent `UnhandledSchemeError` ref: https://github.com/webpack/webpack/issues/13290
  externals: {
    "node:fs": {},
    "node:process": {},
    "node:path": {},
  },
}

export { rendererConfig }
