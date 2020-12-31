
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



