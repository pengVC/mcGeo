/**
 * Created by VC on 2017/9/21.
 */


const

	webpack = require("webpack")
;

const prodConfig = {

	output: {
		filename: "[chunkhash].js"
	},

	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			comments: false,
			mangle  : true,
			compress: {
				sequences    : true,  // join consecutive statemets with the “comma operator”
				properties   : true,  // optimize property access: a["foo"] → a.foo
				dead_code    : true,  // discard unreachable code
				drop_debugger: true,  // discard “debugger” statements
				unsafe       : false, // some unsafe optimizations (see below)
				conditionals : true,  // optimize if-s and conditional expressions
				comparisons  : true,  // optimize comparisons
				evaluate     : true,  // evaluate constant expressions
				booleans     : true,  // optimize boolean expressions
				loops        : true,  // optimize loops
				unused       : true,  // drop unused variables/functions
				hoist_funs   : true,  // hoist function declarations
				hoist_vars   : false, // hoist variable declarations
				if_return    : true,  // optimize if-s followed by return/continue
				join_vars    : true,  // join declarations
				cascade      : true,  // try to cascade `right` into `left` in sequences
				side_effects : true,  // drop side-effect-free statements
				drop_console : true,  // drop console
				warnings     : false  // warn about potentially dangerous optimizations/code
			}
		})
	],

	module: {
		rules: [
			{
				test: /\.(html)$/,
				use : {
					loader : "html-loader",
					options: {
						minimize          : true,
						collapseWhitespace: false
					}
				}
			}
		]
	}

};

module.exports = prodConfig;
