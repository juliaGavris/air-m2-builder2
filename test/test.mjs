import fs from "fs";
import path from "path";
import Mocha from "mocha";
import ServerConfig from "../src/config.mjs";
import DevServer from "../src/devserver.mjs";
import Utils from "../src/utils.mjs";

const utils = new Utils();
const mocha = new Mocha();
const dirname = path.resolve(path.dirname(""));

const copies = [];
const copyPaths = [
  { from: `${dirname}/test/test-modules/testix-builder/**/*`, to: `${dirname}/node_modules/testix-builder` },
  { from: `${dirname}/test/test-modules/index.js`, to: `${dirname}/src/` },
  { from: `${dirname}/test/test-modules/air-m2.config.json`, to: dirname }
];
copyPaths.forEach(path => {
  const { from, to } = path;
  copies.push(utils.copyFiles({ from, to, up: utils.getUp(from) }));
});
Promise.all(copies).then(() => {
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
