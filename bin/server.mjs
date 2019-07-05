import serverConfig from '../src/serverConfig.mjs';
import DevServer from '../src/devserver.mjs';
import { UtilsDev } from '../src/utils.mjs';

const config = serverConfig({ execute: UtilsDev.execute });
const devserver = new DevServer(config);
devserver.precompile().then(() => {
  if (config.devServer) {
    devserver.run();
  } else {
    devserver.build();
  }
});
