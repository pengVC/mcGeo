/**
 * Created by VC on 2017/9/22.
 */

import styles from "../app.css";
import mcGeo from "../mcGeo.js";
import * as AK from "../AK.js";

export default angular

	.module("app", [])

	.component("app", (() => {

		Controller.component = {
			controller  : Controller,
			controllerAs: "app",
			template    : require("./cmp.html")
		};

		Controller.$inject = [
			"$element"
		];
		function Controller($element){

			var
				_vm_ = this
			;

			_vm_.className = styles;
			_vm_.$onInit = $onInit;

			function $onInit(){
				console.log(styles);
			}

		}

		return Controller.component;

	})())

	.constant("LOCATING_ACTION_TYPE", {
		MANUAL: "manual",
		AUTO  : "auto"
	})

	.constant("MAP_VIEW_LEVEL", 16)

	.controller("AMapCtrl", [
		"$q",
		"$window",
		"$timeout",
		"$cacheFactory",
		"LOCATING_ACTION_TYPE",
		"MAP_VIEW_LEVEL",
		function($q, $window, $timeout, $cacheFactory, LOCATING_ACTION_TYPE, MAP_VIEW_LEVEL){

			let
				_vm_ = this,
				iAMapCtx,
				store = $cacheFactory("AMapCtrl")
			;

			_vm_.switchGeoAction = switchGeoAction;
			_vm_.getCurrentPosition = getCurrentPosition;

			$init();

			function $init(){
				_vm_.LOCATING_ACTION_TYPE = LOCATING_ACTION_TYPE;
				mcGeo.loadAMapLib(AK.AMAP_APP_KEY, _loadedAMapLib);
			}

			function _loadedAMapLib(){

				_vm_.isAMapReady = true;
				switchGeoAction(_vm_.LOCATING_ACTION_TYPE.MANUAL);

				iAMapCtx = mcGeo.createAMapCtx({
					elementId     : "aMap_ctx",
					defaultCoords : {
						lng: 116.331398,
						lat: 39.897445
					},
					resizeEnable  : false,
					zoomEnable    : false,
					keyboardEnable: false
				});

				getCurrentPosition();

			}

			function switchGeoAction(type){

				if(type === _vm_.actionType){ return; }

				_vm_.actionType = type;

				if(type === _vm_.LOCATING_ACTION_TYPE.AUTO){
					_openAutoLocating();

				}else{
					$timeout.cancel(store.get("autoLocating"));

				}

			}

			function getCurrentPosition(){

				if(_vm_.isLocating){ return }

				_vm_.locationInfo = null;
				_vm_.isLocating = true;

				_setState("定位中...", "aMap");

				_getCurrentPositionByAMap()

					.then(_getPositionSuccessAMap, _getPositionFailAMap)

					.finally(function(){
						_vm_.isLocating = false;
					})
				;

			}

			function _openAutoLocating(){

				let pr;

				$timeout.cancel(store.get("autoLocating"));
				if("number" !== typeof _vm_.autoLocationSec || _vm_.autoLocationSec !== _vm_.autoLocationSec){
					_vm_.autoLocationSec = 5;
				}

				getCurrentPosition();

				pr = $timeout(_openAutoLocating, _vm_.autoLocationSec * 1000);

				store.put("autoLocating", pr);

			}

			function _getCurrentPositionByAMap(){

				return $q(function(resolve, reject){

					mcGeo.getCurrentPositionByAMap({
						success: resolve,
						fail   : reject
					});

				});

			}

			function _getPositionSuccessAMap(result){

				_vm_.isLocating = false;

				_setState("获取坐标完成, 根据其坐标查地名!");
				console.log("AMap: ", "完成获取定位、名称", result);

				_vm_.locationInfo = {
					coords       : result.position.lng + ", " + result.position.lat,
					accuracy     : result.accuracy ? result.accuracy + "米" : "不可靠",
					// address      : result.formattedAddress || " - ",
					// posInfoArray : result.pois || [],
					// roadInfoArray: result.roads || []
				};

				// 设置缩放级别和中心点
				iAMapCtx.setZoomAndCenter(MAP_VIEW_LEVEL, [result.position.lng, result.position.lat]);

				// 在新中心点添加 marker
				new AMap.Marker({
					map     : iAMapCtx,
					position: [result.position.lng, result.position.lat]
				});

				_getAddressFormCoordsByAMap({
					lng   : result.position.lng,
					lat   : result.position.lat,
					radius: 500
				})
					.then(function(result){

						$window.angular.extend(_vm_.locationInfo, {
							address      : result.formattedAddress || " - ",
							posInfoArray : result.pois || [],
							roadInfoArray: result.roads || []
						});

						_setState("获取地址完成!");

					}, function(err){
						_setState("获取地点失败: " + err);
					})
				;

			}

			/**
			 *
			 * @param onf
			 * @param { Number } onf.lng
			 * @param { Number } onf.lat
			 * @param { Number } onf.radius
			 * @private
			 */
			function _getAddressFormCoordsByAMap(onf){
				return $q((resolve, reject) =>{
					mcGeo.getAddressFormCoordsByAMap({
						lng   : onf.lng,
						lat   : onf.lat,
						radius: onf.radius
					}, resolve, reject);
				})
			}

			function _getPositionFailAMap(result){
				_vm_.isLocating = false;
				_setState("定位失败: "+ result.message, "aMap");
			}

			function _setState(text){
				_vm_.actionState = text || "";
			}

		}
	])

	.controller("BMapCtrl", [
		"$q",
		"$timeout",
		"$cacheFactory",
		"LOCATING_ACTION_TYPE",
		"MAP_VIEW_LEVEL",
		function($q, $timeout, $cacheFactory, LOCATING_ACTION_TYPE, MAP_VIEW_LEVEL){

			let
				_vm_ = this,
				iBMapCtx,

				store = $cacheFactory("BMapCtrl")
			;

			_vm_.switchGeoAction = switchGeoAction;
			_vm_.getCurrentPosition = getCurrentPosition;

			$init();

			function $init(){

				_vm_.LOCATING_ACTION_TYPE = LOCATING_ACTION_TYPE;
				switchGeoAction(_vm_.LOCATING_ACTION_TYPE.MANUAL);

				mcGeo.loadBMapLib(AK.BMAP_APP_KEY, _loadedBMapLib);
			}

			function switchGeoAction(type){

				if(type === _vm_.actionType){ return; }

				_vm_.actionType = type;

				if(type === _vm_.LOCATING_ACTION_TYPE.AUTO){
					_openAutoLocating();

				}else{
					$timeout.cancel(store.get("autoLocating"));
				}

			}

			function _loadedBMapLib(BMap){

				var
					geoc = new BMap.Geocoder()
				;

				_vm_.isAMapReady = true;

				iBMapCtx = mcGeo.createBMapCtx({
					elementId: "bMap_ctx",
					defaultCoords: {
						lng: 116.331398,
						lat: 39.897445
					}
				});

				// 设置默认地图呈现位置( 定位成功之前 )
				iBMapCtx.centerAndZoom(new BMap.Point(116.331398,39.897445), 12);

				getCurrentPosition();

				// 获取 点击的位置 坐标
				iBMapCtx.addEventListener("click", (e) => {
					let pt = e.point;
					geoc.getLocation(pt, function(result){
						console.log("BMap: ", result.point, result.point.lng + "," + result.point.lat);
					});
				});

			}

			function getCurrentPosition(){

				if(_vm_.isLocating){ return }

				_vm_.locationInfo = null;
				_vm_.isLocating = true;

				_setState("定位中...");

				_getCurrentPositionByAMap()

					.then(_getPositionSuccessBMap, _getPositionFailBMap)

					.finally(() => {
						_vm_.isLocating = false;
					})
				;
			}

			function _getCurrentPositionByAMap(){

				return $q((resolve, reject) => {
					mcGeo.getCurrentPositionByBMap({
						success: resolve,
						fail   : reject
					});
				});

			}

			/**
			 *
			 * @param onf
			 * @param { Number } onf.lng
			 * @param { Number } onf.lat
			 * @private
			 */
			function _getAddressFormCoordsByBMap(onf){
				return $q((resolve, reject) =>{
					mcGeo.getAddressFormCoordsByBMap({
						lng: onf.lng,
						lat: onf.lat
					}, resolve, reject);
				})
			}

			function _getPositionSuccessBMap(result){

				let
					maker = new BMap.Marker(result.point)
				;

				_setState("获取坐标完成, 根据其坐标查地名!");

				console.log("BMap: ", "您的位置：" + result.point.lng + "," + result.point.lat, result);
				_vm_.locationInfo = {
					coords  : result.point.lng + ", " + result.point.lat,
					accuracy: result.accuracy ? result.accuracy + "米" : "不可靠"
				};

				iBMapCtx.addOverlay(maker);
				iBMapCtx.panTo(result.point);
				iBMapCtx.setZoom(MAP_VIEW_LEVEL);

				_getAddressFormCoordsByBMap({
					lng: result.point.lng,
					lat: result.point.lat
				})
					.then((result) =>{

						_setState("获取地址完成!");

						console.log("BMap: ", "获取地址:", result.address, " 其他信息:", result);

						_vm_.locationInfo["address"] = result.address || "-";
						_vm_.locationInfo["posInfoArray"] = result.surroundingPois;

					}, () => {
						_setState("获取地址失败!");
					})
				;

				return result;

			}

			function _getPositionFailBMap(err){
				_setState("定位失败: "+ err);
			}

			function _openAutoLocating(){

				let pr;

				$timeout.cancel(store.get("autoLocating"));
				if("number" !== typeof _vm_.autoLocationSec || _vm_.autoLocationSec !== _vm_.autoLocationSec){
					_vm_.autoLocationSec = 5;
				}

				getCurrentPosition();

				pr = $timeout(_openAutoLocating, _vm_.autoLocationSec * 1000);

				store.put("autoLocating", pr);

			}

			function _setState(text){
				_vm_.actionState = text || "";
			}
		}
	])

	.name

;
