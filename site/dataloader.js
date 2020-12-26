var fs = require("fs")

module.exports = {}
module.exports.loadArmorData = function(){
	
	return JSON.parse(fs.readFileSync("site/data/armor/default_armors.json"))
}

module.exports.loadArmorsWeapons = function(){console.log("TODO")}