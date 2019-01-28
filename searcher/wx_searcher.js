const axios = require("axios");
const WxApi = require("../api/wx");
const GitApi = require("../api/git");
const WxModel = require("../model/mongoose_wx");
const mongoose = require("mongoose");
const fs = require("fs");

const logger = require("../lib/logger");

const gitApi = new GitApi("ff7a9ca596bf1d73dad07532082c8db1e85c1eec");


class WxSearcher{
	constructor(search_strs){
		//			pattern_appkey : "wx[a-z0-9]{16}",
		//			pattern_secret : "[A-Za-z0-9]{32}",
		this.appkey_pattern = new RegExp("wx[a-z0-9]{16}","mg");
		this.secret_pattern = new RegExp("[^a-zA-Z0-9][A-Za-z0-9]{32}[^a-zA-Z0-9]","mg");

		this.search_strs = search_strs.map(input=>{return encodeURIComponent(input);});//["wx appkey","wx appid","wx secret","wx token"];

	}

	getSecretMatchArr(str,pattern){
		let origin_arr = str.match(pattern);
		let arr = [];
		for(let i in origin_arr){
			arr.push(origin_arr[i].substr(1,32));
		}
		return arr;
	}

	writeTooManyUrl(str){
		fs.writeFile(__dirname + "/../data/too_many_url.txt",str+"\n",{"flag":"a"},function(){});
	}

	async matchFromItem(item){
		logger.info(`[*] 检查${item.html_url}`);
		const MAX_CHECK_TIMES = 100;
		let check_times = 0;
		let raw_url = gitApi.transHtmlurlToRawUrl(item.html_url);
		await axios({
			"method":"GET",
			"url":raw_url,
			"timeout":5000
		}).then(async res=>{
			let data = res.data;
			let appkeys = data.match(this.appkey_pattern);
			let secrets = this.getSecretMatchArr(data,this.secret_pattern);
			appkeys = appkeys ? appkeys:[];
			secrets = secrets ? secrets:[];
			let done_appkey = [];	//剪枝
			let done_secret = [];	
			
			for(let appkey of appkeys){
				for(let secret of secrets){
					let is_exist = await WxModel.isExist(appkey,secret);
					if(is_exist){
						done_secret.push(secret);	//保护生态环境，检查过的appkey，secret不再重复尝试，获取open_id有次数限制
						done_appkey.push(appkey);
						break;
					}



					if(done_secret.indexOf(secret) != -1 || done_appkey.indexOf(appkey) != -1){
						continue;
					}
					//一个文件超过100次的不再检查，url log到本地
					if(check_times > MAX_CHECK_TIMES){
						this.writeTooManyUrl(item.html_url);
						break;
					}

					check_times = check_times + 1;
					let a_wx = new WxApi(appkey,secret);
					let is_real = await a_wx.isReal();
					if(!is_real){
						break;
					}
					let is_authed = await a_wx.isAuthed();
					if(is_real && is_authed){
						logger.info(`[*] Got a authed key from ${item.html_url}`);
						await WxModel.findOneAndUpdate({"appkey":a_wx.appkey},{"secret":a_wx.secret,"user_total":a_wx.total,"origin_url":item.html_url,"authed":true},{"upsert":true});
						done_secret.push(secret);
						done_appkey.push(appkey);
						break;
					}else if(is_real){
						logger.info(`[*] Got a unauthed key from ${item.html_url}`);
						await WxModel.findOneAndUpdate({"appkey":a_wx.appkey},{"secret":a_wx.secret,"user_total":a_wx.total,"origin_url":item.html_url,"authed":false},{"upsert":true});
						done_secret.push(secret);
						done_appkey.push(appkey);
						break;
					}
				}

			}

		});

	}

