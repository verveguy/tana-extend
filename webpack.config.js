const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  // Entry files for our content inject, popup and background pages
  entry: {
    content: "./src/index.tsx",
    //popup: './src/popup.js',
    background: './src/background.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    //path: path.resolve(__dirname, "..", "extension"),
  },
  mode: "production",

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: { noEmit: false },
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  plugins: [

    // copy extension manifest and icons
    new CopyPlugin({
      patterns: [
        { from: './src/manifest.json' },
        { context: './src/assets/locales', from: '**', to: '_locales/' },
        { context: './src/assets/', from: '*.png', to: 'assets/' }
      ]
    }),
  ],
};