const request = require("../lib/proxy_request");

class Gitee{
	constructor(access_token){
		this.access_token = access_token;
	}


	async searchCode(q,p){
		await request({
			"method":"GET",
			"url":`http://gitee.com/api/v5/search/gists?access_token=${this.access_token}&q=${q}&page=${p}&per_page=100&order=desc`		
		}).then(res=>{
			console.log(res.data);
		});

	}

}

if(!module.parent){
	let gitee = new Gitee("91738842fffc01568a2bcb9cacafeb17");
	gitee.searchCode("test",1);
}

module.exports = Gitee;

