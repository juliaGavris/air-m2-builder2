import { readFileSync } from "fs";
import Request from "./request";
import CompileSass from "./compileSass";
import { Utils } from "./utils";

export default function after({ dirname, currentName, units, optional, app: { requester, installer }, execute }) {
  return function(app) {
    app.get(`/${units.dirS}/*`, (req, res) => {
      const request = new Request({ req, dirname, units, currentName, optional, execute, mode: "dev" });
      const filePath = `${dirname}/src/${request.fileName}`;

      if (request.mode === "currentModule") {
        if (new Utils().getExtension(request.fileName) === ".html") {
          let htmlText = readFileSync(filePath).asciiSlice();
          const sass = new CompileSass({ htmlText });
          Promise.all(sass.compile()).then(() => {
            const { scss, css } = sass;
            scss.reverse().forEach((data, i) => {
              const idx = htmlText.indexOf(data);
              htmlText = htmlText.slice(0, idx) + css[scss.length - i - 1] + htmlText.slice(idx + data.length);
            });
            res.send(htmlText);
          });
        } else {
          res.sendFile(filePath);
        }
        return;
      }
      if (request.error) {
        console.log(request.error);
        res.send(request.error);
        return;
      }

      const opt = request.options;

      requester
        .get(opt)
        .then(() => {
          return res.sendFile(opt.resolvePath);
        })
        .catch(error => {
          installer.deleteInstance(opt.module);
          res.send(error);
        });
    });
  };
}
