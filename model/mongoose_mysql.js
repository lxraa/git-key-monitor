const mongoose = require("mongoose");

let MysqlSchema = new mongoose.Schema({
	"username":String,
	"password":String,
	"host":String,
	"port":{"type":Number,"default":0},
	"user_total":{"type":Number,"default":0},
	"origin_url":String,
	"authed":{"type":Boolean,"default":false}
});

let Mysql = new mongoose.model("MysqlSchema",MysqlSchema);


module.exports = Mysql;