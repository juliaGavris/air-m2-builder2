export default ({ entry, path, filename, buildMode, resolve = null }) => {
  const obj = {
    mode: buildMode,
    entry,
    externals: { m2: '__M2' },
    output: {
      path,
      filename,
      library: '__m2unit__',
      libraryTarget: 'this'
    }
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
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
    ]
  };

  if (buildMode === 'production') {
    obj.module = {
      rules: [
        {
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
      ]
    };
  }

  return obj;
};
