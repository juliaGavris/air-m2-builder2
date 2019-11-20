const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (buildMode, devServer, dirname, { m2path, entryUnit, revision = null }) => {
  const obj = {
    mode: buildMode,
    entry: [`${__dirname}/src/m2.js`, `${m2path}/m2.js`],
    externals: {
      m2: '__M2'
    },
    output: {
      path: `${dirname}/dist`,
      filename: 'm2.js'
    },
    plugins: [
      new CopyPlugin([
        { from: `${m2path}/res`, to: `${dirname}/dist/res` },
      ]),
      new HtmlWebpackPlugin({
        entryUnit,
        inject: false,
        hash: true,
        template: `${m2path}/m2.html`,
        filename: 'index.html',
        revision,
        buildMode,
        minify: {
          removeEmptyAttributes: function (attrName, tag) {
            return tag === 'script' && attrName === 'revision';
          }
        }
      })
    ]
  };

  obj.module = {
    rules: [
      {
        test: /\.jsx$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react']
            }
          }
        ]
      }
    ]
  };

  if (buildMode === 'production') {
    obj.entry.push(`${__dirname}/src/babel-polyfill.js`);
    obj.module.rules.push({
        test: /\.m?js$/,
        use: [
          {
            loader: 'air-m2-builder2/src/webpack-strip-block.js',
            options: {
              start: '<@debug>',
              end: '</@debug>'
            }
          },
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      browsers: ['last 2 versions', 'ie >= 8']
                    }
                  }
                ]
              ]
            }
          }
        ]
      }
    );
  }

  return obj;
};
