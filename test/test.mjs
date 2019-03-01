import fs from "fs";
import path from "path";
import Mocha from "mocha";

const mocha = new Mocha();
const dirname = path.resolve(path.dirname(""));

const testDir = `${dirname}/test/tests`;
fs.readdirSync(testDir)
  .filter(file => file.match(/\.js$/))
  .forEach(file => {
    mocha.addFile(path.join(testDir, file));
  });

// const runner = mocha.timeout(30000).run();
// runner.on("end", () => {
//   process.exit();
// });
