const axios = require("axios");

class Proxy{
	constructor(url){
		this.url = url;
	}

	async getProxys(){
		let ips = [];
		await axios({
			"url":`${this.url}`,
			"method":"GET"
		}).then(res=>{
			ips = res.data;
		});
		return ips;
	}
}


if(!module.parent){
	let proxy = new Proxy("http://localhost:8000");
	proxy.getProxys().then(res=>{
		console.log(res);
	});
}

module.exports = Proxy;


