const path = require('path')
const webpack = require('webpack')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const recursiveSync = require('recursive-readdir-sync')

const postCSSPlugins = [
     require('postcss-import'),
     require('postcss-url'),
     require('postcss-mixins'),
     require('postcss-simple-vars'),
     require('postcss-nested'),
     require('postcss-hexrgba'),
     require('autoprefixer'),
     require('cssnano')
]

let pages = recursiveSync('./app/templates').filter(function(file) {
     return file.endsWith('.html') && !file.includes('archiv');
}).map(function(page) {
     page = page.replace('app\\templates\\', '');
     page = page.replace(/\\/g, '/');
     return new HtmlWebpackPlugin({
          filename: `../templates/${page}`,
          template: `./app/templates/${page}`,
          publicPath: `/assets`,
          minify: {
               removeComments: false
          }
     });
});

module.exports = {
     entry: './app/assets/scripts/App.js',
     output: {
          path: path.resolve(__dirname, 'public/assets'),
          filename: 'js/[name].[chunkhash].js',
          chunkFilename: 'js/[name].[chunkhash].js'
     },
     plugins: pages.concat([
          new CleanWebpackPlugin(),
          new MiniCssExtractPlugin({
               filename: 'css/styles.[chunkhash].css'
          }),
          //new webpack.ProvidePlugin({
          //     $: 'jquery',
          //     jQuery: 'jquery'
          //})
     ]),
     mode: "production",
     watch: true,
     optimization: {
          splitChunks: {
               chunks: 'all'
          }
     },
     module: {
          rules: [{
                    test: require.resolve('jquery'),
                    loader: 'expose-loader',
                    options: {
                         exposes: ['$', 'jQuery']
                    }
               },
               {
                    test: /\.css$/i,
                    use: [
                         MiniCssExtractPlugin.loader,
                         'css-loader',
                         {
                              loader: 'postcss-loader',
                              options: {
                                   plugins: postCSSPlugins
                              }
                         }
                    ]
               },
               {
                    test: /\.s(a|c)+ss$/i,
                    use: [
                         MiniCssExtractPlugin.loader,
                         'css-loader',
                         {
                              loader: 'resolve-url-loader',
                              options: {
                                   keepQuery: true,
                              }
                         },
                         {
                              loader: 'postcss-loader',
                              options: {
                                   plugins: [
                                        require('autoprefixer')
                                   ]
                              }
                         },
                         'sass-loader'
                    ]
               },
               {
                    test: /\.less$/i,
                    use: [
                         MiniCssExtractPlugin.loader,
                         'css-loader',
                         {
                              loader: 'resolve-url-loader',
                              options: {
                                   keepQuery: true,
                              }
                         },
                         {
                              loader: 'postcss-loader',
                              options: {
                                   plugins: [
                                        require('autoprefixer')
                                   ]
                              }
                         },
                         'less-loader'
                    ]
               },
               {
                    test: /\.(woff|woff2|eot|ttf|svg)$/i,
                    loader: 'url-loader',
                    options: {
                         name: '[name].[ext]',
                         outputPath: 'fonts',
                         publicPath: '/assets/fonts',
                         limit: 1024
                    }
               },
               {
                    test: /\.(png|jpe?g|gif)$/i,
                    loader: 'url-loader',
                    options: {
                         outputPath: 'images',
                         publicPath: '/assets/images',
                         limit: 1024
                    }
               },
               {
                    test: /\.js$/,
                    exclude: /(node_modules)/,
                    use: {
                         loader: 'babel-loader',
                         options: {
                              presets: ['@babel/preset-env']
                         }
                    }
               }
          ]
     }
}
