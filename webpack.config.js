const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function(mode, dirname, { masterPath, entryUnit, revision = null } ) {
  const obj = {
    mode,
    entry: [`${__dirname}/src/m2.js`, masterPath.join("")],
    externals: {
      m2: "__M2"
    },
    output: {
      path: `${mode === "production" ? dirname : masterPath[0]}/dist`,
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
            return tag === 'script' && attrName === 'revision'
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
