const axios = require("axios");
const util = require("util");
class Git{
	constructor(key){
		this.key = key;
	}

	getHeaders(){
		return {
			"Authorization":`token ${this.key}`
		}
	}

	async graphql(data){
		await axios({
			"method":"POST",
			"url":`https://api.github.com/graphql`,
			"headers":this.getHeaders(),
			"data":{"query":data}
		}).then(res=>{
			console.log(res.data);
		}).catch(e=>{
			console.log(e);
		});

	}

	async getApiDocs(){
		let r ;
		await axios({
			"method":"GET",
			"url":"https://api.github.com",
			"headers":this.getHeaders()
		}).then(res=>{
			r = res.data;
		});
		return r;
	}

	async searchUsers(q,p){
		let r ;
		await axios({
			"method":"GET",
			"url":`https://api.github.com/search/users?q=${q}&page=${p}&per_page=100`,
			"headers":this.getHeaders()
		}).then(res=>{
			r = res.data;
		});
		return r;
	}

	async searchCode(q,p){
		let r;
		await axios({
			"method":"GET",
			"url":`https://api.github.com/search/code?q=${q}&page=${p}&per_page=100`,//{&page,per_page,sort,order}`
			"headers":this.getHeaders()
		}).then(res=>{
			r = res.data;
		});
		return r;
	}
}

if(!module.parent){
	let git = new Git("459500e7e33c56247ac89e194b2ff1df7c82a3d0");
	git.searchCode("thinkphp",1).then(res=>{
		console.log(res);console.log(res.items.length)
	}).catch(e=>{
		console.log(e);
	});
	// git.searchUsers("lxraa");
	// git.getApiDocs().then(res=>{console.log(res);})
	/*
	{ name: 'Repository',
  kind: 'OBJECT',
  fields:
   [ { name: 'assignableUsers' },
     { name: 'branchProtectionRules' },
     { name: 'codeOfConduct' },
     { name: 'collaborators' },
     { name: 'commitComments' },
     { name: 'createdAt' },
     { name: 'databaseId' },
     { name: 'defaultBranchRef' },
     { name: 'deployKeys' },
     { name: 'deployments' },
     { name: 'description' },
     { name: 'descriptionHTML' },
     { name: 'diskUsage' },
     { name: 'forkCount' },
     { name: 'forks' },
     { name: 'hasIssuesEnabled' },
     { name: 'hasWikiEnabled' },
     { name: 'homepageUrl' },
     { name: 'id' },
     { name: 'isArchived' },
     { name: 'isFork' },
     { name: 'isLocked' },
     { name: 'isMirror' },
     { name: 'isPrivate' },
     { name: 'issue' },
     { name: 'issueOrPullRequest' },
     { name: 'issues' },
     { name: 'label' },
     { name: 'labels' },
     { name: 'languages' },
     { name: 'licenseInfo' },
     { name: 'lockReason' },
     { name: 'mentionableUsers' },
     { name: 'mergeCommitAllowed' },
     { name: 'milestone' },
     { name: 'milestones' },
     { name: 'mirrorUrl' },
     { name: 'name' },
     { name: 'nameWithOwner' },
     { name: 'object' },
     { name: 'owner' },
     { name: 'parent' },
     { name: 'primaryLanguage' },
     { name: 'project' },
     { name: 'projects' },
     { name: 'projectsResourcePath' },
     { name: 'projectsUrl' },
     { name: 'pullRequest' },
     { name: 'pullRequests' },
     { name: 'pushedAt' },
     { name: 'rebaseMergeAllowed' },
     { name: 'ref' },
     { name: 'refs' },
     { name: 'release' },
     { name: 'releases' },
     { name: 'repositoryTopics' },
     { name: 'resourcePath' },
     { name: 'shortDescriptionHTML' },
     { name: 'squashMergeAllowed' },
     { name: 'sshUrl' },
     { name: 'stargazers' },
     { name: 'updatedAt' },
     { name: 'url' },
     { name: 'viewerCanAdminister' },
     { name: 'viewerCanCreateProjects' },
     { name: 'viewerCanSubscribe' },
     { name: 'viewerCanUpdateTopics' },
     { name: 'viewerHasStarred' },
     { name: 'viewerPermission' },
     { name: 'viewerSubscription' },
     { name: 'watchers' } ] }


	*/
	// let git = new Git("459500e7e33c56247ac89e194b2ff1df7c82a3d0");
	// git.graphql(`query { 
	// 	query(query:"test",first:10,type:REPOSITORY){
	// 		edges{
	// 			cursor,
	// 			node{
	// 				... on Repository {
	// 					name
	// 				}
	// 			}
	// 		}
	// 	}
	// }`);

	// git.graphql(`query{
	// 	__type(name:resource){
	// 		name,
	// 		kind,
	// 		fields{
	// 			name
	// 		}
	// 	}
	// }`)
}

module.exports = Git;

