/**
 * Created by VC on 2017/9/18.
 */

//关于状态码
//BMAP_STATUS_SUCCESS	检索成功。对应数值“0”。
//BMAP_STATUS_CITY_LIST	城市列表。对应数值“1”。
//BMAP_STATUS_UNKNOWN_LOCATION	位置结果未知。对应数值“2”。
//BMAP_STATUS_UNKNOWN_ROUTE	导航结果未知。对应数值“3”。
//BMAP_STATUS_INVALID_KEY	非法密钥。对应数值“4”。
//BMAP_STATUS_INVALID_REQUEST	非法请求。对应数值“5”。
//BMAP_STATUS_PERMISSION_DENIED	没有权限。对应数值“6”。(自 1.1 新增)
//BMAP_STATUS_SERVICE_UNAVAILABLE	服务不可用。对应数值“7”。(自 1.1 新增)
//BMAP_STATUS_TIMEOUT	超时。对应数值“8”。(自 1.1 新增)

/**
 * 在使用百度地图JavaScript API服务时，需使用百度 BD09 坐标 !
 * 目前国内主要有以下三种坐标系：

	 - WGS84：为一种 大地坐标系，也是目前广泛使用的GPS全球卫星定位系统使用的坐标系。
	 - GCJ02：又称 火星坐标系，是由中国国家测绘局制订的地理信息系统的坐标系统。由 WGS84 坐标系经加密后的坐标系。
	 - BD09：为 百度坐标系，在 GCJ02 坐标系基础上再次加密。其中bd09ll表示百度经纬度坐标，bd09mc 表示百度墨卡托米制坐标。

	 非中国地区地图，服务坐标统一使用WGS84坐标。

	 其他坐标转百度坐标
	 百度对外接口的坐标系为 BD09 坐标系，并不是GPS采集的真实经纬度，在使用百度地图 JavaScript API 服务前，需先将非百度坐标通过坐标转换接口转换成百度坐标。
	 坐标转换、批量坐标转换示例详见 JavaScript API 示例。
	 注意：请勿使用其他非官方转换方法！！！
 */

/**
 *
 * 目前高德开放平台的所有产品，地图SDK、定位SDK等，在中国大陆、香港、澳门都是返回高德坐标；
 * 在台湾地区，返回的是 WGS84坐标；
 * 海外地区（仅定位SDK），返回的是 WGS84坐标。
 *
 */


const
	STORE = {}
;

mcGeo.loadBMapLib = loadBMapLib;
mcGeo.createBMapCtx = createBMapCtx;
mcGeo.getCurrentPositionByBMap = getCurrentPositionByBMap;
mcGeo.getAddressFormCoordsByBMap = getAddressFormCoordsByBMap;

mcGeo.loadAMapLib = loadAMapLib;
mcGeo.createAMapCtx = createAMapCtx;
mcGeo.getCurrentPositionByAMap = getCurrentPositionByAMap;
mcGeo.getAddressFormCoordsByAMap = getAddressFormCoordsByAMap;

mcGeo.gpsToBd09 = gpsToBd09;
mcGeo.batchGpsToBd09 = batchGpsToBd09;


/**
 * 加载百度地图 js-sdk 库
			 * @param { String } ak
 * @param { Function } callback
 */
function loadBMapLib(ak, callback){

	var
		script = document.createElement("script"),
		randomNamespace = "bMap" + generateUuid()
	;

	script.src = "https://api.map.baidu.com/api?v=2.0&ak=" + ak + "&callback=" + randomNamespace;
	document.body.appendChild(script);

	window[randomNamespace] = function(){

		if("function" === typeof callback){
			callback(window.BMap);
		}

		document.body.removeChild(script);
		delete window[randomNamespace];
	}

}


/**
 * 创建百度地图实例
 * @param { Object } onf
 * @param { Object } onf.elementId
 * @param { Object } [onf.defaultCoords]
 * @param { Number } onf.defaultCoords.lng
 * @param { Number } onf.defaultCoords.lat
 * @return {BMap.Map}
 */
function createBMapCtx(onf){

	onf = onf || {};
	onf.defaultCoords = onf.defaultCoords || {};

	// 百度地图API功能
	var map = new BMap.Map(onf.elementId);

	// 设置默认地图呈现位置( 定位成功之前 )
	var point = new BMap.Point(onf.defaultCoords.lng, onf.defaultCoords.lat);
	map.centerAndZoom(point, 18);

	return map;
}

