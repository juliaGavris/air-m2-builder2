import { readFileSync } from "fs";
import Request from "./request";
import CompileSass from "./compileSass";
import { Utils } from "./utils";

export default function after({
  dirname,
  currentName,
  units,
  optional,
  latency,
  app: { requester, installer },
  execute
}) {
  return function(app) {
    app.get(`/${units.dirS}/*`, (req, res) => {
      function sendResolve({ source, method, delay }) {
        if (delay === 0) {
          if (method === "data") {
            res.send(source);
          } else if (method === "file") {
            res.sendFile(source);
          }
        } else {
          if (method === "data") {
            setTimeout(() => {
              res.send(source);
            }, delay);
          } else if (method === "file") {
            setTimeout(() => {
              res.sendFile(source);
            }, delay);
          }
        }
      }

      const request = new Request({ req, dirname, units, currentName, optional, execute, mode: "dev" });
      const filePath = `${dirname}/src/${request.fileName}`;

      let i = 0;
      let match = null;
      let delay = 0;
      while (match === null && i < latency.length) {
        match = filePath.match(new RegExp(latency[i++].regex));
      }
      if (match !== null) {
        delay = latency[i - 1].delay || 0;
      }

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
            sendResolve({ source: htmlText, method: "data", delay });
          });
        } else {
          sendResolve({ source: filePath, method: "file", delay });
        }
        return;
      }
      if (request.error) {
        console.log(request.error);
        sendResolve({ source: request.error, method: "data", delay });
        return;
      }

      const opt = request.options;

      requester
        .get(opt)
        .then(() => {
          return sendResolve({ source: opt.resolvePath, method: "file", delay });
        })
        .catch(error => {
          installer.deleteInstance(opt.module);
          sendResolve({ source: error, method: "data", delay });
        });
    });
  };
}
