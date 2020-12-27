var armorData = null
var armorList = null
var filteredArmorCategories = {}
var equippedArmor = {}
var armorDisplayBoxes = {}
var dollSizeMultiplier = 0.5 //Full size image would be really silly huge. Due to lib limitations we can't dynamically resize.

//Purely for creating and deciding the positions of armour display divs
function armorDisplayBox(id, x, y, mapAtEnd) {
	
	var boxWidth = 59
	var box = {}
	box.id = id
	box.x = x
	box.y = y
	
	var mapPos = 0
	if (mapAtEnd) {
		mapPos = 5
	}
	
	var boxTypes = ["c", "p", "b", "m", "w"]
	for (var i=0;i<6;i++) {
		var curX = (x + (i*boxWidth)) * dollSizeMultiplier
		var curY = (y + boxWidth) * dollSizeMultiplier
		if (i==mapPos) {
			var curBoxW = (curX+dollSizeMultiplier*boxWidth)
			var curBoxH = (curY+dollSizeMultiplier*boxWidth)
			$("<area target='' alt='"+id+"' shape='rect' id='armor-map-"+id+"-num' coords='"+curX + ","+curY+","+curBoxW+","+curBoxH+"'>")
			.appendTo("#armor-map")
		} else {
			$("#avbox-template").clone().css("display", "block")
			.css("top", curY).css("left", curX)
			.css("width", dollSizeMultiplier*boxWidth)
			.css("height", dollSizeMultiplier*boxWidth)
			.attr("id", "avbox-" + id + "-" + boxTypes[0]) //TODO: identify type of box in ID too
			.text("0")
			.prependTo("#armor-doll")
			boxTypes.splice(0, 1)
		}
	}
	
}

function loadArmorData() {
	var loader = require("./dataloader")
	armorData = loader.loadArmorData()
	console.log("armorData loaded!", Object.keys(armorData).length, "armor categories!")
}

function generateCoverageNumberString(coverage) {
	var coverageString = ""
	var weakSpot = decodeURIComponent("%E2%80%A1")
	var halfProt = decodeURIComponent("%C2%BD")
	for (var i=0;i<coverage.locations.length;i++) {
		var num = coverage.locations[i]
		coverageString += num
		if (coverage.halfProt.indexOf(num) > -1) {
			coverageString+=halfProt
		}
		if (coverage.weakSpot.indexOf(num) > -1) {
			coverageString+=weakSpot
		}
		coverageString += ", "
	}
	
	//Trim off the last comma and space
	coverageString = coverageString.substring(0, coverageString.length-2)
	
	return coverageString
}

function initArmorList() {
	

	loadArmorData()


	var options = {
		item: "armor-item",
		valueNames: [
			"armor_type",
			"armor_name",
			"armor_AVC",
			"armor_AVP",
			"armor_AVB",
			"armor_coverage_numbers",
			"armor_coverage",
			"armor_qualities",
			"armor_weight",
			"armor_pp",
			"armor_cost",
			
			{ data: ["id"] },
			{ data: ["cpcost"] },
			{ data: ["category"] },
			{ data: ["fudged_pp"] }, //Negative number sort workaround
			{ data: ["coverage_data"] }
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
				var armorCoverageNumbers = ""

				if (coverageLocations !== null && coverageLocations !== undefined && coverageLocations !== "undefined") {
					coverageCount = (coverageLocations.length || 0)
					armorCoverageNumbers = generateCoverageNumberString(armorPiece.Coverage)
					//console.log("GENERATING COVERAGE", armorCoverageNumbers)
				}
				
				var pp = (parseInt(armorPiece.PP) || 0)
				var fudgedPp = pp+100
		
				armorList.add({
					armor_type: armorPiece.Type, 
					armor_name: armorPiece.Name, id: armorPiece.Id, 
					armor_AVC: armorPiece.AVC, armor_AVP: armorPiece.AVP, armor_AVB: armorPiece.AVB,
					armor_coverage: armorPiece.Coverage.string || "", armor_coverage_numbers: armorCoverageNumbers, coverage_data: coverageLocations || [],
					armor_qualities: armorPiece.Qualities,
					armor_weight: armorPiece.Weight,
					armor_pp: pp, fudged_pp: fudgedPp,
					armor_cost: armorPiece.Cost, cpcost: armorPiece.CpCost, 
					qualitycount: armorPiece.Qualities.length,
					coveragecount: coverageCount,
					category: armorCategoryIndex
				})
			}
		}
		filteredArmorCategories[armorCategoryIndex] = false
		$("#filter-template").clone().css("display", "").appendTo("#filters").attr("data-filtercat", armorCategoryIndex).text(armorCategoryIndex)
	}
	initHiddenColumns()
	initImageMapResize()
	initImageMapHighlights()
	//TODO: This does not sort negative numbers correctly... Use a number fudging workaround for the time being
	/*armorList.sort("armor_pp", { sortFunction: function(a, b) {
		if (a > b) { return 1 }
            if (a < b) { return -1 }
            return 0
		}
	})*/
}

