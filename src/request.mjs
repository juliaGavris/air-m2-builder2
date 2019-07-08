import { Utils } from './utils.mjs';
import { extname } from 'path';

const utils = new Utils();

export default class Request {
  constructor ({ req, dirname, units, currentModule, optional, buildMode, devServer }) {
    const fullPath = dirname + req.originalUrl;
    const extension = extname(req.path);
    const match = req.path.match(/\/?[-\w]+\//g);
    const module = match && match.length > 1 ? match[1].slice(0, -1) : currentModule;

    this.relativePath = fullPath.slice(fullPath.lastIndexOf(`/${module}/`) + module.length + 2);

    const resolvePath = ['.js', '.html'].includes(extension) ?
      `${dirname}/node_modules/${module}/${units.dir}/${this.relativePath}` :
      `${dirname}/node_modules/${module}/src/${this.relativePath}`;

    this.mode = module === currentModule ? 'currentModule' : 'request';

    const source = [...optional.values()].find(e => e.module === module);
    if (!source) {
      this.error = `ERROR '${module}': no install source error`;
    }

    this.options = {
      devServer,
      buildMode,
      source: this.error ? null : source.source,
      inputFile: `${dirname}/node_modules/${module}/src/${this.relativePath}`,
      outputFile: resolvePath,
      resolvePath,
      module,
      dirname,
      units,
      optional,
      moduleFileNameFull: this.relativePath
    };
  }
}
