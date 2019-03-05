import fs from "fs";
import path from "path";
import Utils from "../src/utils.mjs";

const utils = new Utils();

const PORT = 9000;
const BUILDER_NAME = "air-m2-builder2";
const PKG_REQUIRED_BY = "_requiredBy";

export default class ServerConfig {
  constructor({ customDir = false }) {
    const dirname = customDir ? customDir : path.resolve(path.dirname(""));
    const currentName = dirname.match(/[-\w]+$/)[0];
    const units = { dir: "m2unit", requires: "m2units" };
    units.dirS = `${units.dir}s`;

    let buildMode = null;
    let toBuild = false;
    if (process.argv[2] === undefined) {
      buildMode = "dev";
    } else {
      const buildArgs = process.argv[2].split(":");

      if (buildArgs[0] === "--build") {
        buildMode = buildArgs[1];
        if (!["prod", "dev"].includes(buildMode)) {
          throw `Error: Unknown startup parameter '${buildMode}'. Only 'prod' and 'dev' accepted.`;
        }
        toBuild = true;
      } else {
        throw `Error: Unknown argument '${buildArgs[0]}'. Accepted only: '--build:mode'`;
      }
    }

    const gameConfigFilename = "air-m2.config.json";
    const gameConfigPath = `${dirname}/${gameConfigFilename}`;
    const mode = buildMode === "prod" ? "production" : "development";
    let port = PORT;
    let master = null;
    if (fs.existsSync(gameConfigPath)) {
      const json = JSON.parse(fs.readFileSync(gameConfigPath, "utf8"));
      port = json.port || port;
      if (json.hasOwnProperty("master")) {
        master = json.master;
      }
    }

    const pkgjsonPath = `${dirname}/node_modules/${BUILDER_NAME}/package.json`;
    if (master === null && fs.existsSync(pkgjsonPath)) {
      const json = JSON.parse(fs.readFileSync(pkgjsonPath, "utf8"));
      if (
        json.hasOwnProperty(PKG_REQUIRED_BY) &&
        json[PKG_REQUIRED_BY] instanceof Array &&
        json[PKG_REQUIRED_BY].length > 0
      ) {
        master = json[PKG_REQUIRED_BY][0].match(/[\w-]+$/g)[0];
      } else {
        throw "Error: Cannot find source of 'm2.js' file.";
      }
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

    const masterPath = [`${dirname}/${master === currentName ? "" : `node_modules/${master}`}`, "/src/m2.js"];
    if (!fs.existsSync(masterPath.join(""))) {
      throw `Error: Cannot find 'm2.js' on source '${masterPath.join("")}'`;
    }

    this.config = {
      port,
      mode,
      dirname,
      currentName,
      master,
      masterPath,
      units,
      optional,
      build: toBuild
    };
  }
}
