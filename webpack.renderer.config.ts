import { Configuration } from "webpack"
import { rendererRules } from "./webpack.rules"
import { commonPlugins } from "./webpack.plugins"

const rendererConfig: Configuration = {
  // XXX: should add `optimization` key for production?
  // XXX: should add `cache` key for developing?
  module: {
    rules: rendererRules,
  },
  plugins: commonPlugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
  // ! prevent `UnhandledSchemeError` ref: https://github.com/webpack/webpack/issues/13290
  externals: {
    "node:fs": {},
    "node:process": {},
    "node:path": {}
  }
}

export { rendererConfig }