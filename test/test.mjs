import fs from "fs";
import path from "path";
import Mocha from "mocha";
import ServerConfig from "../src/config.mjs";
import DevServer from "../src/devserver.mjs";

const mocha = new Mocha();
const config = new ServerConfig().config;

const testDir = `${config.dirname}/test/tests`;
fs.readdirSync(testDir)
  .filter(file => file.match(/\.js$/))
  .forEach(file => {
    mocha.addFile(path.join(testDir, file));
  });

const devserver = new DevServer(config);
devserver.precompile().then(() => {
  // const runner = mocha.timeout(30000).run();
  // runner.on("end", () => {
  //   process.exit();
  // });
  devserver.run();
});
