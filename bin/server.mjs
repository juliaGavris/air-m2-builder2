#!/usr/bin/env node --experimental-modules

import serverConfig from "../src/config";
import DevServer from "../src/devserver";
import { UtilsDev } from "../src/utils";

const config = serverConfig({ execute: UtilsDev.execute });
const devserver = new DevServer(config);
devserver.precompile().then(() => {
  if (config.build) {
    devserver.build();
  } else {
    devserver.run();
  }
});
