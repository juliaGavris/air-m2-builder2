import serverConfig from '../src/serverConfig.mjs';
import DevServer from '../src/devserver.mjs';
import { UtilsDev } from '../src/utils.mjs';
import rimraf from 'rimraf';

const config = serverConfig({ execute: UtilsDev.execute });

rimraf.sync(`${config.dirname}/dist`);

const devserver = new DevServer(config);
devserver.precompile().then(() => {
  if (config.devServer) {
    devserver.run();
  } else {
    devserver.build();
  }
});
