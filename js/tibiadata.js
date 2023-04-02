console.log("hello world!")

// document.write("Funciona?")

var druids;

function setup() {
    loadJSON('https://api.tibiadata.com/v3/highscores/Celesta/experience/druids/2', gotData)
}

function gotData(data){
    druids = data;
}

function helloworld(){
    
}

