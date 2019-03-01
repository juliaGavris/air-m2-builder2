#!/usr/bin/env node --experimental-modules

import ServerConfig from "../src/config.mjs";
import DevServer from "../src/devserver.mjs";

const config = new ServerConfig().config;
const devserver = new DevServer(config);
devserver.precompile().then(() => {
  if (config.build) {
    devserver.build();
  } else {
    devserver.run();
  }
});
