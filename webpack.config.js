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
        filename: `../../templates/${page}`,
        template: `./app/templates/${page}`,
        minify: {
            removeComments: false
        }
    });
});

module.exports = {
    entry: './app/assets/scripts/App.js',
    plugins: pages.concat([
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'styles.[chunkhash].css'
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ]),
    output: {
        filename: '[name].[chunkhash].js',
        chunkFilename: '[name].[chunkhash].js',
        path: path.resolve(__dirname, 'public/cache/dist')
    },
    mode: "production",
    watch: true,
    optimization: {
        splitChunks: {chunks: 'all'}
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                exclude: /(node_modules)/,
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
                exclude: /(node_modules)/,
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
                    outputPath: 'fonts/',
                    publicPath: 'fonts/',
                    limit: 1024
                }
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                loader: 'file-loader',
                options: {
                    outputPath: 'images/',
                    publicPath: 'images/'
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
