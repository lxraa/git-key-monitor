const util = require("util");
const exec = util.promisify(require("child_process").exec);
const assert = require("assert");

const isMysqlOpen = async function(host,port,username,password){

	assert(typeof host == "string" && /^[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}$/.test(host));
	assert(typeof port == "number");

	const str = `mysql -h${host} -P${port} -u${username} -p${password} -e "select 1" --connect-timeout=2`;
	let r = true;
	// exec(str,function(err,stdout,stderr){
	// 	console.log(err,stdout,stderr);
	// });
	await exec(str).then(res=>{
		r = true;
	}).catch(e=>{
		r = false;
	});
	return Promise.resolve(r);
}

if(!module.parent){
	async function main(){
		console.log(await isMysqlOpen("123.59.75.85",3306,"biuser","1234509876"));
	}
	main();
}


module.exports = isMysqlOpen;