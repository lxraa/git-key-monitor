const crypto = require("crypto");
const sortKeys = require("sort-keys");

let utils = {};

utils.transObjectToList = function(obj){
	let list = [];
	Object.keys(obj).forEach((key)=>{
		let new_obj = {};
		new_obj[key] = obj[key];
		list.push(new_obj);
	});
	return list;
}


utils.transObjectToStr = function(sorted_obj){
	let list = [];

	Object.keys(sorted_obj).forEach((k)=>{
		let el = `${k.toString()}=${sorted_obj[k].toString()}`;
		list.push(el);
	});

	return list.join("&");
}


utils.sortKeys = function(param_obj){
	return sortKeys(param_obj);
}

utils.sign = function(param_obj,key){
	let sorted_obj = sortKeys(param_obj);

	let str = this.transObjectToStr(sorted_obj);
	str = str + `&key=${key}`;
	let sign = this.hmacSha256(str,key).toUpperCase();
	return sign;
}


utils.hmacSha256 = function(str,key){
	let hmac = crypto.createHmac("sha256",key);
	hmac.update(str);
	return hmac.digest("hex");
}

utils.random = function(len){

	if(!Number.isFinite(len)){
		throw new TypeError('Expected a finite number');
	}
	return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0,len);
};



module.exports = utils;