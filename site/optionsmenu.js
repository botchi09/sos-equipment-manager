var saveLoad = require("./saveload")
var playerData = {hasBeenSaved: false}


function changesSaved(hasSaved) {
	//TODO: display some kind of "not saved" thingo
}

function generateSaveInfo() {
	playerData.saveDate = new Date().toString() //For logging purposes
	playerData.hasBeenSaved = true
}

function saveToFile(file) {
	generateSaveInfo()
	var success = saveLoad.saveCharData(file, playerData)
	if (success) {
		changesSaved(true)
	} else {
		console.error(file,"not saved???")
	}
	
}

function loadFromFile(file) {
	changesSaved(true)
	return saveLoad.loadCharData(file)
}

function openOptions() {
	$("#menucontainer").load(("menu.html"))
}

function closeOptions() {
	$("#menucontainer").empty()
}

function fileSaved(btn) {
	saveToFile(btn.value)
}

function fileLoaded(btn) {
	var success = loadFromFile(btn.value)
	if (success) {
		console.log("LOADED DATA", playerData)
		armorCharDataLoaded()
	}
	
}