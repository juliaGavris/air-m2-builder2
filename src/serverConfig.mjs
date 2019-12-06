import { existsSync, readFileSync } from 'fs';
import { basename, join, resolve } from 'path';
import { addUnique, getAdditional, getFrom } from './utils.mjs';
import minimist from 'minimist';
import rimraf from 'rimraf';

const PORT = 9000;
const units = { dir: 'm2unit', requires: 'm2units', dirS: 'm2units' };

export default function serverConfig (options = {}) {

  const argv = minimist(process.argv.slice(2), {
    strings: ['build-mode', 'm2units', 'revision'],
    boolean: ['dev-server'],
    default: {
      'build-mode': '',
      'dev-server': false,
      'm2units': units.requires,
      'revision': process.env.STATIC_VERSION
    }
  });

  const m2units = argv['m2units'];
  const devServer = argv['dev-server'];
  const buildMode = argv['build-mode'] || argv['dev-server'] === true && 'development' || 'production';
  const revision = argv['revision'] || null;

  if (!['production', 'development'].includes(buildMode)) {
    throw `unsupported build mode type: ${buildMode}`;
  }

  if (!options.hasOwnProperty('customDir')) {
    options.customDir = false;
  }

  let entryUnit = 'master';
  const dirname = options.customDir ? options.customDir : resolve('.');
  const currentModule = basename(dirname);

  const gameConfigFilename = 'air-m2.config.json';
  const gameConfigPath = `${dirname}/${gameConfigFilename}`;
  let port = PORT;
  const latency = [];
  if (existsSync(gameConfigPath)) {
    const json = JSON.parse(readFileSync(gameConfigPath, 'utf8'));
    port = json.port || port;
    entryUnit = json['entry-unit'] || 'master';
    if (json.hasOwnProperty('latency') && json.latency instanceof Array) {
      latency.push(...json.latency);
    }
  }

  const optional = new Set();
  const unitsPath = `${dirname}/${m2units}.json`;
  if (existsSync(unitsPath)) {
    const additionals = getAdditional(unitsPath, units.requires, true);
    if (additionals != null) {
      addUnique(optional, additionals);
    }
  }
  if (existsSync(`${dirname}/package.json`)) {
    const additionals = getAdditional(`${dirname}/package.json`, units.requires);
    if (additionals != null) {
      addUnique(optional, additionals);
    }
  }

  const pkgjsonPath = `${dirname}/package.json`;
  if (existsSync(pkgjsonPath)) {
    const additionals = getAdditional(pkgjsonPath, units.requires);
    if (additionals != null) {
      addUnique(optional, additionals);
    }
  }

  if (buildMode === 'development') {
    optional.forEach(({ module, source }) => {
      const pkgjsonPath = `${dirname}/node_modules/${module}/package.json`;
      if (getFrom(pkgjsonPath) && source !== getFrom(pkgjsonPath)) {
        console.log(`Removing wrong dep ${module}...`);
        rimraf.sync(`${dirname}/node_modules/${module}`);
      }
    });
  }

  const libPath = existsSync(`${dirname}/lib`) ? '/lib' : '/src';
  if (libPath.indexOf('src') > -1) {
    console.warn('Deprecated lib path, use `lib/`');
  }
  const m2path = join(dirname, libPath);

  if (!existsSync(`${m2path}/m2.js`)) {
    throw `Error: Cannot find 'm2.js' on source '${m2path}'`;
  }

  return {
    entryUnit,
    port,
    buildMode,
    devServer,
    dirname,
    currentModule,
    m2path,
    units,
    optional,
    latency,
    execute: options.execute,
    revision
  };
}
