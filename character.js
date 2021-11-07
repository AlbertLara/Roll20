var DAMAGE_BONUS = {
    table: [
        {bonus: '-1d6', range: _.range( 0,  11)},
        {bonus: '-1d4', range: _.range( 11, 15)},
        {bonus:    '0', range: _.range( 15, 23)},
        {bonus:  '1d4', range: _.range( 23, 31)},
        {bonus:  '1d6', range: _.range( 31, 39)},
        {bonus:  '2d6', range: _.range( 39, 55)},
        {bonus:  '3d6', range: _.range( 55, 71)},
        {bonus:  '4d6', range: _.range( 71, 87)},
        {bonus:  '5d6', range: _.range( 87,104)},
        {bonus:  '6d6', range: _.range(104,119)},
        {bonus:  '7d6', range: _.range(119,135)},
        {bonus:  '8d6', range: _.range(135,151)},
        {bonus:  '9d6', range: _.range(151,167)},
        {bonus: '10d6', range: _.range(167,183)},
        {bonus: '11d6', range: _.range(183,199)},
        {bonus: '12d6', range: _.range(199,215)},
        {bonus: '13d6', range: _.range(215,231)},
        {bonus: '14d6', range: _.range(231,247)},
        {bonus: '15d6', range: _.range(247,263)},
    ],
    getBonusForValue : function(value) {
        var tableEntry = _.filter(this.table, function(item){
            return item.range.indexOf(parseInt(value||0)) !== -1
        })[0]
        return tableEntry.bonus;
    }
}

var changes = ["FUE", "CON", "TAM", "DES", "APA", "INT", "POD", "EDU", "own-language", "dodge","cthulhumythos"]
var change_string = _.map(changes, function(value){
    return "change:" + value
}).join(" ")



$20('.sheet-tab').on('click', function(info){
    console.log(info)
})


on(`sheet:opened ${change_string}`, function(info){
    
    getAttrs(["sheetTab"], function(values){
        var element = values.sheetTab
        console.log(element)
        updateTabs(element)
    })
    $20('button.sheet-tab').on('click', function(event){
        console.log(event)
        var element = event.htmlAttributes.name.replace("act_","")
        console.log(element)
        setAttrs({
            sheetTab: element
        })
        updateTabs(element)
        
    })
    
    getAttrs(["INT"], function(values) {
        var val=parseInt(values.INT)
        setAttrs({
            "idea":val*5,
            "Hab-PJ": val*10
        })
    });

    getAttrs(["POD"], function(values) {
        var val=parseInt(values.POD)
        setAttrs({
            "luck":val*5,
            "stableMP": val,
            "COR": val*5
        })
    });

    getAttrs(["EDU", "own-language"], function(values) {
        var value=parseInt(values.EDU)
        var language = values["own-language"] == ""?value*5:parseInt(values["own-language"])
        if(language < value*5){
            language = value*5
        }

        setAttrs({
            "know":value*5,
            "Hab-Ocu":value*20,
            "own-language": language
        })
    });

    getAttrs(["DES", "dodge"], function(values){
        console.log(values)
        var value = parseInt(values.DES)*2
        var dodge_value = values.dodge == ''?value: parseInt(values.dodge)
        if(dodge_value < value){
            dodge_value = value
        }
        var attributes = {"dodge": dodge_value}
        setAttrs(attributes)
    });

    getAttrs(["CON", "TAM"], function(values){
        valCon=parseInt(values.CON);
        valSiz=parseInt(values.TAM);
        val=valCon+valSiz;
        setAttrs({
            "stableHP": Math.round(val/2)
        })

    });

    getAttrs(["FUE", "TAM"], function(values){
        var value = parseInt(values.FUE) + parseInt(values.TAM) -2
        var damage_bonus = DAMAGE_BONUS.getBonusForValue(value);
        setAttrs({
            "dmg-bonus": damage_bonus
        })

    });

    getAttrs(["cthulhumythos"], function(values){
        var value = values.cthulhumythos

        val = value == null?0:parseInt(value)
        setAttrs({
            "Max-Sanity":99-val
        })

    });


})

on("change:HP", function(e){
    getAttrs(["CON", "TAM"], (values) => {

        var hp = e["newValue"]
        var value = Math.ceil((parseInt(values.CON) + parseInt(values.TAM))/2)
        if(hp > value){
            setAttrs({
                "HP": value
            })
        }
    })
    
})

on("change:Sanity", function(){
    getAttrs(["Sanity"], function(values){
        var value = parseInt(values.Sanity)
        setAttrs({
            "current-COR": value
        })
    })
})

var attrs = ["FUE", "DES", "INT", "CON", "APA", "POD", "TAM", "EDU"]

