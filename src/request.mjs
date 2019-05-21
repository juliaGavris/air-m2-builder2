import { Utils } from "./utils.mjs";

const utils = new Utils();

export default class Request {
  constructor({ req, dirname, units, currentName, optional, mode }) {
    this.mode = "request";

    const path = {
      fullPath: dirname + req.originalUrl,
      filePath: null,
      resPath: null,
      resolvePath: null
    };

    const extension = utils.getExtension(req.path);
    const match = req.path.match(/\/?[-\w]+\//g);
    const module = match && match.length > 1 ? match[1].slice(0, -1) : currentName;

    this.fileName = path.fullPath.slice(path.fullPath.lastIndexOf(`/${module}/`) + module.length + 2);
    path.filePath = `${dirname}/node_modules/${module}/${units.dir}/${this.fileName}`;
    path.resPath = `${dirname}/node_modules/${module}/src/${this.fileName}`;

    if ([".js", ".html"].includes(extension)) {
      path.resolvePath = path.filePath;
    } else {
      path.resolvePath = path.resPath;
    }
    const { filePath, resPath, resolvePath } = path;

    if (module === currentName) {
      this.mode = "currentModule";
    }

    const source = [...optional.values()].find(e => e.module === module);
    if (!source) {
      this.error = `ERROR '${module}': no install source error`;
    }

    this.options = {
      force: mode === "prod" ? true : false,
      mode: mode === "prod" ? "production" : "development",
      source: this.error ? null : source.source,
      redundantPaths: { resPath, filePath },
      resolvePath,
      module,
      dirname,
      units,
      optional
    };
  }
}
