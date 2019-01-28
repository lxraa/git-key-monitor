const GitApi = require("../api/git");

const isOpen = require("../lib/isOpen");
const isMysqlOpen = require("../lib/isMysqlOpen");
const isPrivateIp = require("private-ip");
const logger = require("../lib/logger");
const request = require("../lib/proxy_request");

const MysqlModel = require("../model/mongoose_mysql");

const gitApi = new GitApi("ff7a9ca596bf1d73dad07532082c8db1e85c1eec");

class MysqlSearcher{
	constructor(search_strs){
		this.jdbc_pattern = new RegExp("[^a-zA-Z0-9]{0,}jdbc\\\\{0,1}:(mysql|mariadb)\\\\{0,1}:\\\\{0,1}/\\\\{0,1}/(?<host>[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\\\\{0,1}:(?<port>[0-9]{0,5})\\\\{0,1}/","mg");
		this.username_pattern = new RegExp("\.user\\w{0,}?=\\s{0,}?[\"\']{0,1}(?<username>.*?)[\"\']{0,1}\\s","mg");
		this.password_pattern = new RegExp("\.pass\\w{0,}?=\\s{0,}?[\"\']{0,1}(?<password>.*?)[\"\']{0,1}\\s","mg");
		//"jdbc:mysql://localhost:3306/mts_app?useUnicode=true&characterEncoding=GBK"
		this.search_strs = search_strs.map(input=>{return encodeURIComponent(input);});;
	}

	getAllPassword(str){
		let passwords = [];
		while(true){
			let r = this.password_pattern.exec(str);
			if(r == null){
				break;
			}else{
				let groups = r.groups;
				if(passwords.indexOf(groups.password) == -1){
					passwords.push(groups.password);
				}
			}
		}
		return passwords;
	}

	getAllUsername(str){
		let usernames = [];
		while(true){
			let r = this.username_pattern.exec(str);
			if(r == null){
				break;
			}else{
				let groups = r.groups;
				if(usernames.indexOf(groups.username) == -1){
					usernames.push(groups.username);
				}
			}
		}
		return usernames;
	}

	getAllTarget(str){
		let targets = [];
		while(true){

			let r = this.jdbc_pattern.exec(str);
			if(r == null){
				break;
			}else{
				let groups = r.groups;
				if(isPrivateIp(groups.host)){
					continue;
				}else{
					targets.push({"host":groups.host,"port":groups.port});
				}
			}
		}
		return targets;
	}

	async matchFromItem(item){
		logger.info(`[*] 检查${item.html_url}`);
		let passwords = [];
		let usernames = [];
		let targets = [];

		let raw_url = gitApi.transHtmlurlToRawUrl(item.html_url);
		await request({
			"method":"GET",
			"url":raw_url,

		}).then(res=>{
			targets = this.getAllTarget(res.data);
			usernames = this.getAllUsername(res.data);
			passwords = this.getAllPassword(res.data);
		});

		console.log(targets,usernames,passwords);

		// for(let target of targets){
		// 	let real_target = target;

		// 	if(await isMysqlOpen(target.host,target.port)){

		// 	}else{

		// 	}
		// }

	}

	async run(){
		for(let str of this.search_strs){
			for(let i = 0;i <= 10; i++){
				logger.info(`[*] MysqlSearcher获取第${i}页数据 str:${str}`);
				await gitApi.searchCode(str,i).then(async res=>{
					if(res.items instanceof Array){
						for(let item of res.items){
							await this.matchFromItem(item).catch(e=>{
								logger.error(e);
							});
						}
					}else{
						logger.info(res);
					}
				});
			}
		}
		
	}
}

if(!module.parent){
	let mysqlSearcher = new MysqlSearcher(["hikaricp.password"]);
	mysqlSearcher.run();
	// isOpen("45.78.38.210",3306).then(res=>{
	// 	console.log(res);
	// });

	// const util = require("util");
	// let jdbc_pattern = "[^a-zA-Z0-9]{0,}jdbc:mysql://([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\:([0-9]{0,5})/";//"[^a-zA-Z0-9]{0,}jdbc:mysql://(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\:\d{1,5}\/(.*?)[^a-zA-Z0-9]{0,}";
	// let str = "jdbc:mysql://127.0.0.1:3306/mts_app?useUnicode=true&characterEncoding=GBK";
	// pattern = new RegExp(jdbc_pattern,"mg");
	// let a = pattern.exec(str);
	// console.log(str,util.inspect(a));


	// let url = new URL("mysql://111.93.20.30:3306/servicebay?autoReconnect=true");
	// let pattern = new RegExp("([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*")
	// let a = "baidu.com";
	// console.log(a.match(pattern));
	// console.log(validator.isURL(url));
}

module.exports = MysqlSearcher;