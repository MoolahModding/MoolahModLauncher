import type { ModuleOptions, RuleSetRule } from "webpack"

type RuleOptions = Required<ModuleOptions>["rules"]

const commonRules: RuleOptions = [
  {
    test: /native_modules[/\\].+\.node$/,
    use: "node-loader",
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: "@vercel/webpack-asset-relocator-loader",
      options: {
        outputAssetBase: "native_modules",
      },
    },
  },
  {
    // TODO: Add react settings
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: "ts-loader",
      options: {
        transpileOnly: true,
      },
    },
  },
]

const rendererAdditionalRules: RuleSetRule[] = [
  {
    // XXX: should use `MiniCssExtractPlugin.loader` in production?
    test: /\.css$/,
    use: ["style-loader", "css-loader"],
  },
]

const rendererRules: RuleOptions = [...commonRules, ...rendererAdditionalRules]

export { commonRules, rendererRules }
