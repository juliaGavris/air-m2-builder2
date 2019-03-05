const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function(mode, dirname, masterPath) {
  return {
    mode,
    entry: [`${__dirname}/src/m2.js`, masterPath.join("")],
    output: {
      path: `${mode === "production" ? dirname : masterPath[0]}/dist`,
      filename: "m2.js"
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: false,
        hash: true,
        template: masterPath.join("").replace(/\.js$/g, ".html"),
        filename: "index.html"
      })
    ]
  };
};