/**
 * 获取 currentPosition 百度地图
 *
 * @param { Object } onf
 *
 * @param { Function } onf.success( result )
 *
 *          { Object } result.point.lng
 *          { Object } result.point.lat
 *
 *          { Number } result.accuracy 定位精度
 *          { Number } result.speed 速度
 *          { Number } result.heading 水平方向的角度，正北方向为 0，正东为 90，正南为 180，正西为 270
 *
 *
 * @param { Function } onf.fail
 */
function getCurrentPositionByBMap(onf){

	// 初始化 百度定位服务
	var
		geolocation = new BMap.Geolocation()
	;

	onf = onf || {};

	geolocation.getCurrentPosition(function(result){

		if(this.getStatus() == BMAP_STATUS_SUCCESS){

			if("function" === typeof onf.success){
				onf.success(result);
			}

		}else{

			if("function" === typeof onf.fail){
				onf.fail(this.getStatus());
			}

		}

	}, {
		enableHighAccuracy: true,
		maximumAge        : 0
	});

}

/**
 * 根据经纬度, 获取地点名称( 使用前, 请转化为百度坐标系( BD09 ) )
 *
 * @param { Object } onf
 * @param { Number } onf.lng 经度( BD09 坐标系 )
 * @param { Number } onf.lat 维度( BD09 坐标系 )
 *
 * @param { Function } [success( GeocoderResult )]
 *
 *          { String } GeocoderResult.address 地址描述
 *
 *          { Object } GeocoderResult.addressComponents 结构化的地址描述
 *          { String } GeocoderResult.addressComponents.province 省份名称
 *          { String } GeocoderResult.addressComponents.city 城市名称
 *          { String } GeocoderResult.addressComponents.district 区县名称
 *          { String } GeocoderResult.addressComponents.street 街道名称
 *          { String } GeocoderResult.addressComponents.streetNumber 门牌号码
 *
 *          { Array } GeocoderResult.surroundingPois 附近的 POI 点
 *          { String } GeocoderResult.business 商圈字段，代表此点所属的商圈
 *
 * @param { Function } [fail]
 */
function getAddressFormCoordsByBMap(onf, success, fail){

	var geoc;

	if(!_hasOnStore("BMap.Geocoder")){
		_putInStore("BMap.Geocoder", new BMap.Geocoder());
	}

	geoc = _getFormStore("BMap.Geocoder");

	// 如果解析成功， 则回调函数的参数为 GeocoderResult 对象，否则回 调函数的参数为 null
	geoc.getLocation(new BMap.Point(onf.lng, onf.lat), function(result){

		if (result){
			"function" === typeof success && success(result);
		}else{
			"function" === typeof fail && fail("解析坐标地址未成功!");
		}

	});

}

/**
 * 加载高德地图 js-sdk 库
 * @param { String } ak
 * @param { Function } callback
 *
 */
function loadAMapLib(ak, callback){

	var
		script = document.createElement("script"),
		randomNamespace = "aMap" + generateUuid()
	;

	script.src = "https://webapi.amap.com/maps?v=1.4.0&key=" + ak + "&callback=" + randomNamespace;
	document.body.appendChild(script);

	window[randomNamespace] = function(){

		if("function" === typeof callback){
			callback(window.AMap);
		}

		document.body.removeChild(script);
		delete window[randomNamespace];
	}

}

/**
 * 创建高德地图实例
 * @param { Object } onf
 * @param { Object } onf.elementId
 * @param { Object } [onf.defaultCoords]
 * @param { Number } onf.defaultCoords.lng
 * @param { Number } onf.defaultCoords.lat
 * @return {AMap.Map}
 */
function createAMapCtx(onf){

	onf = onf || {};
	onf.defaultCoords = onf.defaultCoords || {};

	var map = new AMap.Map(onf.elementId, Object.assign({
		resizeEnable: true,
		zoom        : 11
	}, onf, {
		center: [onf.defaultCoords.lng || 0, onf.defaultCoords.lat || 0]
	}));

	return map;
}

