import { existsSync, readFileSync } from "fs";
import { Utils } from "./utils.mjs";
import { CompileSource, CompileResource, CompileHtml } from "./compile.mjs";

const utils = new Utils();

export default opt => {
  const { devServer, dirname, module, units, optional, resolvePath } = opt;

  const pkgPath = `${dirname}/node_modules/${module}/package.json`;
  if (!existsSync(pkgPath)) {
    throw `ERROR: file not found '${pkgPath}'`;
  }

  const additionals = utils.getAdditional(pkgPath, units.requires);
  if (additionals != null) {
    utils.addUnique(optional, additionals);
  }

  const pkg = readFileSync(pkgPath, "utf8");
  const { main } = JSON.parse(pkg);
  const extensionMain = utils.getExtension(main);
  const extensionPath = utils.getExtension(resolvePath);

  let Compiler;
  if (extensionPath === ".html") {
    Compiler = CompileHtml;
  } else if (extensionPath === ".js") {
    Compiler = CompileSource;
  } else {
    Compiler = CompileResource;
  }
  if (!devServer && extensionMain !== ".js") {
    Compiler = CompileResource;
  }

  const path = devServer ? `${dirname}/node_modules/${module}/${units.dir}` : `${dirname}/dist/${units.dirS}/${module}`;
  const entry = `${dirname}/node_modules/${module}/${main}`;

  return { Compiler, paths: { path, entry } };
};
