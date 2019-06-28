import Request from "./request.mjs";
import { CompileHtml } from "./compile.mjs";
import { Utils } from "./utils.mjs";

export default function after({
  dirname,
  currentName,
  units,
  optional,
  latency,
  app: { requester, installer },
  execute,
  devServer,
  buildMode
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

      const request = new Request({ req, dirname, units, currentName, optional, execute, buildMode, devServer });

      const utils = new Utils();
      const fileName = utils.removeQueryString(request.fileName);
      const filePath = `${dirname}/src/${fileName}`;
      const opt = request.options;

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
        if (utils.getExtension(fileName) === ".html") {
          const devResolveImports = (data) => {
            const regex = /import\s(?:["'\s]*[\w*{}\n\r\t, ]+from\s*)?["'\s]*([^"']+)["'\s]/gm;
            return data.replace(regex, (match, importPath) => importPath.indexOf('../') > -1 ? match.replace('../', '../../') : match);
          };

          new CompileHtml({
            ...request.options,
            resolvePath: utils.removeQueryString(opt.resolvePath),
            redundantPaths: { resPath: filePath },
            importPathResolve: devResolveImports
          })
            .run()
            .then(htmlText => {
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

      requester
        .get(opt)
        .then(() => {
          return sendResolve({ source: utils.removeQueryString(opt.resolvePath), method: "file", delay });
        })
        .catch(error => {
          installer.deleteInstance(opt.module + opt.moduleFileNameFull);
          sendResolve({ source: error, method: "data", delay });
        });
    });
  };
}