/**
 * 获取 高德地图 currentPosition
 *
 * @param { Function } [onf.success( GeolocationResult )]
 *
 *          { Boolean } GeolocationResult.isConverted 是否经过坐标纠偏, 经过偏移则是 高德坐标系
 *
 *          { Number } GeolocationResult.accuracy 精度范围
 *
 *          { Object } GeolocationResult.position 定位坐标结果
 *          { Number } GeolocationResult.position.lng
 *          { Number } GeolocationResult.position.lat
 *
 *          { String } GeolocationResult.formattedAddress 地址
 *          { Object } GeolocationResult.addressComponent 当前定位结果的一些信息
 *
 *          { Array } GeolocationResult.pois 定位点附近的POI信息，extensions 等于'base'的时候为空
 *          { Array } GeolocationResult.roads 定位点附近的道路信息，extensions 等于'base'的时候为空
 *          { Array } GeolocationResult.crosses 定位点附近的道路交叉口信息，extensions 等于'base'的时候为空
 *
 *          { String } GeolocationResult.location_type 定位结果的来源，可能的值有:'html5'、'ip'、'sdk'
 *
 *          { String } GeolocationResult.info "SUCCESS"
 *          { String } GeolocationResult.message 当前定位结果的一些信息
 *
 * @param { Function } [onf.fail( GeolocationError )]
 *
 *          { String } GeolocationError.info "NOT_SUPPORTED" || "FAILED"
 *                      "NOT_SUPPORTED" - 当前浏览器不支持定位功能
 *                      "FAILED" - 定位失败,失败原因可在message字段中获得。定位失败的原因
 *
 *          { String } GeolocationError.message
 *
 */
function getCurrentPositionByAMap(onf){

	var _iAMap;

	onf = onf || {};

	if(AMap.Geolocation){

		_getCurrentPositionByAMap(onf.success, onf.fail);

	}else{

		_iAMap = onf.iAMap;

		if(!(_iAMap instanceof AMap.Map)){
			_iAMap = new AMap.Map("AMap-mcGeo");
		}

		_iAMap.plugin("AMap.Geolocation", function(){
			_getCurrentPositionByAMap(onf.success, onf.fail);
		});

	}

}

/**
 *
 * @param success
 * @param fail
 * @private
 */
function _getCurrentPositionByAMap(success, fail){

	var geo;

	geo = new AMap.Geolocation({

		//是否使用高精度定位，默认:true
		enableHighAccuracy: true,

		// 默认为false，设置为true的时候可以调整PC端为优先使用浏览器定位，失败后使用IP定位
		GeoLocationFirst: true,

		//超过20秒后停止定位，默认：无穷大
		timeout: 1000 * 20,

		//定位结果缓存0毫秒，默认：0
		maximumAge: 0,

		// 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
		// 是否使用坐标偏移，取值true:为高德地图坐标，取值false:为浏览器定位坐标
		convert: true,

		// extensions用来设定是否需要周边POI、道路交叉口等信息，可选值'base'、'all'。
		// 默认为'base',只返回地址信息；
		// 设定为'all'的时候将返回周边POI、道路交叉口等信息。
		extensions: "all"

	});

	geo.getCurrentPosition(function(status, result){

		if("complete" === status){
			"function" === typeof success && success(result);

		}else if("error" === status){
			"function" === typeof fail && fail(result);
		}

	});
}

/**
 * 根据经纬度, 获取地点名称( 使用前, 请转化为高德坐标系 )
 *
 * @param { Object } onf
 * @param { Number } onf.lng 经度( 高德 坐标系 )
 * @param { Number } onf.lat 维度( 高德 坐标系 )
 *
 * @param { Number } [onf.radius] 逆地理编码时，以给定坐标为中心点，单位：米
 *                              取值范围：0-3000, 默认值：200
 *
 * @param { AMap } [onf.iAMap] 高德实例化
 *
 * @param { Function } [success( ReGeocode )]
 *
 *          { String } ReGeocode.address 地址名
 *
 *          { Object } ReGeocode.addressComponent 地址组成元素
 *          { Object } ReGeocode.addressComponent.province
 *          { Object } ReGeocode.addressComponent.city
 *          { Object } ReGeocode.addressComponent.citycode
 *          { Object } ReGeocode.addressComponent.district
 *          { Object } ReGeocode.addressComponent.district
 *          { Object } ReGeocode.addressComponent.adcode
 *          { Object } ReGeocode.addressComponent.township
 *          { Object } ReGeocode.addressComponent.street
 *          { Object } ReGeocode.addressComponent.streetNumber
 *
 *          { Object } ReGeocode.addressComponent.neighborhood
 *          { Object } ReGeocode.addressComponent.neighborhoodType
 *          { Object } ReGeocode.addressComponent.building
 *          { Object } ReGeocode.addressComponent.buildingType
 *          { Object } ReGeocode.addressComponent.businessAreas
 *
 *          { Array } ReGeocode.pois 兴趣点
 *          { String } ReGeocode.pois.id
 *          { String } ReGeocode.pois.name
 *          { String } ReGeocode.pois.type
 *          { String } ReGeocode.pois.tel
 *          { String } ReGeocode.pois.distance
 *          { String } ReGeocode.pois.direction
 *          { String } ReGeocode.pois.address
 *          { String } ReGeocode.pois.location
 *          { String } ReGeocode.pois.businessArea
 *
 *          { Array } ReGeocode.roads 道路信息列表
 *          { String } ReGeocode.roads.id
 *          { String } ReGeocode.roads.name
 *          { String } ReGeocode.roads.distance
 *          { String } ReGeocode.roads.location
 *          { String } ReGeocode.roads.direction
 *
 *          { Array } ReGeocode.crosses 道路路口列表
 *          { String } ReGeocode.crosses.distance
 *          { String } ReGeocode.crosses.direction
 *          { String } ReGeocode.crosses.location
 *          { String } ReGeocode.crosses.first_id
 *          { String } ReGeocode.crosses.first_name
 *          { String } ReGeocode.crosses.second_id
 *          { String } ReGeocode.crosses.second_name
 *
 *
 *  @param { Function } [fail]
 */