function initImageMapResize() {
	imageMapResize()
}

function initImageMapHighlights() {
	
	var intervalLeft = 74*dollSizeMultiplier
	var intervalRight = 70.5*dollSizeMultiplier
	var startYLeft = 98*dollSizeMultiplier
	var startYRight = 102*dollSizeMultiplier
	var startXLeft = 20*dollSizeMultiplier
	var startXRight = 2315*dollSizeMultiplier
	for (var i=0;i<10;i++) {
		armorDisplayBox(i+1, startXLeft, (1+i)*(startYLeft) + (intervalLeft*i), true)
	}
	
	for (var i=0;i<10;i++) {
		armorDisplayBox(i+11, startXRight, (1+i)*(startYRight) + (intervalRight*i), false)
	}
	
	//20 possible hitzones, so 1-20
	for (var i=1;i<=20;i++) {
		$("[id^=armor-map-" + i +"-]").each(function(index) {
			this.addEventListener("mouseover", function(e) {
				var this2 = this
				//We re-scope and must redeclare our selector
				$("[id^=armor-map-" + this.alt +"-]").each(function(index2) {		
						if (e.target != this) {
							
							console.log("target", e.target, this, e.target == this)
							$(this).mouseover()
						}
				})
			})
		})	
	}
	$(".map").maphilight({fillOpacity: 0.5, strokeWidth: 3})
}

function initHiddenColumns() {
	$(".armor_coverage_numbers").toggleClass("hidden")
	$(".armor_type").toggleClass("hidden")
	$(".armor_pp").toggleClass("hidden")

}

function applyArmorFilter(category, doFilter) {
	filteredArmorCategories[category] = (doFilter == null)
	armorList.filter(function(item) {
		if (filteredArmorCategories[item.values().category] == true) {
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
	for (var filterIndex in filteredArmorCategories) {
		filteredArmorCategories[filterIndex] = false
	}
	armorList.filter()
}


function toggleWordCoverage(btn) {
	$(btn).toggleClass("filterClicked")
	$(".armor_coverage").toggleClass("hidden")
	$(".armor_coverage_numbers").toggleClass("hidden")
}

function armorFilterClicked(btn) {
	var category = btn.getAttribute("data-filtercat")
	console.log("btn", btn, category)
	$(btn).toggleClass("filterClicked")
	if (filteredArmorCategories[category] == false) {
		applyArmorFilter(category)
	} else {
		removeArmorFilter(category)
	}
}

function armorItemClick(item) {
	console.log(item.getAttribute("data-id"))
}

function armorItemMouseOver(item) {
	var coverage = item.getAttribute("data-coverage_data").split(",")
	if (coverage[0] !== "") {
		for (var i=0;i<coverage.length;i++) {
			$("[id^=armor-map-" + coverage[i] +"-]").mouseover()
		}		
	}
}

function armorItemMouseOut(item) {
	var coverage = item.getAttribute("data-coverage_data").split(",")
	if (coverage[0] !== "") {
		for (var i=0;i<coverage.length;i++) {
			$("[id^=armor-map-" + coverage[i] +"-]").mouseout()
		}		
	}
}





