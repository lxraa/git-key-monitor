const mongoose = require("mongoose");

let WxAppSchema = new mongoose.Schema({
	"appkey":String,
	"secret":String,
	"user_total":Number
});

let WxApp = new mongoose.model("WxApp",WxAppSchema);



module.exports = WxApp;


