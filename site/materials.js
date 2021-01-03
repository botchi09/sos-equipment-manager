var utils = require("./utils")
const assignDeep = require("assign-deep")

module.exports = {}

module.exports.material = {
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
	return parseFloat((Math.ceil(val * 2) / 2).toFixed(1))
}

module.exports.convertArmorToMaterial = function(armor, material) {
	var newArmor = {}
	assignDeep(newArmor, armor)
	
	switch (material) {
		case this.material.Bronze:
			newArmor.CpCost += roundToDecimal(newArmor.CpCost *= 0.25)
			modifyAVs(newArmor, -2)
		break
		case this.material.Iron:
			newArmor.CpCost -= roundToDecimal(newArmor.CpCost *= 0.25)
			modifyAVs(newArmor, -2)
		break
		case this.material.Steel:
			return newArmor //Same, but avoid byref
		break
		case this.material.Silversteel:
			newArmor.CpCost += roundToDecimal(newArmor.CpCost *= 10)
			newArmor.Weight = roundToDecimal(newArmor.Weight / 2)
			modifyAVs(newArmor, 2)
		break
		case this.material.Orichalcum:
			newArmor.CpCost += roundToDecimal(newArmor.CpCost *= 50)
			modifyAVs(newArmor, 4)
		break
	}
	if (material !== this.material.Steel) {
		newArmor.Cost = utils.CpToString(newArmor.CpCost)
		newArmor.CpCost = parseInt(newArmor.CpCost)

		var commaStr = ", "
		if (newArmor.Qualities.length == 0) {
			commaStr = ""
		}
		newArmor.QualitiesString += commaStr + this.material[material]
		newArmor.Qualities[this.material[material]] = {level: 0, special: ""}
		
	}
	console.log(newArmor)
	return newArmor
}