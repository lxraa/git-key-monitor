const Proxy = require("../../api/proxy");
const config = require("../../config");

describe("api/proxy.js",function(){
	it("A proxy list should be got",async function(){
		let proxy = new Proxy(config.proxy_url);
		return proxy.getProxys().then(function(res){
			res.should.be.an.Array();
		});
	});
});