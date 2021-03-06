var fs = require("fs")
const assignDeep = require("assign-deep")

module.exports = {}
module.exports.loadArmorData = function(){
	
	var armorDir = "site/data/armor/"
	var lines = require("fs").readFileSync(armorDir + "loadlist.txt", 'utf-8')
    .split("\n").map(line => line.split(","))
	
	var armorData = {}
	
	for (var i=0;i<lines.length;i++) {
		if (parseInt(lines[i][0]) == 1) {
			var fileName = lines[i][1].trim()
			console.log("reading", fileName)
			try {
				var fileData = fs.readFileSync(armorDir + fileName)
				try {
					assignDeep(armorData, JSON.parse(fileData))
				} catch {
					console.error("JSON parse error in", fileName)
				}
			} catch {
				console.error("File read error for", fileName)
			}
			
			
		}
	}
	
	return armorData
}

module.exports.loadArmorsWeapons = function(){console.log("TODO")}