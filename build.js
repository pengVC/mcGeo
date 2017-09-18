/**
 * Created by VC on 2017/9/21.
 */

const
	kit = require("./build/kit"),
	flow = require("./build/webpack/flow")
;

main();

function main(){

	const
		shell = require("shelljs"),
		cliOnf = kit.getCliConfig(),
		isProduction = kit.isProduction()
	;

	if(__dirname !== process.cwd()){
		console.log("请在项目根目录运行命令!");
		shell.exit(1);
	}

	if(isProduction){
		process.env.NODE_ENV = "production";
	}

	switch((cliOnf["action"] || "").toUpperCase()){

		case "BUILD-PROJECT":
			flow.build();
			break;

		case "DEV":
			flow.dev();
			break;

		default:
			console.log(`未捕获的任务: ${cliOnf["action"]}`);
			break;

	}

}

