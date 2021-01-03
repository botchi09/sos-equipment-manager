
var pluralize = require("pluralize")

var hitLocationsObject = {
	"Belly":8,"Chest":6,"Elbows":12,"Face":2,"Feet":18,
	"Forearms":13,"Full head":21,"Full torso":22,"Groin":10,"Hands":14,
	"Hips":9,"Knees":16,"Lower Back":20,"Lower Head":3,"Neck":4,
	"Shins":17,"Shoulders":5,"Sides":7,"Thighs":15,"Upper Arms":11,
	"Upper Back":19,"Upper Head":1, "Full Arms": 23, "Full legs": 24
}

//Full head, full torso, full arms full legs
var fullCoverages = {
	21:[1, 2, 3], 22:[6, 7, 8, 9, 19, 20], 23: [5, 11, 12, 13, 14], 24: [15, 16, 17, 18]
}


var hitLocationsArray = []
Object.keys(hitLocationsObject).map((key) => hitLocationsArray[hitLocationsObject[key]]=key) //Create reverse map for lookup


module.exports = {}
module.exports.hitZoneFromName = function(name) {
	return hitLocationsObject[name]
}

module.exports.stringToHitZones = function(locationArrayString) {
	var lowerCaseLocations = hitLocationsArray.map(s => s.toLowerCase())
	var weakSpotStr = "‡"
	var halfSpotStr = "½"
	var thrustSpecialStr = "(Th)".toLowerCase()
	
	var splitLocations = locationArrayString.toLowerCase().split(", ")
	
	var container = {locations:[], halfProt: [], weakSpot: [], string: locationArrayString, special: ""}
	for (var locationIndex in splitLocations) {
		var loc = splitLocations[locationIndex]
		var locTrimmed = loc.replace(weakSpotStr, "").replace(halfSpotStr,"").replace(thrustSpecialStr, "").trim()
		var locHitZone = lowerCaseLocations.indexOf(locTrimmed)
		if (locHitZone == -1) {
			locHitZone = lowerCaseLocations.indexOf(pluralize(locTrimmed))
		}
		
		if (locHitZone == -1) { //Second sanity check
			container.string = ""
			return container
		}
		
		container.locations.push(locHitZone)

		if (loc.search(halfSpotStr) > -1) {
			container.halfProt.push(locHitZone)
		}
		
		if (loc.search(weakSpotStr) > -1) {
			container.weakSpot.push(locHitZone)
		}

	}
	
	//Expand out any full coverages
	for (var i=0;i<container.locations.length; i++) {
		var hitZone = container.locations[i]
		if (fullCoverages[hitZone] !== null && typeof(fullCoverages[hitZone]) !== "undefined") {
			
			container.locations.splice(i, 1)
			var merged = fullCoverages[hitZone].concat(container.locations)
			merged = merged.filter((item,index)=>{
			   return (merged.indexOf(item) == index)
			})
			container.locations = merged
			
		}
	}
	
	return container
	
}



