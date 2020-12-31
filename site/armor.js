

var utils = require("./utils")
var hitZoneLib = require("./hitzones")
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
var noDropList = false
	
function loadArmorData() {
	var loader = require("./dataloader")
	armorData = loader.loadArmorData()
	console.log("armorData loaded!", Object.keys(armorData).length, "armor categories!")
}

function unhideDroplist() {
	if (!noDropList) {
		$("#droplist-"+$(this).attr("data-hitzone")).removeClass("hidden")
	}
}

function hideDroplist() {
	$("#droplist-"+$(this).attr("data-hitzone")).addClass("hidden")
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
	var dropListX = x
	if (!mapAtEnd) {
		dropListX -= 500
	}
	$("<div></div>").attr("id", "droplist-" + id).css("left", (dropListX * dollSizeMultiplier)).css("top", dropListY).css("position", "absolute")
	.addClass("droplist-container").addClass("hidden")
	.mouseover(unhideDroplist)
	.mouseout(hideDroplist)
	.attr("data-hitzone", id)
	.prependTo("#avbox-container")
	
	
	var boxTypes = ["c", "p", "b", "m", "w"]
	for (var i=0;i<6;i++) {
		var curX = (x + (i*boxWidth)) * dollSizeMultiplier
		var curY = (y + boxWidth) * dollSizeMultiplier
		if (i==mapPos) {
			var curBoxW = (curX+dollSizeMultiplier*boxWidth)
			var curBoxH = (curY+dollSizeMultiplier*boxWidth)
			$("<area target='' alt='"+id+"' shape='rect' id='armor-map-"+id+"-num' coords='"+curX + ","+curY+","+curBoxW+","+curBoxH+"'>")
			.mouseover(unhideDroplist)
			.mouseout(hideDroplist)
			.attr("data-hitzone", id)
			.appendTo("#armor-map")
			
		} else {
			var isWeakSpot = false
			var templateId = "#avbox-template"
			if (boxTypes[0] === "w") {
				templateId = "#avbox-template-w"
				isWeakSpot = true
			}
			var templated = $(templateId).clone().css("display", "block")
			.mouseover(unhideDroplist)
			.mouseout(hideDroplist)
			.css("top", curY).css("left", curX)
			.css("width", dollSizeMultiplier*boxWidth)
			.css("height", dollSizeMultiplier*boxWidth)
			.attr("id", "avbox-" + id + "-" + boxTypes[0])
			.attr("data-hitzone", id)
			.attr("data-type", boxTypes[0])

			if (isWeakSpot) {
				templated.css("margin-left", 0) //Little fix to centre the text
				templated.click(function() {
					var hitZone = parseInt($(this).attr("data-hitzone"))
					var isClicked = customHitZoneValues[hitZone].Weakspot
					if (!isClicked) {
						$(this).html(weakSpot)
						customHitZoneValues[hitZone].Weakspot = true
					} else {
						$(this).html(notWeakSpot)
						customHitZoneValues[hitZone].Weakspot = false
					}
					recalculateLocationValues()
				})
			} else {
				templated.change(function(ev) {
					//console.log(ev)
					//TODO: breaks down if numbers already assigned when we cahnge it.
					var type = expandProtType($(this).attr("data-type"))
					var hitZone = parseInt($(this).attr("data-hitzone"))
					var subtractNum = hitZoneValues[hitZone][type]
					var thisVal = parseInt($(this).val())
					var newValue = thisVal - subtractNum
					if (!isNaN(newValue)) {
						//customHitZoneValues[hitZone][type] = newValue
					}
					
					console.log(thisVal, subtractNum, newValue)
					$(this).oldValue = thisVal
					//recalculateLocationValues()
					
				})
			}
			
			templated.prependTo("#avbox-container")
	
			//TODO: Manual adjustment item create id av-adjust-template
			$("#av-adjust-template").clone().css("display", "block")
			.css("top", curY-((boxWidth/2)*dollSizeMultiplier)).css("left", curX)
			.css("width", dollSizeMultiplier*(boxWidth))
			.css("height", dollSizeMultiplier*boxWidth/2)
			.attr("id", "av-adjust-" + id + "-" + boxTypes[0])
			.attr("data-hitzone", id)
			.attr("data-type", id)
			.prependTo("#avbox-container")
			
			boxTypes.splice(0, 1)
		}
	}
}


function getMissileProt(armorId) {
	var armor = armorData[armorId]
	var missileProt = armor.AVP
	if (armor.Qualities["Textile"] != null) {
		missileProt = missileProt * 2
	}
	return missileProt
}

