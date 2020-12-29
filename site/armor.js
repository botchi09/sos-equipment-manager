var armorData = null
var armorList = null
var equippedCategoryStr = "E"
var filteredArmorCategories = {equipped: false}
var equippedArmor = {}
var armorDisplayBoxes = {}
var dollSizeMultiplier = 0.5 //Full size image would be really silly huge. Due to lib limitations we can't dynamically resize.
var boxWidth = 59 //Doll box width

//HTML strings to represent weak spots and half protection
var weakSpot = decodeURIComponent("%E2%80%A1")
var notWeakSpot = " "
var halfProt = decodeURIComponent("%C2%BD")
	
	
function loadArmorData() {
	var loader = require("./dataloader")
	armorData = loader.loadArmorData()
	console.log("armorData loaded!", Object.keys(armorData).length, "armor categories!")
}

//Purely for creating and deciding the positions of armour display divs
function armorDisplayBox(id, x, y, mapAtEnd) {
	
	
	var box = {}
	box.id = id
	box.x = x
	box.y = y
	
	var mapPos = 0
	if (mapAtEnd) {
		mapPos = 5
	}
	
	var dropListY = (y + boxWidth*2) * dollSizeMultiplier
	$("<div></div>").attr("id", "droplist-" + id).css("left", (x * dollSizeMultiplier)).css("top", dropListY).css("position", "absolute")
	.addClass("droplist-container")
	.prependTo("#avbox-container")
	
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
			.attr("id", "avbox-" + id + "-" + boxTypes[0])
			.prependTo("#avbox-container")
			boxTypes.splice(0, 1)
		}
	}
}

function addArmorDroplistItem(id, armorId) {
	
	var armor = armorData[armorId]
	if (armor.Coverage.locations !== null) {
		var isHalfProt = armor.Coverage.halfProt.indexOf(id) > -1
		var isWeakSpot = armor.Coverage.weakSpot.indexOf(id) > -1
		//var isTextile = 
		
		var templated = $("#droplist-item-template").clone().attr("id","droplist-item-"+armorId).removeClass("hidden")
		.appendTo("#droplist-" + id)
		var realWidth = boxWidth*dollSizeMultiplier
		templated.find("#droplist-box-c").html(isHalfProt ? Math.floor(armor.AVC/2) : armor.AVC).css("width", realWidth+"px")
		templated.find("#droplist-box-p").html(isHalfProt ? Math.floor(armor.AVP/2) : armor.AVP).css("width", realWidth+"px")
		templated.find("#droplist-box-b").html(isHalfProt ? Math.floor(armor.AVB/2) : armor.AVB).css("width", realWidth+"px")
		templated.find("#droplist-box-m").html(isHalfProt ? Math.floor(armor.AVB/2) : armor.AVB).css("width", realWidth+"px")
		templated.find("#droplist-box-name").html(armor.Name)
		
	}
	
	
}



function generateCoverageNumberString(coverage) {
	var coverageString = ""

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

function addFilterButton(category, buttonText) {
	
	$("#filter-template").clone().css("display", "").appendTo("#filters").attr("data-filtercat", category).text(buttonText || category)
	.mousedown(function(e){ e.preventDefault() })

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
			{ data: ["coverage_data"] },
			{ data: ["index"] },
			{ data: ["equipped"] }
		]
	}
	armorList = new List("armor-list", options)
	var curIndex = 0
	for (var armorIndex in armorData) {

		var armorPiece = armorData[armorIndex]
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
				armor_qualities: armorPiece.QualitiesString,
				armor_weight: armorPiece.Weight,
				armor_pp: pp, fudged_pp: fudgedPp,
				armor_cost: armorPiece.Cost, cpcost: armorPiece.CpCost, 
				qualitycount: Object.keys(armorPiece.Qualities).length,
				coveragecount: coverageCount,
				category: armorPiece.Category,
				index: curIndex,
				equipped: 0,
			})
			curIndex++
		}
		
		if (filteredArmorCategories[armorPiece.Category]==null)
		{
			filteredArmorCategories[armorPiece.Category] = false
			addFilterButton(armorPiece.Category)
		}
	}
	//Equipped filter is just too buggy.
	//addFilterButton(equippedCategoryStr, "Equipped")
	initHiddenColumns()
	initImageMapResize()
	initImageMapHighlights()
	$("#default-sort-btn").click()
	resetAllLocations()
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

/*armorList.filter(function(item) {
		var itemValues = item.values()
		if (category !== equippedCategoryStr) {
			console.log(category, doFilter)
			if ((equippedArmor[itemValues.id] == null) && filteredArmorCategories[itemValues.category] == true) {
				return false
			} else {
				return true
			}
		} else {
			
		}
	})*/
	
function doHitZoneFilter(hitZone) {
	armorList.filter(function(item) {
		var allHitZoneItems = getAllArmorItemsByHitZone(hitZone)
		var itemValues = item.values()
		return allHitZoneItems[itemValues.id] != null
	})
}
	
