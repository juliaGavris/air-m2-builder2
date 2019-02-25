const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function(mode, dirname, masterPath) {
  return {
    mode,
    entry: [`${__dirname}/src/m2.js`, masterPath],
    output: {
      path: `${mode === "production" ? dirname : __dirname}/dist`,
      filename: "m2.js"
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: false,
        hash: true,
        template: `${__dirname}/src/m2.html`,
        filename: "index.html"
      })
    ]
  };
};
