import { existsSync, readFileSync } from "fs";
import { Utils } from "./utils";
import { CompileDev, CompileResource } from "./compile";

const utils = new Utils();

export default function(opt) {
  const { dirname, module, units, optional } = opt;

  const pkgPath = `${dirname}/node_modules/${module}/package.json`;
  if (!existsSync(pkgPath)) {
    throw `ERROR: file not found '${pkgPath}'`;
  }

  const additionals = utils.getAdditional(pkgPath, units.requires);
  if (additionals != null) {
    utils.addUnique(optional, additionals);
  }

  let Compiler = CompileDev;
  const pkg = readFileSync(pkgPath, "utf8");
  const { main } = JSON.parse(pkg);
  const match = main.match(/\.\w+$/g);
  const extension = match ? match[0] : null;
  if (extension !== ".js") {
    opt.resources = true;
    Compiler = CompileResource;
  }

  return { Compiler, main };
}
