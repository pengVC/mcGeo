/**
 * Created by VC on 2017/9/18.
 */

import angular from "angular";
import amap from "./amap/cmp.js";

angular
	.module("bootstrap", [
		amap
	])
;

angular.bootstrap(document, ["bootstrap"]);

