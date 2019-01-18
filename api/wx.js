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
			"url":url
		}).then(res=>{
			if(checkParameters(res.data,["access_token"])){
				r = true;
				this.access_token = res.data.access_token;
			}else{
				r = false;
			}
		});
		return r;
	}

	async isAuthed(){
		let r = true;
		let url = `https://api.weixin.qq.com/cgi-bin/user/get?access_token=${this.access_token}&next_openid=`;
		await axios({
			"method":"GET",
			"url":url
		}).then(res=>{
			if(checkParameters(res.data,["next_openid"])){
				r = true;
				this.total = res.data.total;
			}else{
				r = false;
			}
		});
		return r;
	}

}


if(!module.parent){
	let wx = new Wx("wxbc321b15c6175e60","8c26a6be17ca88de6140fcd78288f702");
	wx.isReal().then(res=>{
		console.log(res);
	});
}


module.exports = Wx;