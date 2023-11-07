const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const Dotenv = require('dotenv-webpack')

const PUBLIC_PATH = path.resolve(__dirname, 'dist')

const htmlWebpackPluginDefaults = {
  scriptLoading: 'blocking',
  inject: 'head',
}

module.exports = {
  entry: {
    index: './src/js/index.ts',
    components: './src/js/components/index.ts',
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src/'),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
    extensions: ['.tsx', '.ts', '.js', 'vue'],
  },
  output: {
    path: PUBLIC_PATH,
    filename: 'js/[name].js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'] },
      { test: /\.s[ac]ss$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'] },

      {
        test: /\.(ts|tsx)$/,
        exclude: /(node_modules|bower_components|components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
            plugins: ['transform-custom-element-classes']
          },
        },
      },
      {
        test: /\.(ts|tsx)$/,
        include: /components/,
        use: 'ts-loader',
      },

      {
        test: /\.html$/,
        include: path.resolve(__dirname, 'src/html-includes'),
        use: ['raw-loader'],
      },
    ],
  },
  plugins: [

    new Dotenv(),
    new MiniCssExtractPlugin({ filename: 'css/style.css' }),
    ...generateHtmlPlugins('./src'),
    new CopyPlugin({
      patterns: [{ from: './src/img/', to: './img/' }, ...generateCopyPlugins('./src/html-dialogs')],
    }),
    new FaviconsWebpackPlugin({
      logo: './src/favicon.png',
      devMode: 'webapp',
      prefix: 'favicon/',
      favicons: {
        background: '#ffffff',
        theme_color: '#c0392b',
      },
    }),
  ],
  devServer: {
    contentBase: PUBLIC_PATH,
    compress: false,
    port: 9000,
    historyApiFallback: true,
  },
}

function generateHtmlPlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir))

  return templateFiles
    .map((item) => {
      const parts = item.split('.')
      const name = parts[0]
      const extension = parts[1]

      if (extension !== 'html') return null

      return new HtmlWebpackPlugin({
        ...htmlWebpackPluginDefaults,
        filename: `${name}.html`,
        template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
      })
    })
    .filter((item) => item !== null)
}

function generateCopyPlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir))

  return templateFiles
    .map((item) => {
      const parts = item.split('.')
      const name = parts[0]
      const extension = parts[1]

      if (extension !== 'html') return null

      return { from: `${templateDir}/${name}.${extension}`, to: `./${name}.${extension}` }
    })
    .filter((item) => item !== null)
}
