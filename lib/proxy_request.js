const axios = require("axios");
const Proxy_ = require("../api/proxy");
const config = require("../config");

function getRandomUA(){
	let list = [
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36",
		"Mozilla/5.0 (X11; Linux i686; rv:64.0) Gecko/20100101 Firefox/64.0",
		"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:64.0) Gecko/20100101 Firefox/64.0",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A",
		"Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25",
		"Opera/9.80 (X11; Linux i686; Ubuntu/14.10) Presto/2.12.388 Version/12.16",
		"Opera/9.80 (Macintosh; Intel Mac OS X 10.14.1) Presto/2.12.388 Version/12.16",
		"Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14",
		"Mozilla/5.0 (Windows NT 6.0; rv:2.0) Gecko/20100101 Firefox/4.0 Opera 12.14",
		"Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0) Opera 12.14",
		"Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/44.0.2403.155 Safari/537.36",
		"Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/532.2 (KHTML, like Gecko) ChromePlus/4.0.222.3 Chrome/4.0.222.3 Safari/532.2",
		"Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.28.3 (KHTML, like Gecko) Version/3.2.3 ChromePlus/4.0.222.3 Chrome/4.0.222.3 Safari/525.28.3",
		"Mozilla/5.0 (X11; Linux i586; rv:63.0) Gecko/20100101 Firefox/63.0",
		"Mozilla/5.0 (Windows NT 6.2; WOW64; rv:63.0) Gecko/20100101 Firefox/63.0",
		"Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.10; rv:62.0) Gecko/20100101 Firefox/62.0",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:10.0) Gecko/20100101 Firefox/62.0"
	];

	let index = +(Math.random()*(list.length-1)).toFixed();
	return list[index];

}
async function getGoodProxy(ips){
	let proxys;
	let good_proxys = [];
	let proxy = new Proxy_(config.proxy_url);
	await proxy.getProxys().then(res=>{
		proxys = res;
	});
	for(let i of proxys){
		if(i[2] >= 10){
			good_proxys.push({
				"ip":i[0],
				"port":i[1],
				"rank":i[2]
			});
		}
	}
	
	let random = +(Math.random()*(good_proxys.length-1)).toFixed();

	return good_proxys[random];
}


proxyRequest = async function(params){
	params["timeout"] = params["timeout"]?params["timeout"]:5000;
	if(params.hasOwnProperty("headers")){
		params.headers["User-Agent"] = getRandomUA();
	}else{
		params.headers = {};
		params.headers["User-Agent"] = getRandomUA();
	}

	if(params._proxy){
		let res = null;
		let err = null;
		// 代理经常失效，所以试5次
		for(let i = 0;i <= 5;i++){
			let target;
			await getGoodProxy().then(res=>{
				target = res;
			});
			let h = {
				"host":target.ip,
				"port":target.port
			};

			params.proxy = h;
			try{
				res = await axios(params);
			}catch(e){
				err = e;
			}
			if(res){
				break;
			}
		}
		
		return res;

	}else{
		let res =  await axios(params);
		return res;
	}
}
if(!module.parent){
	proxyRequest({
		"method":"GET",
		"url":"http://baidu.com",
		"_proxy":true
	}).then(res=>{
		console.log(res.data);
	});
}


module.exports = proxyRequest;
