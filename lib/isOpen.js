const isopen = require("isopen");
const util = require("util");
let nmap = {};

const isOpen = async function(ip,port){
	return new Promise((resolve,reject)=>{
		isopen(ip,port,function(res){
			Promise.resolve(resolve(res[port].isOpen));
		});
	});

}

if(!module.parent){
	async function main(){
		console.log(await isOpen("127.0.0.1",3001));
	}
	main();
	// isOpen("127.0.0.1",3001).then((res)=>{
	// 	console.log(res);
	// });
}

module.exports = isOpen;