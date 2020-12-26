var armorData = null
var armorList = null
var filteredCategories = {}

function loadArmorData() {
	var loader = require("./dataloader")
	armorData = loader.loadArmorData()
	console.log("armorData loaded!", Object.keys(armorData).length, "armor categories!")
}

function initArmorList() {
	loadArmorData()


	var options = {
		item: "armor-item",
		valueNames: [
			"armor_name",
			"armor_AVC",
			"armor_AVP",
			"armor_AVB",
			"armor_coverage",
			"armor_qualities",
			"armor_weight",
			"armor_pp",
			"armor_cost",
			
			{ data: ["id"] },
			{ data: ["cpcost"] },
			{ data: ["category"] }
		]
	}
	armorList = new List("armor-list", options)
	for (var armorCategoryIndex in armorData) {
		var armorCategory = armorData[armorCategoryIndex]
		for (var armorIndex in armorCategory) {
			var armorPiece = armorCategory[armorIndex]
			if (armorPiece.Id != null) {
				//console.log("item", armorPiece)
				var coverageCount = 0
				var coverageLocations = armorPiece.Coverage.locations
				if (coverageLocations !== null && coverageLocations !== undefined && coverageLocations !== "undefined") {
					coverageCount = (coverageLocations.length || 0)
				}
				
				armorList.add({
					armor_name: armorPiece.Name, id: armorPiece.Id, 
					armor_AVC: armorPiece.AVC, armor_AVP: armorPiece.AVP, armor_AVB: armorPiece.AVB,
					armor_coverage: armorPiece.Coverage.string || "",
					armor_qualities: armorPiece.Qualities,
					armor_weight: armorPiece.Weight,
					armor_pp: (parseInt(armorPiece.PP) || 0),
					armor_cost: armorPiece.Cost, cpcost: armorPiece.CpCost, 
					qualitycount: armorPiece.Qualities.length,
					coveragecount: coverageCount,
					category: armorCategoryIndex
				})
			}
		}
		filteredCategories[armorCategoryIndex] = false
		$("#filter-template").clone().css("display", "").appendTo("#filters").attr("data-filtercat", armorCategoryIndex).text(armorCategoryIndex)
	}
	

	armorList.sort('armor_pp', { sortFunction: function(before, after) {
		if (before > after) { return 1; }
            if (before < after) { return -1; }
            else { return 0; }
	} });
}

function applyArmorFilter(category, doFilter) {
	filteredCategories[category] = (doFilter == null)
	armorList.filter(function(item) {
		if (filteredCategories[item.values().category] == true) {
			return false
		} else {
			return true
		}
	})
}

function removeArmorFilter(category) {
	applyArmorFilter(category, false)
}

function removeAllArmorFilters() {
	for (var filterIndex in filteredCategories) {
		filteredCategories[filterIndex] = false
	}
	armorList.filter()
}

function armorFilterClicked(btn) {
	var category = btn.getAttribute("data-filtercat")
	console.log("btn", btn, category)
	$(btn).toggleClass("filterClicked")
	if (filteredCategories[category] == false) {
		applyArmorFilter(category)
		//filteredCategories[category] = true
	} else {
		removeArmorFilter(category)
		//applyArmorFilter(category, false)
		//filteredCategories[category] = false
	}
}