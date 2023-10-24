import type { Configuration } from "webpack"

import { commonRules } from "./webpack.rules"

const mainConfig: Configuration = {
  entry: "./src/main.ts",
  module: {
    rules: commonRules,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
  // ! prevent `UnhandledSchemeError` ref: https://github.com/webpack/webpack/issues/13290
  externals: {
    "node:fs": {},
    "node:process": {},
    "node:path": {}
  }
}

export { mainConfig }