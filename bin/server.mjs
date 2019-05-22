import serverConfig from "../src/config.mjs";
import DevServer from "../src/devserver.mjs";
import { UtilsDev } from "../src/utils.mjs";

const config = serverConfig({ execute: UtilsDev.execute });
const devserver = new DevServer(config);
devserver.precompile().then(() => {
  if (config.build) {
    devserver.build();
  } else {
    devserver.run();
  }
});
