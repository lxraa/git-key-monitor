const request = require("../../lib/proxy_request");


describe("lib/proxy_request",function(){
	it("request by proxy,should return html page.Url should be http protocal",function(){
		return request({
			"method":"GET",
			"url":"http://163.com",
			"_proxy":true
		}).then(res=>{
			res.data.should.be.an.String();
		});
	});
})
