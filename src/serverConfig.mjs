import { existsSync, readFileSync } from 'fs';
import { basename, join, resolve } from 'path';
import { Utils } from '../src/utils.mjs';
import minimist from 'minimist';
import rimraf from 'rimraf';

const utils = new Utils();

const PORT = 9000;
const units = { dir: 'm2unit', requires: 'm2units', dirS: 'm2units' };

export default function serverConfig (options = {}) {

  const argv = minimist(process.argv.slice(2), {
    strings: ['build-mode', 'm2units'],
    boolean: ['dev-server'],
    default: {
      'build-mode': '',
      'dev-server': false,
      'm2units': units.requires
    }
  });

  const m2units = argv['m2units'];
  const devServer = argv['dev-server'];
  const buildMode = argv['build-mode'] || argv['dev-server'] === true && 'development' || 'production';

  if (!['production', 'development'].includes(buildMode)) {
    throw `unsupported build mode type: ${buildMode}`;
  }

  if (!options.hasOwnProperty('customDir')) {
    options.customDir = false;
  }

  let entryUnit = 'master';
  const dirname = options.customDir ? options.customDir : resolve('.');
  const currentModule = basename(dirname);

  const revision = process.env.STATIC_VERSION || argv.revision || null;
  const gameConfigFilename = 'air-m2.config.json';
  const gameConfigPath = `${dirname}/${gameConfigFilename}`;
  let port = PORT;
  let master = null;
  const latency = [];
  if (existsSync(gameConfigPath)) {
    const json = JSON.parse(readFileSync(gameConfigPath, 'utf8'));
    port = json.port || port;
    entryUnit = json['entry-unit'] || 'master';
    if (json.hasOwnProperty('master')) {
      master = json.master;
    }
    if (json.hasOwnProperty('latency') && json.latency instanceof Array) {
      latency.push(...json.latency);
    }
  }

  const optional = new Set();
  const unitsPath = `${dirname}/${m2units}.json`;
  if (existsSync(unitsPath)) {
    const additionals = utils.getAdditional(unitsPath, units.requires, true);
    if (additionals != null) {
      utils.addUnique(optional, additionals);
    }
  }
  if (existsSync(`${dirname}/package.json`)) {
    const additionals = utils.getAdditional(`${dirname}/package.json`, units.requires);
    if (additionals != null) {
      utils.addUnique(optional, additionals);
    }
  }

  const pkgjsonPath = `${dirname}/package.json`;
  if (existsSync(pkgjsonPath)) {
    const additionals = utils.getAdditional(pkgjsonPath, units.requires);
    if (additionals != null) {
      utils.addUnique(optional, additionals);
    }
  }

  if (buildMode === 'development') {
    optional.forEach(({ module, source }) => {
      const pkgjsonPath = `${dirname}/node_modules/${module}/package.json`;
      if (source !== utils.getFrom(pkgjsonPath)) {
        console.log(`Removing wrong dep ${module}...`);
        rimraf.sync(`${dirname}/node_modules/${module}`);
      }
    });
  }

  const libPath = existsSync(`${dirname}/lib`) ? '/lib' : '/src';
  if (libPath.indexOf('src') > -1) {
    console.warn('Deprecated lib path, use `lib/`');
  }
  const m2path = join(dirname, libPath, 'm2.js');

  if (!existsSync(m2path)) {
    throw `Error: Cannot find 'm2.js' on source '${m2path}'`;
  }

  return {
    entryUnit,
    port,
    buildMode,
    devServer,
    dirname,
    currentModule,
    master,
    m2path,
    units,
    optional,
    latency,
    execute: options.execute,
    revision
  };
}
