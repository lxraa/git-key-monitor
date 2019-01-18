const xml = require("xml");
const axios = require("axios");
const utils = require("../utils/wx_utils");


class Wxpay{
	constructor(auth_info){
		this.auth_info = auth_info;
	}

	async orderQuery(orderId){
		let url = "https://api.mch.weixin.qq.com/pay/orderquery";
		let nonce_str = utils.random(32);

		let param_list = [{"appid":this.auth_info.appid},{"mch_id":this.auth_info.mch_id},{"nonce_str":nonce_str},{"out_trade_no":out_trade_no}];
		let sign = utils.sign(param_list,this.auth_info.key);
		param_list.push({"sign":sign});

		let data = xml({"xml":param_list});

		await axios({
			"method":"POST",
			"url":url,
			"data":data
		}).then((res)=>{
			// console.log(res);
		});
	}

	async downloadBill(date){
		let url = "https://api.mch.weixin.qq.com/pay/downloadbill";
		let nonce_str = utils.random(32);
		let param_obj = {"appid":this.auth_info.appid,"mch_id":this.auth_info.mch_id,"nonce_str":nonce_str,"sign_type":"HMAC-SHA256","bill_date":date,"bill_type":"ALL"};
		
		param_obj = utils.sortKeys(param_obj);

		param_obj["sign"] = utils.sign(param_obj,this.auth_info.key);
		let param_list = utils.transObjectToList(param_obj);

		let data = xml({"xml":param_list});
		await axios({
			"method":"POST",
			"url":url,
			"data":data
		}).then((res)=>{
			console.log(res.data);
		});
	}

}

if(!module.parent){
	let auth_info = {
		"appid":"wx65fb82891ec02983",	
		"mch_id":"1496420532",
		"key":"f4286961d4a52f30102f64339f60bb8c"
	}
	// let auth_info = {
	// 	"appid":"wx7c9376486e203c66",	// *
	// 	"mch_id":"1317786501",
	// 	"key":"3248v0n90vcm8u305uvn23m85ux40924"
	// }
	// let auth_info = {
	// 	"appid":"wx535dc2a26c1e921f",
	// 	"mch_id":"1310292801",
	// 	"key":"815d0a9fdb26a29f3c20a7c739d95246"
	// }
	// let auth_info = {
	// 	"appid":"wxb0019efef2ec5765",
	// 	"mch_id":"1386106702",
	// 	"key":"biaotutech2ws3ed4rfty7iko0sdfewc"
	// }
	// let auth_info = {
	// 	"appid":"wx71bf4748b6a49bfd",
	// 	"mch_id":"1500337802",
	// 	"key":"sxod3h0oxdashukw0e1ek3p4injsn1gc"
	// }
	// let auth_info = {
	// 	"appid":"wxf40d245aecc8f942",
	// 	"mch_id":"1483680372",
	// 	"key":"ce7a30f07af910ce06f6d7a22c713b84"
	// }
	// let auth_info = {		*
	// 	"appid":"wxd11509514ffc5faf",
	// 	"mch_id":"1336922201",
	// 	"key":"zl5dscvpfbemgzf3jddw3wgpeorjqsky"
	// }
	// let wxpay = new Wxpay({
	// 	"appid":"wx619a0d7ff2899657",
	// 	"mch_id":"1481201352",
	// 	"key":"0378881f16430cf597cc1617be53db37"
	// });
	let wxpay = new Wxpay(auth_info);
	for(let i = 1;i < 30;i++){
		let str = i.toString();
		if(str.length == 1){
			str = "0" + str;
		}
		wxpay.downloadBill("201811" + str);
	}
	
}

module.exports = Wxpay;