function getAllArmorItemsByHitZone(hitZone) {
	var items = {}
	
	for (armorIndex in armorData) {
		var armor = armorData[armorIndex]
		if (armor.Coverage.locations != null) {
			if (armor.Coverage.locations.indexOf(parseInt(hitZone)) > -1) {
				items[armor.Id] = armor
			}
		}
	}
	return items
}

function getAllListItemsByHitZone(hitZone) {
	var items = []
	
	var armorItems = getAllArmorItemsByHitZone(hitZone)
	for (armorIndex in armorItems) {	
				items.push($("tr[data-id='"+armorItems[armorIndex].Id+"']"))	
	}
	return $(items).map(function() {return this.toArray()})	
}

function doArmorItemListHover(hitZone, add) {
	if (add) {
		getAllListItemsByHitZone(hitZone).addClass("armor-list-highlight")
	} else {
		getAllListItemsByHitZone(hitZone).removeClass("armor-list-highlight")
	}
}

//Unused
function armorMapClick(map) {
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
			this.addEventListener("click", function(e) {
				doHitZoneFilter(this.alt)
			})
			this.addEventListener("mouseover", function(e) {
				var this2 = this
				//doArmorItemListHover(this.alt, true)
				//We re-scope and must redeclare our selector
				$("[id^=armor-map-" + this.alt +"-]").each(function(index2) {		
						if (e.target != this) {						
							//console.log("target", e.target, this, e.target == this)
							$(this).mouseover()
							doArmorItemListHover(this.alt, true)
						}
				})
			})
			this.addEventListener("mouseout", function(e) {
				var this2 = this
				doArmorItemListHover(this.alt, false)
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

var isEquipFilter = false

function toggleEquippedFilter(btn) {
	$(btn).toggleClass("filterClicked")
	if (isEquipFilter) {
		removeAllArmorFilters()
		isEquipFilter = false
	} else {
		armorList.filter(function(item) {
			var itemValues = item.values()
			isEquipFilter = true
			return (equippedArmor[itemValues.id] != null)
		})
	}
}

function applyArmorFilter(category, doFilter) {
	filteredArmorCategories[category] = (doFilter == null)
	armorList.filter(function(item) {
		var itemValues = item.values()
		if (category !== equippedCategoryStr) {
			console.log(category, doFilter)
			if ((equippedArmor[itemValues.id] == null) && filteredArmorCategories[itemValues.category] == true) {
				return false
			} else {
				return true
			}
		} else {
			/*if (filteredArmorCategories[category] == true && equippedArmor[itemValues.id] != null) {
				return false
			} else {
				return true
			}*/
			
			//return (filteredArmorCategories[category] == true && equippedArmor[itemValues.id] == null)
		}
	})
}

function removeArmorFilter(category) {
	applyArmorFilter(category, false)
}

function removeAllArmorFilters() {
	//TODO: reset all buttons (remove filterClicked class)
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
	var id = item.getAttribute("data-id")
	$(item).toggleClass("armor-list-item-equipped")
	$(item).toggleClass("armor-list-item")
	if (equippedArmor[id] == null) {
		equippedArmor[id] = armorData[id]
		$(item).attr("data-equipped", 1)
	} else {
		$(item).attr("data-equipped", 0)
		delete equippedArmor[id]
	}
	recalculateLocationValues()
}

function resetAllLocations() {
	$("[id^=avbox-]").not("#avbox-container").not("#avbox-template").each(function() {
		if ($(this).attr("id").slice(-1) !== "w") {
			$(this).html("0")
		} else {
			$(this).html(" ")
		}
	})
	//TODO: clear out the dropdown lists
}

function expandProtType(type) {
	return "AV"+type.toUpperCase()
}

function recalculateLocationValues() {
	resetAllLocations()
	for (equippedIndex in equippedArmor) {
		var curArmor = equippedArmor[equippedIndex]
		if (curArmor.Coverage.locations != null) {
			for (var coverageIndex in curArmor.Coverage.locations) {
				var curHitZone = curArmor.Coverage.locations[coverageIndex]
				var protArray = ["c","p","b"]
				var isHalfProt = false
				
				if (curArmor.Coverage.halfProt.indexOf(curHitZone) > -1) {
					isHalfProt = true
				}
				var weakZone = $("#avbox-"+curHitZone+"-w")
				if (curArmor.Coverage.weakSpot.indexOf(curHitZone) > -1) {
					//Weakspots carry down
					weakZone.html(weakSpot)
					
				}

				for (protArrayIndex in protArray) {
					curProtType = protArray[protArrayIndex]
					var curProt = parseInt($("#avbox-"+curHitZone+"-"+curProtType).html())
					var armorProt = curArmor[expandProtType(curProtType)]
					if (isHalfProt) {
						armorProt = Math.floor(armorProt/2)
						console.log("weak!", curHitZone)
					}
					$("#avbox-"+curHitZone+"-"+curProtType).html(Math.max(curProt, armorProt))
				}
			}
		}
	}
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





