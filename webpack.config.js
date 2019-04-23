const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function(mode, dirname, { masterPath, entryUnit } ) {
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
        filename: "index.html"
      })
    ]
  };

  if (mode === "production") {
    obj.module = {
      rules: [
        {
          test: /\.m?js$/,
          use: {
            loader: "babel-loader",
            options: {
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
  }

  return obj;
};
