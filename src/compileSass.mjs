import sass from "dart-sass";

export default class CompileSass {
  constructor({ htmlText }) {
    this.scss = htmlText.match(/(?<=<[Ss][Tt][Yy][Ll][Ee]>)([\s\S]*?)(?=<\/[Ss][Tt][Yy][Ll][Ee]>)/g) || [];
    this.css = [];
  }

  compile() {
    const promises = [];
    this.scss.forEach((data, i) => {
      promises.push(
        new Promise(res => {
          sass.render({ data }, (err, result) => {
            this.css[i] = result.css.toString();
            res();
          });
        })
      );
    });

    return promises;
  }
}
