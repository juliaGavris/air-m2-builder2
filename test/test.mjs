import fs from "fs";
import path from "path";
import Mocha from "mocha";
import ServerConfig from "../src/config.mjs";
import DevServer from "../src/devserver.mjs";
import Utils from "../src/utils.mjs";

const utils = new Utils();
const mocha = new Mocha();
const dirname = path.resolve(path.dirname(""));

const from1 = `${dirname}/test/test-modules/testix-builder/**/*`;
const from2 = `${dirname}/test/test-modules/index.js`;
Promise.all([
  utils.copyFiles({ from: from1, to: `${dirname}/node_modules/testix-builder`, up: utils.getUp(from1) }),
  utils.copyFiles({ from: from2, to: `${dirname}/src/`, up: utils.getUp(from2) })
]).then(() => {
  const config = new ServerConfig().config;

  const testDir = `${config.dirname}/test/tests`;
  fs.readdirSync(testDir)
    .filter(file => file.match(/\.js$/))
    .forEach(file => {
      mocha.addFile(path.join(testDir, file));
    });

  const devserver = new DevServer(config);
  devserver.precompile().then(() => {
    const runner = mocha.timeout(30000).run();
    runner.on("end", () => {
      process.exit();
    });
    devserver.run({ test: true });
  });
});
