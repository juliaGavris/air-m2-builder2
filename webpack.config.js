const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (buildMode, devServer, dirname, { masterPath, entryUnit, revision = null }) => {
  const obj = {
    mode: buildMode,
    entry: [`${__dirname}/src/m2.js`, masterPath.join("")],
    externals: {
      m2: "__M2"
    },
    output: {
      path: `${devServer ? masterPath[0] : dirname}/dist`,
      filename: "m2.js"
    },
    plugins: [
      new HtmlWebpackPlugin({
        entryUnit,
        inject: false,
        hash: true,
        template: masterPath.join("").replace(/\.js$/g, ".html"),
        filename: "index.html",
        revision,
        minify: {
          removeEmptyAttributes: function(attrName, tag) {
            return tag === "script" && attrName === "revision";
          }
        }
      })
    ]
  };

  /*if (mode === "production") {
    obj.module = {
      rules: [
        {
          test: /\.m?js$/,
          use: {
            loader: "babel-loader",
            options: {
              plugins: [
                [
                  "@babel/plugin-transform-runtime",
                  {
                    "regenerator": true,
                  }
                ]
              ],
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      browsers: ["last 2 versions", "ie >= 8"]
                    }
                  }
                ]
              ]
            }
          }
        }
      ]
    };
  }*/

  return obj;
};
