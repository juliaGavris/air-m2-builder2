import fs from "fs";
import copyfiles from "copyfiles";

export default {
  getRandomInt: function(max, min = 0) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  //
  getAdditional: function(filename, requires, all = false) {
    let optDep;
    if (!all) {
      optDep = JSON.parse(fs.readFileSync(filename, "utf8"))[requires];
    } else {
      optDep = JSON.parse(fs.readFileSync(filename, "utf8"));
    }
    return optDep == null ? optDep : Object.keys(optDep).map(key => ({ module: key, source: optDep[key] }));
  },
  //
  addUnique: function(opt, add) {
    const optMap = opt.map(e => e.module);
    add.forEach(e => {
      if (!optMap.includes(e.module)) {
        opt.push(e);
      }
    });
  },
  //
  getRequestOptions: function({ req, res, dirname, units, currentName, optional, mode = "dev" }) {
    const path = {
      fullPath: dirname + req.originalUrl
    };

    let match = req.path.match(/\.\w+$/g);
    const extension = match ? match[0] : null;
    match = req.path.match(/\/?[-\w]+\//g);
    const module = match && match.length > 1 ? match[1].slice(0, -1) : currentName;

    const fileName = path.fullPath.slice(path.fullPath.indexOf(`/${module}/`) + module.length + 2);
    path.filePath = `${dirname}/node_modules/${module}/${units.dir}/${fileName}`;
    path.resPath = `${dirname}/node_modules/${module}/src/${fileName}`;

    if (extension === ".js") {
      path.resolvePath = path.filePath;
    } else {
      path.resolvePath = path.resPath;
    }

    if (module === currentName) {
      // console.log(`GET: ${`${dirname}/src/${fileName}`} -- OK`);
      if (mode === "dev") {
        res.sendFile(`${dirname}/src/${fileName}`);
        return null;
      }
      return "currentModule";
    }

    const source = optional.find(e => e.module === module);
    if (!source) {
      console.log(`ERROR: no install source for module ${module}`);
      // console.log(`GET: ${path.resolvePath} -- FAIL`);
      if (mode === "dev") {
        res.send(`ERROR '${module}': no install source error`);
        return null;
      }
      return `ERROR '${module}': no install source error`;
    }

    return {
      source: source.source,
      resolvePath: path.resolvePath,
      module,
      dirname,
      units,
      optional
    };
  },
  //
  copyFiles: function({ from, to, up, module }) {
    copyfiles([from, to], { up }, err => {
      if (err) {
        throw err;
      }
      console.log(`copy: ${module} -- ok`);
    });
  },
  //
  getUp: function(from) {
    return from
      .replace(/\\/g, "/")
      .slice(0, from.indexOf("**"))
      .match(/\//g).length;
  }
};
