import type { Configuration } from "webpack"

import { commonRules } from "./webpack.rules"

const mainConfig: Configuration = {
  devtool: "inline-source-map",
  entry: "./src/main.ts",
  module: {
    rules: commonRules,
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
}

export { mainConfig }
