/**
 * Created by VC on 2017/9/21.
 */

const
	path = require("path")
;

const devConfig = {

	devServer: {
		contentBase     : path.join(process.cwd(), "dist"),
		watchContentBase: false,
		compress        : true,
		https           : !true,
		port            : 8055,
		open            : true
	},

	module: {
		rules: [
			{
				test: /\.(html)$/,
				use: {
					loader: "html-loader"
				}
			}
		]
	}

};

module.exports = devConfig;
