import sass from "dart-sass";
import path from "path";
import postcss from "postcss";
import autoprefixer from "autoprefixer";

export default class CompileSass {
  constructor({ htmlText, filePath }) {
    const reg = `(?<=<style[a-z0-9="' ]*type\\s*=\\s*["']?\\s*text\\/scss\\s*["']?[a-z0-9="' ]*>)([\\s\\S]*?)(?=<\\/style>)`;
    this.scss = (htmlText.match(new RegExp(reg, "gi")) || []).reduce((acc, style, i) => {
      acc.push({
        cssIndex: i,
        data: style.replace(/(?<=@import ["'])(\S+)(?=["'];)/g, match =>
          path.resolve(filePath, match).replace(/\\/g, "/")
        ),
        idx: htmlText.indexOf(style),
        len: style.length
      });
      return acc;
    }, []);
    this.css = [];
  }

  compile() {
    const promises = [];
    this.scss.forEach(({ data }, i) => {
      promises.push(
        new Promise(res => {
          sass.render({ data }, (err, result) => {
            if (err) {
              console.log(`Sass compile error:\n${err}`);
              this.css[i] = this.scss[i].data;
              res();
            } else {
              postcss([autoprefixer])
                .process(result.css.toString(), { from: undefined })
                .then(result => {
                  this.css[i] = result.css;
                  res();
                });
            }
          });
        })
      );
    });

    return promises;
  }
}
