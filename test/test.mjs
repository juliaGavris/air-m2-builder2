import fs from "fs";
import path from "path";
import Mocha from "mocha";
import serverConfig from "../src/serverConfig.mjs";
import DevServer from "../src/devserver.mjs";
import { UtilsTest } from "../src/utils.mjs";

const utils = new UtilsTest();
const mocha = new Mocha();
const dirname = path.resolve(path.dirname(""));
const fakeDirname = `${dirname}/node_modules/testix-game`;

const copyPaths = [
  { from: `${dirname}/test/test-modules/testix-game/**/*`, to: fakeDirname },
  { from: `${dirname}/test/test-modules/testix-builder/**/*`, to: `${fakeDirname}/node_modules/testix-builder` }
];
Promise.all(
  copyPaths.map(path => {
    const { from, to } = path;
    return utils.copyFiles({ from, to, up: utils.getUp(from) });
  })
).then(() => {
  const config = serverConfig({ customDir: fakeDirname, execute: utils.execute });

  const testDir = `${dirname}/test/tests`;
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
    devserver.run();
  });
});
