var saveLoad = require("./saveload")
var playerData = null
var curFile = null
var lastSaveFile = ""
 
function generatePlayerData() {
	playerData = {saveInfo: {hasBeenSaved: true}} //"New" files have nothing to lose.
}
generatePlayerData() //First, most initial JS. Requires nothing

function changesSaved(hasSaved) {
	playerData.saveInfo.hasBeenSaved = hasSaved
	var fileNameString = ""
	if (curFile!=null) {
		fileNameString = " - " + curFile
	}
	var title = docTitle + fileNameString
	if (hasSaved) {
		document.title = title
	} else {
		document.title = title + " - Unsaved changes"
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
		lastSaveFile = curFile //$("#savebtn").val()
		changesSaved(true)
		//$("#savebtn").val("")
	} else {
		curFile = file
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
	console.log("Loading", btn.value)
	if (success) {
		console.log("LOADED DATA", playerData)
		curFile = btn.value
		lastSaveFile = curFile
		$("#loadbtn").val("")
		armorCharDataLoaded()
		changesSaved(true)
	}
	return success
}