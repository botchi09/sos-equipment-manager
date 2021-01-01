var utils = require("./utils")
const assignDeep = require("assign-deep")

module.exports = {}

module.exports.materials = {
		Bronze: "Bronze",
		Iron: "Iron",
		Steel: "Steel",
		Silversteel: "Silversteel",
		Orichalcum: "Orichalcum"
}

function modifyAVs(armor, mod) {
	armor.AVC+=mod
	armor.AVP+=mod
	armor.AVB+=mod
	if (armor.Coverage.locations && armor.Coverage.specialAV) {
		for (var i in armor.Coverage.specialAV) {
			armor.Coverage.specialAV+=mod
		}
	}
}

function roundToDecimal(val) {
	return (Math.floor(val * 2) / 2).toFixed(1)
}

module.exports.convertArmorToMaterial = function(armor, material) {
	var newArmor = {}
	assignDeep(newArmor, armor)
	
	switch (material) {
		case this.materials.Bronze:
			newArmor.CpCost = roundToDecimal(newArmor.CpCost *= 1.25)
			modifyAVs(newArmor, -2)
		break
		case this.materials.Iron:
			newArmor.CpCost = roundToDecimal(newArmor.CpCost *= 0.75)
			modifyAVs(newArmor, -2)
		break
		case this.materials.Steel:
			return newArmor //Same, but avoid byref
		break
		case this.materials.Silversteel:
			newArmor.CpCost = roundToDecimal(newArmor.CpCost *= 10)
			modifyAVs(newArmor, 2)
		break
		case this.materials.Orichalcum:
			newArmor.CpCost = roundToDecimal(newArmor.CpCost *= 50)
			modifyAVs(newArmor, 4)
		break
	}
	if (material !== this.materials.Steel) {
		newArmor.Cost = utils.CpToString(newArmor.CpCost)
		var commaStr = ", "
		if (newArmor.Qualities.length == 0) {
			commaStr = ""
		}
		newArmor.QualitiesString += commaStr + this.materials[material]
		newArmor.Qualities.push(this.materials[material])
		
	}
	
}