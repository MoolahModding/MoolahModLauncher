import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin"
import type { WebpackPluginInstance } from "webpack"

const commonPlugins: WebpackPluginInstance[] = [
  new ForkTsCheckerWebpackPlugin(),
]

export { commonPlugins }
