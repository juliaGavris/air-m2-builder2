#!/usr/bin/env node --experimental-modules

import fs from "fs";
import path from "path";
import webpack from "webpack";
import webpackConfig from "../webpack.config.js";
import webpackCompileConfig from "../webpack-compiler.config.mjs";
import WebpackDevServer from "webpack-dev-server";
import after from "../src/app.mjs";
import prod from "../src/prod.mjs";
import utils from "../src/utils.mjs";

const dirname = path.resolve(path.dirname(""));
const currentName = dirname.match(/[-\w]+$/)[0];
const units = { dir: "m2unit", requires: "m2units" };
units.dirS = `${units.dir}s`;

const gameConfigFilename = "air-m2.config.json";
const gameConfigPath = `${dirname}/${gameConfigFilename}`;

let buildMode;
if (process.argv[2] === undefined) {
  buildMode = "dev";
} else {
  const buildArgs = process.argv[2].split(":");
  if (buildArgs[0] !== "--build") {
    throw `Error: Unknown argument '${buildArgs[0]}'. Only '--build:mode' accepted.`;
  }

  buildMode = buildArgs[1];
  if (!["prod", "dev"].includes(buildMode)) {
    throw `Error: Unknown startup parameter '${buildMode}'. Only 'prod' and 'dev' accepted.`;
  }
}

const mode = buildMode === "prod" ? "production" : "development";
let port = 9000;
let master = currentName;
if (fs.existsSync(gameConfigPath)) {
  const json = JSON.parse(fs.readFileSync(gameConfigPath, "utf8"));
  port = json.port || port;
  master = json.master || master;
}

const optional = [];
const unitsPath = `${dirname}/${units.dirS}.json`;
if (fs.existsSync(unitsPath)) {
  const additionals = utils.getAdditional(unitsPath, units.requires, true);
  if (additionals != null) {
    utils.addUnique(optional, additionals);
  }
}
if (fs.existsSync(`${dirname}/package.json`)) {
  const additionals = utils.getAdditional(`${dirname}/package.json`, units.requires);
  if (additionals != null) {
    utils.addUnique(optional, additionals);
  }
}
if (master !== currentName) {
  const pkgjsonPath = `${dirname}/node_modules/${master}/package.json`;
  if (fs.existsSync(pkgjsonPath)) {
    const additionals = utils.getAdditional(pkgjsonPath, units.requires);
    if (additionals != null) {
      utils.addUnique(optional, additionals);
    }
  }
}

const masterPath = `${dirname}/${master === currentName ? "" : `node_modules/${master}/`}src/m2.js`;
if (!fs.existsSync(masterPath)) {
  throw `Error: Cannot find 'm2.js' on source '${masterPath}'`;
}

webpack(webpackConfig(mode, dirname, masterPath)).run(function(err) {
  if (err) throw err;

  const compileOpt = {
    mode,
    entry: `${dirname}/src/index.js`,
    path: path.resolve(dirname, "./dist/"),
    filename: `${currentName}/index.js`
  };
  const compiler = webpack(webpackCompileConfig(compileOpt));

  if (buildMode === "prod") {
    prod({ dirname, currentName, units, optional });
  } else {
    const server = new WebpackDevServer(compiler, {
      headers: { "Access-Control-Allow-Origin": "*" },
      disableHostCheck: true,
      stats: { colors: true },
      contentBase: `${dirname}/node_modules/root_server/dist`,
      publicPath: `/${units.dirS}/`,
      hot: true,
      inline: true,
      watchContentBase: true,
      after: after({ dirname, currentName, units, optional })
    });

    server.listen(port, "0.0.0.0", err => {
      if (err) throw err;
      console.log(`Starting root server on 0.0.0.0:${port}`);
    });
  }
});