attrs.forEach(attr => {
    on(`clicked:${attr}`, function(info){
        var name = getTranslationByKey(attr)
        getAttrs([attr, "character_name"], function(values){
            var character_name = values.character_name
            var value = parseInt(values[attr])
            let rollBase = '&{template:dice} {{name=@{character_name}}} {{Atributo=$0}} {{Valor=$1}} {{roll=[[1d100]]}}'
            console.log(rollBase)
            rollBase = rollBase.replace("$0", name).replace("$1", value)
            startRoll(rollBase, function(results){
                finishRoll(results.rollId)
            })
        })
    })
})

var skills = getTranslationByKey("skills-list").split(",")
skills.forEach(skill => {
    var checkbox = `success-${skill}`
    on(`sheet:opened change:${checkbox}`, function(info){            
        getAttrs([checkbox], function(values){
            var checked = values[checkbox] !== "0"
            if(checked){
                $20(`input[name="attr_${skill}"]`).removeClass('sheet-readonly')
            }else{
                $20(`input[name="attr_${skill}"]`).addClass('sheet-readonly')
            }
        })
    })
    on(`clicked:${skill}`, function(info){
        getAttrs([skill], function(values){
            var value = parseInt(values[skill])
            var skill_name = getTranslationByKey(skill)
            rollSkill(skill_name, value)
            
        })            
    })
})
var attacks = ["fist", "head-butt", "kick", "grapple"]
attacks.forEach( item => {
    on(`clicked:${item}`, function(info){
        var dmg = `${item}-damage`
        getAttrs([item, dmg, "dmg-bonus", "character_name"], function(values){
            console.log(values)
            var character_name = values.character_name
            var value = parseInt(values[item])
            var bonus = values["dmg-bonus"]
            var name = getTranslationByKey(item)
            let rollBase = '&{template:attk} {{name=@{character_name}}} {{$name=$value}} {{rollname=[Ataque](! &#13; [[1d100]])}} {{^{attack-u}=[[1d100]]}}'
            rollBase = rollBase.replace("$name", name).replace("$value", value).replace("user", character_name)
            startRoll(rollBase, function(results){
                finishRoll(results.rollId)
            })
        })
    })
})
var secon_attrs = ["Idea", "Luck", "Know"]

secon_attrs.forEach(item => {
    on(`clicked:${item}`, function(info){
        getAttrs([item], function(values){
            var value = parseInt(values[item])
            startRoll(`/roll 1d100<${value}`, function(results){
                finishRoll(results.rollId)
            })
        })
    })
})

on("clicked:Init", function(info){
    getAttrs(["DES"], function(values){
        var value = parseInt(values.DES)
        startRoll(`[[${value} &{tracker}]]`, function(results){
            finishRoll(results.rollId)
        })
    })
})

on("change:repeating_art change:repeating_martial change:repeating_otherlanguage", function(info) {
    on("clicked:repeating_art:score", function(info) {
        getAttrs(["repeating_art_skillname", "repeating_art_score"], function(values){
            var value = values.repeating_art_score
            var skill = values.repeating_art_skillname
            rollSkill(skill, value)
        })
    })

    on("clicked:repeating_otherlanguage:score", function(info) {
        getAttrs(["repeating_otherlanguage_skillname", "repeating_otherlanguage_score"], function(values){
            var value = values.repeating_otherlanguage_score
            var skill = values.repeating_otherlanguage_skillname
            rollSkill(skill, value)
        })
    })
    
})

function rollSkill(skill, value){
    let rollBase = '&{template:dice} {{name=@{character_name}}} {{Habilidad=$0}} {{Valor=$1}} {{roll=[[1d100]]}} {{computed=1}}'
    rollBase = rollBase.replace("$0", skill)
    rollBase = rollBase.replace("$1", value)
    startRoll(rollBase, function(results){
        const total = results.results.roll.result
        const computed = total/value
        var success = computed <= 1?1:0
        finishRoll(
            results.rollId,
            {
                roll: success
            }
        );
    })
}

function updateTabs(element){
    console.log(element)
    var tabs = ["userinfo", "character", "items", "skills"]
    var filtered_tabs = _.filter(tabs, function(tab){
        return tab !== element
    })
    
    var tab_select = $20(`button[name="act_${element}"]`)
    tab_select.removeClass("sheet-tab")
    tab_select.toggleClass("sheet-select-tab")
    var name = `#sheet-${element}`
    var selector = $20(name)
    selector.removeClass("sheet-tabcontent")
    selector.toggleClass("sheet-show-tabcontent")
    filtered_tabs.forEach(tab => {
        console.log(tab)
        var select = $20(`#sheet-${tab}`)
        
        select.removeClass("sheet-tabcontent")
        select.addClass("sheet-tabcontent")
        var tab_select = $20(`button[name="act_${tab}"]`)
        tab_select.removeClass("sheet-tab")
        tab_select.removeClass("sheet-select-tab")
        tab_select.addClass("sheet-tab")
    })
    
}