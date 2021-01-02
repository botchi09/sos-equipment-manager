var saveLoad = require("./saveload")
var playerData = null

function generatePlayerData() {
	playerData = {saveInfo: {hasBeenSaved: true}} //"New" files have nothing to lose.
}
generatePlayerData() //First, most initial JS. Requires nothing

function changesSaved(hasSaved) {
	//TODO: display some kind of "not saved" thingo
	playerData.saveInfo.hasBeenSaved = hasSaved
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
		
	} else {
		console.error(file,"not saved???")
		changesSaved(false)
	}
	
}

function loadFromFile(file) {
	changesSaved(true)
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
		armorCharDataLoaded()
	}
	
}