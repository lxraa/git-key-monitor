const WxApi = require("../api/wx");
const GitApi = require("../api/git");
const WxModel = require("../model/mongoose_wx");


const gitApi = new GitApi("459500e7e33c56247ac89e194b2ff1df7c82a3d0");

class WxSearcher{
	constructor(){
		//			pattern_appkey : "wx[a-z0-9]{16}",
		//			pattern_secret : "[A-Za-z0-9]{32}",
		this.appkey_pattern = new RegExp("wx[a-z0-9]{16}","mg");
		this.secret_pattern = new RegExp("[A-Za-z0-9]{32}","mg");
		
	}

	async run(){
		for(let i = 0;i <= 10; i++){
			await gitApi.searchCode("wx appkey").then(res=>{
				console.log(res);
			});
			break;
		}
	}

}


if(!module.parent){
	let wxSearcher = new WxSearcher();
	wxSearcher.run();
}


module.exports = WxSearcher;



