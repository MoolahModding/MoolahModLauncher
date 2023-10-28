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
}

export { rendererConfig }