	async run(){
		for(let i = 0;i <= 10; i++){
			for(let str of this.search_strs){
				await gitApi.searchCode(str,i).then(async res=>{
					logger.info(`[*] WxSearcher获取第${i}页数据 str:${str}`);
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
		logger.info("[*] end")
	}

}


if(!module.parent){
	mongoose.connect("mongodb://localhost/key-monitor",{ useNewUrlParser: true });
	let wxSearcher = new WxSearcher(["'token'           => '', // 填写你设定的key             'appid'           => ''"])//["api.weixin.qq.com","wechat appkey","wechat secret","wx appkey","wx appid","wx secret","wx token"]);
	// "// 开发者中心-配置项-AppID(应用ID)"	https://github.com/gaoming13/wechat-php-sdk
	// "填写高级调用功能的app id,"		https://github.com/dodgepudding/wechat-php-sdk
	// "use EasyWeChat\Factory;"	https://github.com/overtrue/wechat


	// console.log(wxSearcher.transHtmlurlToRawUrl("https://github.com/YuTongNetworkTechnology/wechat_live/blob/01ac64fb9acdd06f59bc1739812495fbc5ddc889/pages/public/register_wx.js"));
	wxSearcher.run().catch(e=>{logger.error(e);});
}


module.exports = WxSearcher;

	/*
	{ name: 'MainAPIServiceImp.java',
       path:
        'app/src/main/java/com/yeohe/rxdemo/api/MainAPIServiceImp.java',
       sha: '5be58a53d9ce69ec1fce5ce50dbb2418ab8ffe7f',
       url:
        'https://api.github.com/repositories/117205677/contents/app/src/main/java/com/yeohe/rxdemo/api/MainAPIServiceImp.java?ref=9114eeab5bdf0529e237a66ec6d0c37c60213260',
       git_url:
        'https://api.github.com/repositories/117205677/git/blobs/5be58a53d9ce69ec1fce5ce50dbb2418ab8ffe7f',
       html_url:
        'https://github.com/laiyongshan/RxDemo/blob/9114eeab5bdf0529e237a66ec6d0c37c60213260/app/src/main/java/com/yeohe/rxdemo/api/MainAPIServiceImp.java',
       repository: [Object],
       score: 29.53241 } ] }

	*/

	/*

	{ id: 88692880,
  node_id: 'MDEwOlJlcG9zaXRvcnk4ODY5Mjg4MA==',
  name: 'MKUMengShare',
  full_name: 'markStudy/MKUMengShare',
  private: false,
  owner:
   { login: 'markStudy',
     id: 15223695,
     node_id: 'MDQ6VXNlcjE1MjIzNjk1',
     avatar_url: 'https://avatars3.githubusercontent.com/u/15223695?v=4',
     gravatar_id: '',
     url: 'https://api.github.com/users/markStudy',
     html_url: 'https://github.com/markStudy',
     followers_url: 'https://api.github.com/users/markStudy/followers',
     following_url:
      'https://api.github.com/users/markStudy/following{/other_user}',
     gists_url: 'https://api.github.com/users/markStudy/gists{/gist_id}',
     starred_url:
      'https://api.github.com/users/markStudy/starred{/owner}{/repo}',
     subscriptions_url: 'https://api.github.com/users/markStudy/subscriptions',
     organizations_url: 'https://api.github.com/users/markStudy/orgs',
     repos_url: 'https://api.github.com/users/markStudy/repos',
     events_url: 'https://api.github.com/users/markStudy/events{/privacy}',
     received_events_url: 'https://api.github.com/users/markStudy/received_events',
     type: 'User',
     site_admin: false },
  html_url: 'https://github.com/markStudy/MKUMengShare',
  description: '利用友盟实现第三方登录和分享',
  fork: false,
  url: 'https://api.github.com/repos/markStudy/MKUMengShare',
  forks_url: 'https://api.github.com/repos/markStudy/MKUMengShare/forks',
  keys_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/keys{/key_id}',
  collaborators_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/collaborators{/collaborator}',
  teams_url: 'https://api.github.com/repos/markStudy/MKUMengShare/teams',
  hooks_url: 'https://api.github.com/repos/markStudy/MKUMengShare/hooks',
  issue_events_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/issues/events{/number}',
  events_url: 'https://api.github.com/repos/markStudy/MKUMengShare/events',
  assignees_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/assignees{/user}',
  branches_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/branches{/branch}',
  tags_url: 'https://api.github.com/repos/markStudy/MKUMengShare/tags',
  blobs_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/git/blobs{/sha}',
  git_tags_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/git/tags{/sha}',
  git_refs_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/git/refs{/sha}',
  trees_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/git/trees{/sha}',
  statuses_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/statuses/{sha}',
  languages_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/languages',
  stargazers_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/stargazers',
  contributors_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/contributors',
  subscribers_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/subscribers',
  subscription_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/subscription',
  commits_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/commits{/sha}',
  git_commits_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/git/commits{/sha}',
  comments_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/comments{/number}',
  issue_comment_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/issues/comments{/number}',
  contents_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/contents/{+path}',
  compare_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/compare/{base}...{head}',
  merges_url: 'https://api.github.com/repos/markStudy/MKUMengShare/merges',
  archive_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/{archive_format}{/ref}',
  downloads_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/downloads',
  issues_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/issues{/number}',
  pulls_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/pulls{/number}',
  milestones_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/milestones{/number}',
  notifications_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/notifications{?since,all,participating}',
  labels_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/labels{/name}',
  releases_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/releases{/id}',
  deployments_url:
   'https://api.github.com/repos/markStudy/MKUMengShare/deployments' }

	*/



