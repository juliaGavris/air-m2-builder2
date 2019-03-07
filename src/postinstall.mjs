import { existsSync, readFileSync } from "fs";
import { Utils } from "./utils";
import { CompileSource, CompileResource, CompileHtml } from "./compile";

const utils = new Utils();

export default function(opt) {
  const { dirname, module, units, optional, resolvePath } = opt;

  const pkgPath = `${dirname}/node_modules/${module}/package.json`;
  if (!existsSync(pkgPath)) {
    throw `ERROR: file not found '${pkgPath}'`;
  }

  const additionals = utils.getAdditional(pkgPath, units.requires);
  if (additionals != null) {
    utils.addUnique(optional, additionals);
  }

  let Compiler = CompileSource;
  const pkg = readFileSync(pkgPath, "utf8");
  const { main } = JSON.parse(pkg);
  const extensionMain = utils.getExtension(main);
  const extensionPath = utils.getExtension(resolvePath);
  if (extensionPath === ".html") {
    Compiler = CompileHtml;
  } else if (extensionMain !== ".js") {
    opt.resources = true;
    Compiler = CompileResource;
  }

  return { Compiler, main };
}
