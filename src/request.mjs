export default class Request {
  constructor({ req, dirname, units, currentName, optional, mode }) {
    this.mode = "request";

    const path = {
      fullPath: dirname + req.originalUrl,
      filePath: null,
      resPath: null,
      resolvePath: null
    };

    let match = req.path.match(/\.\w+$/g);
    const extension = match ? match[0] : null;
    match = req.path.match(/\/?[-\w]+\//g);
    const module = match && match.length > 1 ? match[1].slice(0, -1) : currentName;

    this.fileName = path.fullPath.slice(path.fullPath.indexOf(`/${module}/`) + module.length + 2);
    path.filePath = `${dirname}/node_modules/${module}/${units.dir}/${this.fileName}`;
    path.resPath = `${dirname}/node_modules/${module}/src/${this.fileName}`;

    let resources;
    if (extension === ".js") {
      path.resolvePath = path.filePath;
    } else {
      path.resolvePath = path.resPath;
    }

    if (module === currentName) {
      this.mode = "currentModule";
    }

    const source = optional.find(e => e.module === module);
    if (!source) {
      this.error = `ERROR '${module}': no install source error`;
    }

    this.options = {
      force: mode === "prod" ? true : false,
      mode: mode === "prod" ? "production" : "development",
      source: this.error ? null : source.source,
      resolvePath: path.resolvePath,
      resources: false,
      module,
      dirname,
      units,
      optional
    };
  }
}
