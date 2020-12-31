module.exports = {}

module.exports.CpToString = function(cpcost) {
    
	var gold = ~~(cpcost / 240)
    var silver = ~~((cpcost % 240) / 12)
    var copper = ~~cpcost % 12

    var ret = ""
    if (gold > 0) {
        ret += "" + gold + "gp " + (silver < 10 ? "" : "")
    }
    ret += "" + silver + "sp " + (copper < 10 ? "" : "")
    ret += "" + copper + "cp"

    return ret

}