import Request from './request.mjs';
import { CompileHtml } from './compile.mjs';
import { importPathResolve, removeQueryString } from './utils.mjs';
import { extname } from 'path';

const sendResolve = ({ res, source, method, delay = 0 }) => {
  setTimeout(() => {
    if (method === 'data') {
      res.send(source);
    } else if (method === 'file') {
      res.sendFile(source);
    }
  }, delay);
};

export default function after ({ dirname, module, currentModule, units, optional, latency, app: { requester, installer }, execute, devServer, buildMode }) {
  return function (app) {
    app.get(`/${units.dirS}/*`, (req, res) => {
      const request = new Request({ req, dirname, units, currentModule, optional, execute, buildMode, devServer });

      const { module, relativePath, resolvePath } = request.options;
      const filePath = removeQueryString(`${dirname}/src/${relativePath}`);

      const delay = latency
        .map((l, i) => RegExp(l.regex).test(filePath) ? l.delay : 0)
        .filter(Boolean).pop();

      if (request.error) {
        console.log(request.error);
        sendResolve({ res, source: request.error, method: 'data', delay });
      } else if (request.mode === 'currentModule') {
        if (extname(filePath) === '.html') {

          const outputFile = removeQueryString(resolvePath);

          new CompileHtml({
            ...request.options,
            inputFile: filePath,
            outputFile,
            importPathResolve: importPathResolve(filePath)
          })
            .run()
            .then(htmlText => {
              sendResolve({ res, source: htmlText, method: 'data', delay });
            });
        } else {
          sendResolve({ res, source: filePath, method: 'file', delay });
        }
      } else {
        requester
          .get(request.options)
          .then(() => sendResolve({ res, source: removeQueryString(resolvePath), method: 'file', delay }))
          .catch(error => {
            installer.deleteInstance(`${module}/${relativePath}`);
            console.log(error);
            sendResolve({ res, source: error, method: 'data', delay });
          });
      }
    });
  };
}
