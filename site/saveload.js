var fs = require("fs")

module.exports = {}

module.exports.saveCharData = function(file, data) {
	try {
		var data = JSON.stringify(playerData, null, "\t")
		try {
			fs.writeFileSync(file, data)
			return true
		} catch {
			console.error(file, "Error writing file")
			return false
		}
	} catch {
		console.error(file, "Error stringifying json data")
		return false
	}
}

module.exports.loadCharData = function(file) {
	
	try {
		var data = fs.readFileSync(file, data)
		try {
			var converted = JSON.parse(data.toString())
			playerData = converted
			return true
		} catch {
			console.error(file, "Error converting json to data")
			return false
		}
	} catch {
		console.error(file, "Error reading file data")
		return false
	}
}