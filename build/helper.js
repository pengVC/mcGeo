/**
 * Created by VC on 2017/9/21.
 */

Helper.validNodeVer = validNodeVer;

/**
 *
 * @param { String } onf.standardVer
 * @return { Boolean }
 */
function validNodeVer(onf){

	const
		shell = require("shelljs")
	;

	let
		baseVersion,
		curVersion,

		isNodeAvailable,
		isNodeLessVer
	;

	if(!shell.which("node")){
		shell.echo("Require Node Environment.");
		shell.echo("Please install by: http://nodejs.org");
		shell.exit();
	}

	baseVersion = onf.standardVer;
	curVersion = shell.exec("node -v", {
		silent: true
	}).output;

	isNodeAvailable = _checkVersion(curVersion, baseVersion).eq;
	isNodeLessVer = _checkVersion(curVersion, baseVersion).lt;

	if(!isNodeAvailable){
		let error = isNodeLessVer?
			`Your Node Version Is Out Of Date! \nPlease Install V${baseVersion} Node On: http://nodejs.org`:
			`Your Node Version Is High \nFor Stable,Please Install V${baseVersion} Node On: http://nodejs.org`;
		_showError(error);
	}

	return isNodeAvailable;
}

/**
 * 检测版本号
 * @param { String } curVersion 当前版本号
 * @param { String } baseVersion 基准版本号
 * @returns { Object } onf 是否通过验证
 * @returns { Boolean } onf.eq 是否相等
 * @returns { Boolean } onf.lt 是否小于
 * @returns { Boolean } onf.gt 是否大于
 */
function _checkVersion(curVersion, baseVersion){

	const
		curVer = transVersion(curVersion),
		baseVer = transVersion(baseVersion)
	;

	let
		equal = true,
		lessThan = undefined
	;

	equal = curVer.reduce((lastVal, cur, index) =>{
		if(!lastVal){ return false; }

		let isEqual = Number(cur) === Number(baseVer[index] || 0);

		if(!isEqual){
			lessThan = Number(cur) < Number(baseVer[index]);
		}

		return isEqual;

	}, equal);

	return {
		eq: equal,
		lt: lessThan,
		gt: !lessThan
	};

}

/**
 * 将版本号转换为数组以便于比较
 * @param { String } version 版本号
 * @returns { Array } 转换后的版本号
 */
function transVersion(version){
	return version.match(/([\d\.]+)/g)[0].split(".");
}

/**
 * 错误提示
 * @param { String } error 错误提示语
 */
function _showError(error){
	const shell = require("shelljs");
	shell.echo(" ");
	shell.echo("### Caution: ###");
	shell.echo("");
	shell.echo(error);
	shell.echo("");
}


function Helper(){

}

module.exports = Helper;
