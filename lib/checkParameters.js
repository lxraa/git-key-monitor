
function checkParameters(i,properties){
	//必须为Object
	if(!(i instanceof Object)){
		return false;
	}
	// let properties = ["ip","port","protocol","description"];
	for(let p of properties){
		if(i.hasOwnProperty(p)){
			continue;
		}else{
			return false;
		}
	}
	return true;
}

module.exports = checkParameters;
