import Request from "./request";

export default function after({ dirname, currentName, units, optional, app: { requester, installer } }) {
  return function(app) {
    app.get(`/${units.dirS}/`, (req, res) => {
      res.sendFile(dirname + req.originalUrl);
    });
    app.get(`/${units.dirS}/*`, (req, res) => {
      const request = new Request({ req, dirname, units, currentName, optional, mode: "dev" });

      if (request.error) {
        console.log(request.error);
        res.send(`ERROR '${request.options.module}': no install source error`);
        return;
      } else if (request.mode === "currentModule") {
        res.sendFile(`${dirname}/src/${request.fileName}`);
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
