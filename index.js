$(document).ready(function(){
    $.getJSON("translation.json", function(json) {
        var keys = Object.entries(json)
        for (var [key, value] of keys) {
            var element = $(`*[data-i18n="${key}"]`)
            element.html(value)
        }
    })
    
    var toggle = $(".tabstoggle").val()
    
    var navbar = $(`input[value="${toggle}"]`)
    navbar.prop("checked", true)
    updateTabs(toggle)
    
    initAttributes()
    
    $(".navbar").on("click", function(){
        var value = this.value
        updateTabs(value)
    })
    
    var attributes = $(".attrs")
    
    $("input.attrs").on('change',function(){
        console.log(this.name)
    })
    
    
    
    $(".attr").on("click", function(){
        var name = this.name
        var operation = this.className.split(" ")[1] == "up"?1:-1
        getAttrs([name], function(values){
        
            var value = parseInt(values[name])
            var obj = {}
            obj[name] = value + operation
            setAttrs(obj)
        })
    })
    
    
})


function updateTabs(element) {
    $('.tabcontent').removeClass("show-tabcontent")
    var name = `#${element}`
    var selector = $(name)
    selector.addClass("show-tabcontent")

}

var DAMAGE_BONUS = {
    table: [
        { bonus: '-1d6', range: range(0, 11) },
        { bonus: '-1d4', range: range(11, 15) },
        { bonus: '0', range: range(15, 23) },
        { bonus: '1d4', range: range(23, 31) },
        { bonus: '1d6', range: range(31, 39) },
        { bonus: '2d6', range: range(39, 55) },
        { bonus: '3d6', range: range(55, 71) },
        { bonus: '4d6', range: range(71, 87) },
        { bonus: '5d6', range: range(87, 104) },
        { bonus: '6d6', range: range(104, 119) },
        { bonus: '7d6', range: range(119, 135) },
        { bonus: '8d6', range: range(135, 151) },
        { bonus: '9d6', range: range(151, 167) },
        { bonus: '10d6', range: range(167, 183) },
        { bonus: '11d6', range: range(183, 199) },
        { bonus: '12d6', range: range(199, 215) },
        { bonus: '13d6', range: range(215, 231) },
        { bonus: '14d6', range: range(231, 247) },
        { bonus: '15d6', range: range(247, 263) },
        ],
    getBonusForValue: function(value) {
        var tableEntry = this.table.filter(function(item){
            return item.range.indexOf(parseInt(value || 0)) !== -1
        })[0]
        return tableEntry.bonus;
    }
}

function range(start, end) { 
    return Array.from({ length: end - start + 1 }, (_, i) => i) 
}

function initAttributes() {


    getAttrs(["INT"], function(values) {
        var val = parseInt(values.INT)
        setAttrs({
            "idea": val * 5,
            "Hab-PJ": val * 10,
            INT: val
        })
    });

    getAttrs(["CON", "TAM", "HP"], function(values) {
        var valCon = parseInt(values.CON);
        var valSiz = parseInt(values.TAM);
        var val = valCon + valSiz;
        var hp = values.HP == undefined ? Math.round(val / 2) : parseInt(values.HP)
        setAttrs({
            "stableHP": Math.round(val / 2),
            "CON": valCon,
            "TAM": valSiz,
            "HP": hp
        })

    });

    getAttrs(["POD", "Sanity", "MP"], function(values) {
        var val = parseInt(values.POD)
        var sanity = values["Sanity"] == "" ? val * 5 : parseInt(values["Sanity"])
        var mp = values.MP == undefined ? val : parseInt(values.MP)
        if (mp > val) {
            mp = val
        }

        var obj = {
            "luck": val * 5,
            "stableMP": val,
            "COR": val * 5,
            "POD": val,
            "Sanity": sanity,
            "MP": mp,
            "stableSanity": val * 5
        }
        setAttrs(obj)
    });

    getAttrs(["EDU"], function(values) {
        var value = parseInt(values.EDU)

        setAttrs({
            "know": value * 5,
            "Hab-Ocu": value * 20,
            "EDU": value
        })
    });


    getAttrs(["FUE", "TAM"], function(values) {
        var value = parseInt(values.FUE) + parseInt(values.TAM) - 2
        var damage_bonus = DAMAGE_BONUS.getBonusForValue(value);
        setAttrs({
            "dmg-bonus": damage_bonus
        })

    });

    getAttrs(["cthulhumythos"], function(values) {
        var value = values.cthulhumythos

        val = value == null ? 0 : parseInt(value)
        setAttrs({
            "Max-Sanity": 99 - val
        })

    });
}


function getAttrs(attributes, callback){
    var obj = {}
    for (var attribute of attributes) {
        var item = $(`*[name="attr_${attribute}"]`)
        var value = item.val()
        obj[attribute] = item.val()
    }
    callback(obj)
}

function setAttrs(attributes){
    for(var [key, value] of Object.entries(attributes)){
        var item = $(`*[name="attr_${key}"]`)
        item.val(value)
        item.change()
    }
}