function addArmorDroplistItem(id, armorId) {
	
	var armor = armorData[armorId]
	if (armor.Coverage.locations !== null) {
		var isHalfProt = armor.Coverage.halfProt.indexOf(id) > -1
		var isWeakSpot = armor.Coverage.weakSpot.indexOf(id) > -1
		
		var templated = $("#droplist-item-template").clone().attr("id","droplist-item-"+armorId).removeClass("hidden")
		.attr("data-hitzone", id)
		.attr("data-id", armorId)
		.appendTo("#droplist-" + id)
		var realWidth = boxWidth*dollSizeMultiplier
		templated.find("#droplist-box-c").html(isHalfProt ? Math.floor(armor.AVC/2) : armor.AVC).css("width", realWidth+"px")
		templated.find("#droplist-box-p").html(isHalfProt ? Math.floor(armor.AVP/2) : armor.AVP).css("width", realWidth+"px")
		templated.find("#droplist-box-b").html(isHalfProt ? Math.floor(armor.AVB/2) : armor.AVB).css("width", realWidth+"px")
		templated.find("#droplist-box-m").html(getMissileProt(armorId)).css("width", realWidth+"px")
		templated.find("#droplist-box-w").html(isWeakSpot ? weakSpot : "").css("width", realWidth+"px")
		templated.find("#droplist-box-name").html(armor.Name)
		templated.find("#droplist-box-qualities").html(armor.QualitiesString)
		templated.find("#droplist-box-special").html(armor.Coverage.special)
		
		templated.mouseover(function() {
			highlightElement(getArmorItemListRowByArmorId($(this).attr("data-id")), true)		
		})
		templated.mouseout(function() {
			highlightElement(getArmorItemListRowByArmorId($(this).attr("data-id")), false)
		})
		
		templated.click(function() {
			armorItemClick(getArmorItemListRowByArmorId($(this).attr("data-id")))
		})
		
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
	.attr("id", "filter-"+category.split(" ").join("_"))
	.mousedown(function(e){ e.preventDefault() })
	
	console.log(category, buttonText)

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
				armor_coverage: (armorPiece.Coverage.string || "") + (" " + armorPiece.Coverage.special || ""), armor_coverage_numbers: armorCoverageNumbers, coverage_data: coverageLocations || [], coverage_special: armorPiece.Coverage.special,
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
	resetHitZoneValues(true)
	resetAllLocations()
	resetButtonClicked()
	
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
	
function doHitZoneFilter(hitZone) {
	armorList.filter(function(item) {
		var allHitZoneItems = getAllArmorItemsByHitZone(hitZone)
		var itemValues = item.values()
		return allHitZoneItems[itemValues.id] != null
	})
}
	
function getAllArmorItemsByHitZone(hitZone, equippedOnly) {
	var items = {}
	var armorArray = armorData
	if (equippedOnly) {
		armorArray = equippedArmor
	}
	
	for (armorIndex in armorArray) {
		var armor = armorArray[armorIndex]
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
		//items.push($("tr[data-id='"+armorItems[armorIndex].Id+"']"))	
		items.push(getArmorItemListRowByArmorId(armorItems[armorIndex].Id))	
	}
	return $(items).map(function() {return this.toArray()})	
}

function getArmorItemListRowByArmorId(armorId) {
		return $("tr[data-id='"+armorId+"']")
}

function highlightElement(elem, doHighlight) {
	doHighlight ? elem.addClass("armor-list-highlight") : elem.removeClass("armor-list-highlight")
}

function doArmorItemListHover(hitZone, add) {
	highlightElement(getAllListItemsByHitZone(hitZone), add)
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
			$(this).mouseover(unhideDroplist)
			$(this).mouseout(hideDroplist)
			$(this).attr("data-hitzone", this.alt) //divs cannot have alt tags
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

function resetButtonClicked(btn) {
	removeAllArmorFilters()
	$("#filter-Horse_armor").click()//Users probably don't want horse armour by default...
	$("#default-sort-btn").click() //Default index sorting at start
}

function removeAllArmorFilters() {
	$("[id^=filter-]").not("#filter-template").removeClass("filterClicked")
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
	//console.log("btn", btn, category)
	$(btn).toggleClass("filterClicked")
	if (filteredArmorCategories[category] == false) {
		applyArmorFilter(category)
	} else {
		removeArmorFilter(category)
	}
}

function armorItemClick(item) {
	//var id = item.getAttribute("data-id")
	var id = $(item).attr("data-id")
	$(item).toggleClass("armor-list-item-equipped")
	$(item).toggleClass("armor-list-item")
	if (equippedArmor[id] == null) {
		equippedArmor[id] = armorData[id]
		$(item).attr("data-equipped", 1)

	} else {
		$(item).attr("data-equipped", 0)
		highlightElement($(item), false)
		delete equippedArmor[id]
		
	}
	recalculateLocationValues()
}

function resetAllLocations() {
	$("[id^=avbox-]").not("#avbox-container").not("#avbox-template").each(function() {
		
		if ($(this).attr("id").slice(-1) !== "w") {
			$(this).val("0")
		} else {
			$(this).html(" ")
		}
	})
	
}

function resetAllDroplists() {
	//TODO: clear out the dropdown lists
	
	$("[id^=droplist-item-]").not("#droplist-item-template").remove()
}

function expandProtType(type) {
	return "AV"+type.toUpperCase()
}

var greatHelmId = "R3JlYXQgSGVsbQ=="
var bascinetId = "QmFzY2luZXQ="
var skullcapId = "U2t1bGxjYXA="

function hasGreatHelm() {
	return equippedArmor[greatHelmId] != null
}

function hasSkullcapOrBascinet() {
	return (equippedArmor[bascinetId] != null || equippedArmor[skullcapId] != null)
}

function hasGreatHelmLayerQuality(armorPiece) {
	return (armorPiece.Qualities.GreatHelmOnlyLayer != null || armorPiece.Qualities.GreatHelmLayer != null)
}

function calcLayering(hitZone, protType, armorPiece) {
	
	var isMissile = protType === "m"
	if (isMissile) {
		protType = "p"
	}
	
	var curProtType = expandProtType(protType)
	
	var equippedHitZoneArmor = getAllArmorItemsByHitZone(hitZone, true)
	
	var curLayerValue = 0
	
	var highestLayer = 0
	var highestLayerArmor = null
	var highestLayerProt = 0
	var highestLayerProtArmor = null
	
	var highestArmor = null
	var highestArmorProt = 0
	
	
	
	//First pass: calculate highest layer
	for (var equippedHitZoneArmorIndex in equippedHitZoneArmor) {
		var armor = equippedHitZoneArmor[equippedHitZoneArmorIndex]
		
		if (armor.Qualities.Layer != null || hasGreatHelmLayerQuality(armor)) {
			var compareLayer = 0
			if (armor.Qualities.Layer != null) {
				compareLayer = armor.Qualities.Layer.level
			}
			
			//Handle greathelm/bascinet/skullcap special case
			if (armor.Id === greatHelmId) {
				if (hasSkullcapOrBascinet()) {
					compareLayer = armor.Qualities.GreatHelmOnlyLayer.level
					//console.log("isgreathelm")
				}
			}
			
			if (armor.Id === bascinetId || armor.Id === skullcapId) {
				if (hasGreatHelm()) {
					compareLayer = armor.Qualities.GreatHelmLayer.level
					//console.log("gh lvl", armor.Name, armor.Qualities.GreatHelmLayer.level)
				}
			}
			
			if (highestLayer <= compareLayer) {
				highestLayer = compareLayer
				highestLayerArmor = armor
				/*if (highestLayerProt <= armor[curProtType]) {		
					highestLayerProt = armor
					highestLayerProtArmor = armor[curProtType]
				}*/

			}
		} else {
			
			//Unused code
			/*var missileProt = 0
			if (isMissile && armor.Qualities.Textile != null) {
				missileProt = armor[curProtType]*2
			}
			highestArmorProt = Math.max(armor[curProtType], highestArmorProt, missileProt)*/
		}
		
	}
	
	var finalProt = 0
	
	//If layering even applies in this scenario
	if (highestLayerArmor != null) {
		//Second pass- calculate highest layer + armor
		for (var equippedHitZoneArmorIndex in equippedHitZoneArmor) {
			var armor = equippedHitZoneArmor[equippedHitZoneArmorIndex]
			var armorProt = armorPiece[curProtType]
			if (armor.Id !== highestLayerArmor.Id) { //Don't layer with ourself!!
				var compareProt = armor[curProtType] 
				
				if (armor.Coverage.specialAV) { //Stechhelm, etc
					compareProt += armor.Coverage.specialAV[hitZone] || 0	
				}

				if (isMissile && armor.Qualities.Textile != null) { //Missiles exception
					compareProt = compareProt*2
				}
			
				if (compareProt <= highestLayerArmor[curProtType]) { //If we have something to layer it with...
					finalProt = highestLayerArmor[curProtType] + highestLayer //Highest layer armour AV increases by layer
				}
			}
		}
	}
	
	//console.log(finalProt, highestLayerArmor, highestLayer)
	
	//TODO: go through equipped armours of a hitzone, get highest layer value, calc
	//TODO: MISSILE ONLY: If textile, calculate missile prot, do layering with AVP
	return finalProt
}


function calcSpecialProtection(hitZone, protType) {
	//TODO: create individual definitions for items with special coverages and factor them in here...
}

function displayCost(cost) {
	$("#cost").html(utils.CpToString(cost))
}

function displayWeight(weight) {
	$("#weight").html(weight + "wt.")
}

var hitZoneValues = {}
var customHitZoneValues = {}

function resetHitZoneValues(doCustom) {
	var template =  {AVC: 0, AVB: 0, AVP: 0, AVM: 0, Weakspot: false}
	for (var i=1;i<=20;i++) {
		hitZoneValues[i] = {...template}
		if (doCustom) {
			customHitZoneValues[i] = {...template}
		}
	}
}

function setAvBoxesToCustomValues() {
	for (var i=1;i<=20;i++) {
		if (Object.keys(getAllArmorItemsByHitZone(i, true)).length == 0) { //Nothing is equipped here.
			var values = customHitZoneValues[i]
			$("#avbox-"+i+"-c").val(values.AVC)
			$("#avbox-"+i+"-p").val(values.AVP)
			$("#avbox-"+i+"-b").val(values.AVB)
			$("#avbox-"+i+"-m").val(values.AVM)

			if (values.Weakspot) {
				$("#avbox-"+i+"-w").html(weakSpot)
			}
		}
	}
}

function savePlayerData() {
	
}

function loadPlayerData() {
}

function recalculateLocationValues() {
	resetAllLocations()
	resetHitZoneValues(false)
	resetAllDroplists()
	
	var curWeight = 0
	var curCost = 0
	
	for (equippedIndex in equippedArmor) {
		var curArmor = equippedArmor[equippedIndex]
		curWeight+=curArmor.Weight
		curCost+=curArmor.CpCost
		if (curArmor.Coverage.locations != null) {
			for (var coverageIndex in curArmor.Coverage.locations) {
				var curHitZone = curArmor.Coverage.locations[coverageIndex]
				var protArray = ["c","p","b","m"]
				var isHalfProt = false
				
				if (curArmor.Coverage.halfProt.indexOf(curHitZone) > -1) {
					isHalfProt = true
				}
				var weakZone = $("#avbox-"+curHitZone+"-w")
				console.log("CUSTOM?", customHitZoneValues[curHitZone].Weakspot)
				if (curArmor.Coverage.weakSpot.indexOf(curHitZone) > -1 || customHitZoneValues[curHitZone].Weakspot == true) {
					//Weakspots carry down
					weakZone.html(weakSpot)
					
				}

				for (protArrayIndex in protArray) {
					var curProtType = protArray[protArrayIndex]
					var curProtFull = expandProtType(curProtType)
					curProtType = protArray[protArrayIndex]
					var curProt = hitZoneValues[curHitZone][curProtFull] 
					
					//parseInt($("#avbox-"+curHitZone+"-"+curProtType).html())
					var armorProt = curArmor[curProtFull]
					
					if (curArmor.Coverage.specialAV) {
						armorProt += curArmor.Coverage.specialAV[curHitZone] || 0	
					}
					
					if (curProtType === "m") {
						armorProt = getMissileProt(curArmor.Id)
					}
					if (isHalfProt) {
						armorProt = Math.floor(armorProt/2)
					}
				
					var userProt = customHitZoneValues[curHitZone][curProtFull] //Any user defined mods

					var maxArmor = Math.max(curProt, armorProt, calcLayering(curHitZone, curProtType, curArmor)) + userProt
					
					
					$("#avbox-"+curHitZone+"-"+curProtType).val(maxArmor)
					hitZoneValues[curHitZone][curProtFull] = maxArmor
					
				}
				//TODO: Investigate potential repeated code here
				addArmorDroplistItem(curHitZone, curArmor.Id)
			}
		} else {
			
		}
	}
	setAvBoxesToCustomValues() //Default values
	displayWeight(curWeight)
	displayCost(curCost)
}

function armorItemMouseOver(item) {
	noDropList = true
	var coverage = item.getAttribute("data-coverage_data").split(",")
	if (coverage[0] !== "") {
		for (var i=0;i<coverage.length;i++) {
			$("[id^=armor-map-" + coverage[i] +"-]").mouseover()
		}		
	}
}

function armorItemMouseOut(item) {
	noDropList = false
	var coverage = item.getAttribute("data-coverage_data").split(",")
	if (coverage[0] !== "") {
		for (var i=0;i<coverage.length;i++) {
			$("[id^=armor-map-" + coverage[i] +"-]").mouseout()
		}		
	}
}





