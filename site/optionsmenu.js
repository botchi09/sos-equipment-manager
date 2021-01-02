var saveLoad = require("./saveload")
var playerData = null
var curFile = null
 
function generatePlayerData() {
	playerData = {saveInfo: {hasBeenSaved: true}} //"New" files have nothing to lose.
}
generatePlayerData() //First, most initial JS. Requires nothing

function changesSaved(hasSaved) {
	playerData.saveInfo.hasBeenSaved = hasSaved
	if (hasSaved) {
		document.title = docTitle
	} else {
		document.title = docTitle + " - Unsaved changes"
	}
	
}

function areChangesSaved() {
	return playerData.saveInfo.hasBeenSaved
}

function generateSaveInfo() {
	playerData.saveInfo.saveDate = new Date().toString() //For logging purposes
	playerData.hasBeenSaved = true
}

function saveToFile(file) {
	generateSaveInfo()
	changesSaved(true)
	var success = saveLoad.saveCharData(file, playerData)
	if (success) {
		curFile = file
		changesSaved(true)
	} else {
		console.error(file,"not saved???")
		changesSaved(false)
	}
	
}

function loadFromFile(file) {
	
	return saveLoad.loadCharData(file)
}

function openOptions() {
	$("#optionscontainer").load(("menu.html"))
}

function closeOptions() {
	$("#optionscontainer").empty()
}

function fileSaved(btn) {
	saveToFile(btn.value)
}

function fileLoaded(btn) {
	var success = loadFromFile(btn.value)
	if (success) {
		console.log("LOADED DATA", playerData)
		curFile = btn.value
		armorCharDataLoaded()
		changesSaved(true)
	}
	return success
}