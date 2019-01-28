const mongoose = require("mongoose");

let WxAppSchema = new mongoose.Schema({
	"appkey":String,
	"secret":String,
	"user_total":{"type":Number,"default":0},
	"origin_url":String,
	"authed":{"type":Boolean,"default":false}
});

let WxApp = new mongoose.model("WxApp",WxAppSchema);

WxApp.isExist = async function(appkey,secret){
	let is_exist = false;
	await this.findOne({"appkey":appkey,"secret":secret}).then(res=>{
		if(res){
			is_exist = true;
		}
	});

	return Promise.resolve(is_exist);
}


if(!module.parent){
	mongoose.connect("mongodb://localhost/key-monitor",{ useNewUrlParser: true });
	async function main(){
		WxApp.find({"authed":true}).then(res=>{
			console.log(res);
		});
	}
	main(); 
}


module.exports = WxApp;


