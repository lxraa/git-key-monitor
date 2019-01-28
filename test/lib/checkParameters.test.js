const checkParameters = require("../../lib/checkParameters");
const should = require("should");

describe("lib/checkParameters.js",function(){
	it("checkParameters should return true",function(done){
		checkParameters({"test":123,"test2":456},["test","test2"]).should.be.ok();
		done();
	});

	it("checkParameters should return false",function(done){
		checkParameters({"test":456,"test2":678},["test3","test4"]).should.not.be.ok();
		done();
	});
});