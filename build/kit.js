/**
 * Created by VC on 2017/9/21.
 */

const BASE_NODE_VERSION = "6.11.3";

Kit.getCliConfig = getCliFactory();
Kit.isProduction = isProduction;
Kit.assignInsight = assignInsight;

function getCliFactory(){

	const
		minimist = require("minimist")
	;

	let
		cliAgr
	;

	return (isFore) => {
		if(!cliAgr && !isFore){
			cliAgr = cliAgr || minimist(process.argv.slice(2), {
				default: {}
			});
		}
		return cliAgr;
	};

}

function isProduction(){

	let aliOnf = Kit.getCliConfig();

	return aliOnf["p"] || aliOnf["production"];

}

/**
 * Smart Deep Mode For Object.assign
 * @param target
 * @param source
 * @returns {*}
 */
function assignInsight(target, source){

	for(let prop in source){

		let
			isExtendAssign,
			isPushAssign
		;

		if(!source.hasOwnProperty(prop)){ continue }

		isExtendAssign = isObject(source[prop]);
		isPushAssign = isArray(source[prop]);

		if(isExtendAssign){

			target[prop] = isObject(target[prop]) ?
				target[prop] :
				{}
			;

			target[prop] = assignInsight(target[prop], source[prop]);

		}else if(isPushAssign){

			target[prop] = isArray(target[prop]) ?
				target[prop].concat(source[prop]) :
				source[prop]
			;

		}else{

			target[prop] = "" === source[prop] ?
				target[prop] :
				source[prop]
			;

		}

	}

	return target;

}

const toString = Object.prototype.toString;

function isObject(target){
	return "[object Object]" === toString.call(target);

}

function isArray(target){
	return "[object Array]" === toString.call(target);
}

function Kit(){ }

module.exports = Kit;
