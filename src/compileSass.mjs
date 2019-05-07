import sass from "dart-sass";
import path from "path";

export default class CompileSass {
  constructor({ htmlText, filePath }) {
    this.scss = (
      htmlText.match(/(?<=<style\s*type\s*=\s*["']?\s*text\/scss\s*["']?\s*>)([\s\S]*?)(?=<\/style>)/gi) || []
    ).reduce((acc, style, i) => {
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
            }

            this.css[i] = err ? this.scss[i] : result.css.toString();
            res();
          });
        })
      );
    });

    return promises;
  }
}
