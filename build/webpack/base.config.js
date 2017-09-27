/**
 * Created by VC on 2017/9/21.
 */

const
	path = require("path"),

	webpack = require("webpack"),
	CleanWebpackPlugin = require("clean-webpack-plugin"),
	HtmlWebpackPlugin = require("html-webpack-plugin")
;

const baseConfig = {

	entry: {
		index: "./index.js",
		vendor: [
			"jquery"
		]
	},

	output: {
		filename: "[name]-[hash].js",
		path    : path.resolve(process.cwd(), "dist")
	},

	plugins: [

		new webpack.optimize.CommonsChunkPlugin({
			name: "vendor"
		}),

		new CleanWebpackPlugin([
			"dist"
		], {
			root: process.cwd()
		}),

		new HtmlWebpackPlugin({
			template: "src/bmap&amap-js-sdk.html",
			filename: "index.html",
			inject  : true
		})
	],

	module: {

		rules: [

			{
				test   : /\.js$/,
				exclude: /node_modules/,
				use    : {
					loader : "babel-loader",
					options: {
						presets: [
							[
								"env", {
								browsers: ["last 2 versions"]
							}
							]
						],
						plugins: [
							["transform-runtime"]
						]
					}
				}
			},

			{
				test: /\.css$/,
				use : [
					{loader: "style-loader"},
					{
						loader : "css-loader",
						options: {
							modules: true
						}
					}
				]
			}

		]

	},

	devtool  : "source-map"

};

module.exports = baseConfig;
