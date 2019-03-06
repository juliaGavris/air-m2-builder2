#!/usr/bin/env node --experimental-modules

import serverConfig from "../src/config.mjs";
import DevServer from "../src/devserver.mjs";

const config = serverConfig();
const devserver = new DevServer(config);
devserver.precompile().then(() => {
  if (config.build) {
    devserver.build();
  } else {
    devserver.run();
  }
});
