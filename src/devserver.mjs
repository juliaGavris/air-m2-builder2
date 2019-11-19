import path from 'path';
import webpack from 'webpack';
import webpackConfig from '../webpack.config.js';
import webpackCompileConfig from '../webpack-compiler.config.mjs';
import WebpackDevServer from 'webpack-dev-server';
import App from '../src/app.mjs';
import BuildProd from '../src/buildprod.mjs';
import after from '../src/after.mjs';

export default class DevServer {
  constructor (options) {
    this.options = options;
  }

  precompile () {
    const { buildMode, devServer, dirname, currentModule } = this.options;

    return new Promise(res => {
      webpack(webpackConfig(buildMode, devServer, dirname, this.options)).run(err => {
        if (err) throw err;

        const compileOpt = {
          buildMode,
          entry: `${dirname}/src/index.js`,
          path: path.resolve(dirname, './dist/'),
          filename: `${currentModule}/index.js`
        };
        this.compiler = webpack(webpackCompileConfig(compileOpt));

        res();
      });
    });
  }

  build () {
    new BuildProd(this.options).next();
  }

  run () {
    const {
      dirname,
      units,
      currentModule,
      optional,
      latency,
      port,
      execute,
      buildMode,
      devServer
    } = this.options;

    const app = new App({ execute });

    const server = new WebpackDevServer(this.compiler, {
      headers: { 'Access-Control-Allow-Origin': '*' },
      disableHostCheck: true,
      stats: { colors: true },
      contentBase: [`${dirname}/dist`],
      publicPath: `/${units.dirS}/`,
      hot: true,
      inline: true,
      watchContentBase: true,
      after: after({ dirname, currentModule, units, optional, app, latency, buildMode, devServer })
    });

    server.listen(port, '0.0.0.0', err => {
      if (err) throw err;
      console.log(`Starting root server on 0.0.0.0:${port}`);
    });
  }
}
