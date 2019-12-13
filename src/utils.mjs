import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { dirname, extname, isAbsolute, resolve } from 'path';
import copyfiles from 'copyfiles';
import { exec } from 'child_process';
import { CompileHtml } from './compile.mjs';
import glob from 'glob';
import crypto from 'crypto';

const importExportRegex = /(?:import|export)\s(?:["'\s]*[\w*{}\$\n\r\t, ]+from\s*)?["'\s]*([^"']+)["'\s]/gm;
const importRegex = /(?<!@)import\s(?:["'\s]*[\w*{}\$\n\r\t, ]+from\s*)?["'\s]*([^"']+)["'\s]/gm;

export const getRandomInt = (max, min = 0) => Math.floor(Math.random() * (max - min + 1)) + min;
export const getUp = (from) => from.replace(/\\/g, '/').slice(0, from.indexOf('**')).match(/\//g).length;
export const getFrom = (filename) => existsSync(filename) ? JSON.parse(readFileSync(filename, 'utf8'))['_from'] : false;
export const removeQueryString = (str) => ~str.indexOf('?') ? str.substring(0, str.indexOf('?')) : str;

export const getAdditional = (filename, requires, all = false) => {
  let optDep;
  if (!all) {
    optDep = JSON.parse(readFileSync(filename, 'utf8'))[requires];
  } else {
    optDep = JSON.parse(readFileSync(filename, 'utf8'));
  }
  return optDep == null ? optDep : Object.keys(optDep).map(key => ({ module: key, source: optDep[key] }));
};

export const addUnique = (opt, add) => {
  const optMap = [...opt.values()].map(e => e.module);
  add.forEach(e => {
    if (!optMap.includes(e.module)) {
      opt.add(e);
    }
  });
};

export const copyFiles = ({ from, to, up, exclude = [] }) => new Promise(res => {
  copyfiles([from, to], { up, exclude }, err => {
    if (err) throw err;
    res();
  });
});

export const getAllFiles = (dir, extensions = [], includes = true, filelist = []) => {
  const files = readdirSync(dir);
  files.forEach(file => {
    const fileFullPath = `${dir}${/\/$/.test(dir) ? '' : '/'}${file}`;
    if (statSync(fileFullPath).isDirectory()) {
      filelist = this.getAllFiles(`${fileFullPath}/`, extensions, includes, filelist);
    } else {
      if (
        extensions.length === 0 ||
        (extensions.includes(extname(file)) && includes) ||
        (!extensions.includes(extname(file)) && !includes)
      ) {
        filelist.push(fileFullPath);
      }
    }
  });

  return filelist;
};

export const importPathResolve = (filePath) => (data) => {
  const sourceDir = dirname(filePath);
  return data.replace(importExportRegex, (match, importPath) => {
    let res = match;
    if (~importPath.indexOf('./')) {
      res = match.replace(importPath, resolve(`${sourceDir}/${importPath}`));
      res = res.replace(/\\/g, '/');
    }
    return res;
  });
};

export const prodCopyCompile = ({ from, to, buildMode, module }) => new Promise((resolve, reject) => {
  copyFiles({
    from,
    to,
    up: getUp(from),
    exclude: [`${from}.html`, `${from}.js`]
  }).then(() => {
    const promises = [];
    glob(`${from}.html`, {}, (err, files) => {
      if (err) reject(err);
      files.map(file => {
        const compileOpt = {
          buildMode,
          inputFile: file,
          outputFile: `${to}/${file.substring(from.replace('/**/*', '').length)}`,
          importPathResolve: importPathResolve(file),
          module
        };
        promises.push(new CompileHtml(compileOpt).run());
      });
    });
    Promise.all(promises).then(() => {
      if (promises.length > 0) {
        console.log(`copy/compile_html: ${module} -- ok`);
      }
      resolve();
    });
  });
});

const jsExtenstions = ['', '.js', '.mjs', '.jsx'];
export const cacheHash = (source, { sourcePath, type, name = false }) => {
  const matches = [...source.matchAll(importRegex)]
    .filter((match) => match[1][0] === '.' || isAbsolute(match[1]));

  let hashes = [];
  if (matches && matches.length) {
    hashes = matches
      .map((match) => {
        let importSource = isAbsolute(match[1]) ? match[1] : resolve(sourcePath, match[1]);

        if (existsSync(importSource) && statSync(importSource).isDirectory()) {
          importSource = resolve(importSource, 'index');
        }

        for (const ext of jsExtenstions) {
          if (existsSync(`${importSource}${ext}`) && statSync(`${importSource}${ext}`).isFile()) {
            const source = readFileSync(`${importSource}${ext}`);
            return cacheHash(source.toString(), { sourcePath: dirname(importSource), type, name: match[1] });
          }
        }
      });
  }

  return crypto.createHash('md5').update(`${source}${hashes.join('')}`).digest('hex');
};

export const executeDev = ({ pkg }) => new Promise(res => {
  const execString = `npm i --no-save --no-optional ${pkg}`;
  exec(execString, error => {
    res(error);
  });
});
