const axios = require("axios");
const checkParameters = require("../lib/checkParameters");

//17_GWKW7w72QZcZPovXaD55EoKNblot34GNBORX106mXw_fNo4wY6KZ38jS5z7yzqHgFxTBhP3JJa7XW0-Qq1hnhMkN8qlY5t8JXky1V6HSDCWu8KJn10SsQj66F9wsF2_YSWny_m1B3BwaZlmhBSMfABAFWQ

class Wx{
	constructor(appkey,secret){
		this.appkey = appkey;
		this.secret = secret;
		this.access_token = null;
		this.total = 0;
	}


	async isReal(){
		let r = true;
		let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appkey}&secret=${this.secret}`;
		await axios({
			"method":"GET",
			"url":url,
			"timeout":5000
		}).then(res=>{
			if(checkParameters(res.data,["access_token"])){
				r = true;
				this.access_token = res.data.access_token;
			}else{
				r = false;
			}
		});
		return Promise.resolve(r);
	}

	async isAuthed(){
		let r = true;
		let url = `https://api.weixin.qq.com/cgi-bin/user/get?access_token=${this.access_token}&next_openid=`;
		await axios({
			"method":"GET",
			"url":url,
			"timeout":5000
		}).then(res=>{
			if(checkParameters(res.data,["next_openid"])){
				r = true;
				this.total = res.data.total;
			}else{
				r = false;
			}
		});
		return Promise.resolve(r);
	}

}


if(!module.parent){

	async function main(){
		let wx = new Wx("wx5f48869e357d5e5d","ba12856cc902770b516fd854e5900a89");

		let is_real = await wx.isReal();
		let is_authed = await wx.isAuthed();
		if(is_real && is_authed){
			
		}
		console.log(is_real,is_authed);
	}
	main();
}


module.exports = Wx;