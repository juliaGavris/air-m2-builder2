import path from "path";
import webpack from "webpack";
import webpackConfig from "../webpack.config.js";
import webpackCompileConfig from "../webpack-compiler.config.mjs";
import WebpackDevServer from "webpack-dev-server";
import App from "../src/app.mjs";
import BuildProd from "../src/buildprod.mjs";
import after from "../src/after.mjs";

export default class DevServer {
  constructor(options) {
    this.options = options;
  }

  precompile() {
    const { buildMode, devServer, dirname, currentName } = this.options;

    return new Promise(res => {
      webpack(webpackConfig(buildMode, devServer, dirname, this.options)).run(err => {
        if (err) throw err;

        const compileOpt = {
          buildMode,
          entry: `${dirname}/src/index.js`,
          path: path.resolve(dirname, "./dist/"),
          filename: `${currentName}/index.js`
        };
        this.compiler = webpack(webpackCompileConfig(compileOpt));

        res();
      });
    });
  }

  build() {
    new BuildProd(this.options).next();
  }

  run() {
    const {
      dirname,
      master,
      units,
      currentName,
      optional,
      latency,
      port,
      execute,
      buildMode,
      devServer
    } = this.options;

    const app = new App({ execute });

    const server = new WebpackDevServer(this.compiler, {
      headers: { "Access-Control-Allow-Origin": "*" },
      disableHostCheck: true,
      stats: { colors: true },
      contentBase: [`${dirname}/node_modules/${master}/dist`, `${dirname}/src`],
      publicPath: `/${units.dirS}/`,
      hot: true,
      inline: true,
      watchContentBase: true,
      after: after({ dirname, currentName, units, optional, app, latency, buildMode, devServer })
    });

    server.listen(port, "0.0.0.0", err => {
      if (err) throw err;
      console.log(`Starting root server on 0.0.0.0:${port}`);
    });
  }
}
