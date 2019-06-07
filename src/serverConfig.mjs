import { existsSync, readFileSync } from "fs";
import path from "path";
import { Utils } from "../src/utils.mjs";

const utils = new Utils();

const PORT = 9000;
const BUILDER_NAME = "air-m2-builder2";
const PKG_REQUIRED_BY = "_requiredBy";
let buildMode = null;
let devServer = false;

export default function serverConfig(options = {}) {
  if (!options.hasOwnProperty("customDir")) {
    options.customDir = false;
  }

  let entryUnit = "master";

  const dirname = options.customDir ? options.customDir : path.resolve(path.dirname(""));
  const currentName = dirname.match(/[-\w]+$/)[0];
  const units = { dir: "m2unit", requires: "m2units" };
  units.dirS = `${units.dir}s`;

  let revision = null;
  for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.indexOf("revision:") > -1) {
      revision = arg.split(":")[1];
      delete process.argv[i];
    } else if (arg.match(/^--build-mode\b/) !== null) {
      const mode = arg.split(":")[1];
      if (!["production", "development"].includes(mode)) {
        throw `Error: Unknown '--build-mode' parameter '${mode}'. Only 'production' and 'development' accepted.`;
      }
      buildMode = mode;
    } else if (arg.match(/^--dev-server\b/) !== null) {
      const dev = arg.split(":")[1];
      if (dev === undefined) {
        devServer = true;
      } else if (!["true", "false"].includes(dev)) {
        throw `Error: Unknown '--build-mode' parameter '${dev}'. Only 'true' and 'false' accepted.`;
      } else {
        devServer = JSON.parse(dev);
      }
    }
  }

  if (buildMode === null) {
    buildMode = devServer ? "development" : "production";
  }

  if (process.env.hasOwnProperty("STATIC_VERSION")) {
    revision = process.env.STATIC_VERSION;
  }

  const gameConfigFilename = "air-m2.config.json";
  const gameConfigPath = `${dirname}/${gameConfigFilename}`;
  let port = PORT;
  let master = null;
  const latency = [];
  if (existsSync(gameConfigPath)) {
    const json = JSON.parse(readFileSync(gameConfigPath, "utf8"));
    port = json.port || port;
    entryUnit = json["entry-unit"] || "master";
    if (json.hasOwnProperty("master")) {
      master = json.master;
    }
    if (json.hasOwnProperty("latency") && json.latency instanceof Array) {
      latency.push(...json.latency);
    }
  }

  const pkgjsonPath = `${dirname}/node_modules/${BUILDER_NAME}/package.json`;
  if (master === null && existsSync(pkgjsonPath)) {
    const json = JSON.parse(readFileSync(pkgjsonPath, "utf8"));
    if (
      json.hasOwnProperty(PKG_REQUIRED_BY) &&
      json[PKG_REQUIRED_BY] instanceof Array &&
      json[PKG_REQUIRED_BY].length > 0
    ) {
      const __required = json[PKG_REQUIRED_BY][0].match(/[\w-]+$/g);
      master = __required === null ? currentName : __required[0];
    } else {
      throw "Error: Cannot find source of 'm2.js' file.";
    }
  }

  const optional = new Set();
  const unitsPath = `${dirname}/${units.dirS}.json`;
  if (existsSync(unitsPath)) {
    const additionals = utils.getAdditional(unitsPath, units.requires, true);
    if (additionals != null) {
      utils.addUnique(optional, additionals);
    }
  }
  if (existsSync(`${dirname}/package.json`)) {
    const additionals = utils.getAdditional(`${dirname}/package.json`, units.requires);
    if (additionals != null) {
      utils.addUnique(optional, additionals);
    }
  }
  if (master !== currentName) {
    const pkgjsonPath = `${dirname}/node_modules/${master}/package.json`;
    if (existsSync(pkgjsonPath)) {
      const additionals = utils.getAdditional(pkgjsonPath, units.requires);
      if (additionals != null) {
        utils.addUnique(optional, additionals);
      }
    }
  }

  const masterPath = [`${dirname}/${master === currentName ? "" : `node_modules/${master}`}`, "/src/m2.js"];
  if (!existsSync(masterPath.join(""))) {
    throw `Error: Cannot find 'm2.js' on source '${masterPath.join("")}'`;
  }

  return {
    entryUnit,
    port,
    buildMode,
    devServer,
    dirname,
    currentName,
    master,
    masterPath,
    units,
    optional,
    latency,
    execute: options.execute,
    revision
  };
}