function getAddressFormCoordsByAMap(onf, success, fail){

	var _iAMap;

	onf = onf || {};

	if(AMap.Geocoder){

		_getAddressByAMap({
			position: onf,
			radius  : onf.radius
		}, success, fail);

	}else{

		_iAMap = onf.iAMap;

		if(!(_iAMap instanceof AMap.Map)){
			_iAMap = new AMap.Map("AMap-mcGeo");
		}

		_iAMap.plugin("AMap.Geocoder", function(){
			_getAddressByAMap({
				position: onf,
				radius  : onf.radius
			}, success, fail);
		});

	}

}

/**
 *
 * @private
 *
 * @param { Object } onf
 *
 * @param { Object } onf.position
 * @param { Number } onf.position.lng
 * @param { Number } onf.position.lat

 * @param { Number } [onf.radius] 逆地理编码时，以给定坐标为中心点，单位：米
 *                              取值范围：0-3000, 默认值：1000
 *
 * @param { String } [onf.city] 城市，地理编码时，设置地址描述所在城市
 *                            可选值: 城市名（中文或中文全拼）、citycode、adcode；
 *
 * @param { Function } [success]
 * @param { Function } [fail]
 */
function _getAddressByAMap(onf, success, fail){

	var geoCoder;

	geoCoder = new AMap.Geocoder({
		radius    : onf.radius || 200,
		batch     : false,
		extensions: "all"
	});

	geoCoder.getAddress([onf.position.lng, onf.position.lat], function(status, result){

		if("complete" === status){

			"function" === typeof success && success(result.regeocode);

		}else if("no_data" === status){

			"function" === typeof fail && fail("未查询此坐标地点名称!");

		}else if("error" === status){

			"function" === typeof fail && fail(result);

		}else{
			"function" === typeof fail && fail("未知错误");
		}

	});
}

/**
 * 原始坐标系(GPS)转换为BD坐标系
 * @param { Object } onf
 * @param { Number } onf.lng
 * @param { Number } onf.lat
 */
function gpsToBd09(onf, translateCallback){

	var convertor;

	if(!_hasOnStore("BMap.Convertor")){
		_putInStore("BMap.Convertor", new BMap.Convertor());
	}

	convertor = _getFormStore("BMap.Convertor");

	convertor.translate([new BMap.Point(onf.lng, onf.lat)], 1, 5, function(data){

		if(data.status === 0) {

			if("function" === typeof translateCallback){
				translateCallback(data.points[0]);
			}

		}

	});

}

/**
 * 批量原始坐标系(GPS)转换为BD坐标系
 * @param { Array } coordsArray
 * @param { Object } coordsArray.[]
 * @param { Number } coordsArray[].lng
 * @param { Number } coordsArray[].lat
 */
function batchGpsToBd09(coordsArray, translateCallback){

	var convertor;

	if(!_hasOnStore("BMap.Convertor")){
		_putInStore("BMap.Convertor", new BMap.Convertor());
	}

	convertor = _getFormStore("BMap.Convertor");

	convertor.translate(coordsArray, 1, 5, function(data){

		if(data.status === 0) {

			if("function" === typeof translateCallback){
				translateCallback(data.points);
			}

		}

	});

}


/**
 * 生成uuid
 * @param { Number } [count] 几倍8位长度
 * @returns {string}
 */
function generateUuid(count){

	if("number" !== typeof count || count !== count){
		count = 2;
	}

	return (count <= 1 ? "" : generateUuid(--count)) +
	       (Number((Math.random() + "").slice(2, 10) + ((new Date()).getTime() + "").slice(-10)).toString(16) + "").slice(0, 8)
	;
}

function _hasOnStore(prop){
	return STORE.hasOwnProperty(prop);
}

function _getFormStore(prop){
	return STORE[prop];
}

function _putInStore(prop, val){
	return STORE[prop] = val;
}

function mcGeo(){

}

export default mcGeo;


