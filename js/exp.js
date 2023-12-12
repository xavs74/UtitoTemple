
async function fetchApi(url) {
    try {
      const response = await fetch(url);
      const jsonData = await response.json();
      return jsonData;
    } catch (error) {
      console.error('Error:', error);
    }
  }

//const url = "https://api.tibiadata.com/v3/highscores/Celesta/experience/druids/"

/*
async function characterLookup(charName){
  const url = "https://api.tibiadata.com/v3/highscores/Celesta/experience/all/"
  // pages from 1 to 20
  for (var i = 1; i <= 20; i++) {
    const data = await fetchApi(url+i.toString())
    for (const character of data.highscores.highscore_list){
      if (character.name == charName){
        //document.getElementById("current").value = character.level
        document.getElementById("charLevel").textContent = character.level
        console.log(character.name + " fetched")
        return character;
      }
    }
  }
};
*/

async function characterLookup(charName) {
    const url = "https://api.tibiadata.com/v4/highscores/Celesta/experience/all/";
    const totalPages = 20;
  
    try {
      for (let i = 1; i <= totalPages; i++) {
        const data = await fetchApi(url + i.toString());
        const character = data.highscores.highscore_list.find(
            (char) => char.name.toLowerCase() === charName.toLowerCase());
  
        if (character) {
          //document.getElementById("charLevel").textContent = character.level;
          console.log(character.name + " fetched");
          return character;
        }
      }
      
      // If the character is not found, you can display an error message or handle it as needed
      console.log("Character not found");
      return null;
    } catch (error) {
      console.log("Error fetching character data:", error);
      return null;
    }
};
  

async function addCharacterCard() {
    const characterInput = document.getElementById('character-input');
    const characterName = characterInput.value.trim();
  
    if (characterName !== '') {
      try {
        const character = await characterLookup(characterName);
        if (character) {
          generateCharacterCard(character);
          characterInput.value = '';
        } else {
          console.log("Character not found");
        }
      } catch (error) {
        console.log("Error fetching character data:", error);
      }
    }
  }
  
function generateCharacterCard(character) {
    // Create a unique card ID
    const cardId = `card-${cardIdCounter++}`

    const characterGrid = document.getElementById('character-grid');
    const cardTemplate = document.getElementById('character-card-template');
  
    const card = cardTemplate.content.cloneNode(true).querySelector('.character-card');

    // Set the card ID
    card.id = cardId;

    const nameElement = card.querySelector('.character-name');
    const vocationElement = card.querySelector('.character-vocation');
    const progressBarInner = card.querySelector(".bar");
    const cardImage = card.querySelector(".card-img");
    const lvlandDate = card.querySelector("#lvlandDate");
    
  
    nameElement.textContent = character.name;
    vocationElement.textContent = character.vocation;
    const pctjeApi = 100 * (1 - (xpTable[character.level].experience - character.value) / (xpTable[character.level].experience - xpTable[character.level - 1].experience));
    progressBarInner.style.setProperty("--progress", pctjeApi.toString() + "%");
    switch(character.vocation){
        case "Elder Druid":
            cardImage.src = "img/ed.png";
            break;
        case "Elite Knight":
            cardImage.src = "img/ek.png";
            break;
        case "Master Sorcerer":
            cardImage.src = "img/ms.png";
            break;
        case "Royal Paladin":
            cardImage.src = "img/rp.png";
            break;
    }
    lvlandDate.textContent = "XP para level " + document.querySelector('#target').value + " el dia " + document.querySelector('#goalDatePicker').value;


    characterGrid.appendChild(card);
    
    calculateCharacterProgress(card, character);

  }

  function deleteCharacterCard(button) {
    const card = button.parentNode;
    card.remove();
  }

  function calculateCharacterProgress(characterCard, characterData) {
  
    // Calculate and update the additional labels
    const currentExpLabel = characterCard.querySelector("#currentExp");
    const expShareLabel = characterCard.querySelector("#expShare");
    const blessCostLabel = characterCard.querySelector("#blessCost");
    const xpSiguienteLvlLabel = characterCard.querySelector("#xpSiguienteLvl");
    const diasLabel = characterCard.querySelector("#dias");
    const xpTotalLabel = characterCard.querySelector("#xpTotal");
    const xpDayGLabel = characterCard.querySelector("#xpDayG");
    const xpDayRLabel = characterCard.querySelector("#xpDayR");
    const xpWeekLabel = characterCard.querySelector("#xpWeek");
    const xpMonthLabel = characterCard.querySelector("#xpMonth");
    const levelBar = characterCard.querySelector("#charLevel");
    const xpPerDay = document.getElementById("xp-per-day").value;
    const xpPerDayLabel = characterCard.querySelector("#milestone-label");
  
    // Perform calculations based on character data
    const currentLevel = characterData.level;
    const targetLevel = Number(document.querySelector("#target").value);
  
    const targetXP = [3546319, 4540544, 6245272, 9637054, 13748624];
    const currentXP = characterData.value;
    const xpSiguienteLvl = xpTable[currentLevel].experience - characterData.value;
    const iniExp = characterData.value;
    const finExp = xpTable[targetLevel - 1].experience;
    const blessCost = 1.1 * 5 * (20000 + (currentLevel - 120) * 75) + 2 * (26000 + (currentLevel - 120) * 100);
  
    // Update the label texts with the calculated values
    currentExpLabel.textContent = "XP " + numberWithDotss(currentXP)
    expShareLabel.textContent = "Share desde level " + Math.round(currentLevel * (2 / 3)) + " hasta level " + Math.round(currentLevel * (3 / 2));
    blessCostLabel.textContent = numberWithDotss(Math.floor(blessCost)) + " k blessings/muerte";
    xpSiguienteLvlLabel.textContent = numberWithDotss(Math.floor(xpSiguienteLvl)) + " para siguiente nivel";
    levelBar.textContent = currentLevel;
    xpPerDayLabel.textContent = "Proyeccion subiendo " + xpPerDay + "kk al dia"

  
    const hoy = new Date();
    const fin = new Date(document.getElementById("goalDatePicker").value);
    const daysLeft = Math.floor((fin - hoy) / (1000 * 60 * 60 * 24));
    diasLabel.textContent = "Quedan " + daysLeft + " días.";
    xpTotalLabel.textContent = numberWithDotss(Math.floor(finExp - iniExp)) + " xp total";
  
    const xpDayG = Math.floor((finExp - iniExp) / daysLeft);

    xpDayGLabel.textContent = numberWithDotss(xpDayG) + " xp/día";

    xpWeekLabel.textContent = numberWithDotss(Math.floor((finExp - iniExp) / daysLeft * 7)) + " xp/semana";
    xpMonthLabel.textContent = numberWithDotss(Math.floor((finExp - iniExp) / daysLeft * 30)) + " xp/mes";

    //
    const milestoneDates = calculateProjectedData(currentLevel, xpPerDay);

    // Sort milestone dates based on milestone level
    milestoneDates.sort((a, b) => a.level - b.level);

    // Create an array of milestone levels and milestone dates
    const milestoneLevels = milestoneDates.map((milestone) => milestone.level);
    const milestoneDatesFormatted = milestoneDates.map((milestone) => milestone.date);
  
    // Create chart for milestone dates
    const milestoneChartCanvas = characterCard.querySelector('#milestoneChart');
    const milestoneChartData = {
      labels: milestoneDatesFormatted,
      datasets: [
        {
          label: 'Milestone Levels',
          data: milestoneLevels,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };

    new Chart(milestoneChartCanvas, {
        type: 'line',
        data: milestoneChartData,
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Level',
              },
            },
          },
        },
      });    

  }

  function calculateProjectedData(currentLevel, xpPerDay) {
    const milestones = [];
    const currentDate = new Date();
  
    for (let i = currentLevel + 10; i <= 900; i += 10) {
      const xpNeeded = xpTable[i].experience - xpTable[currentLevel].experience;
      const projectedDays = xpNeeded / (xpPerDay * 1000000);
      const projectedDate = new Date(currentDate.getTime() + projectedDays * 24 * 60 * 60 * 1000);
  
      if (!isNaN(projectedDate)) {
        const formattedDate = `${projectedDate.getFullYear()}-${projectedDate.getMonth() + 1}-${projectedDate.getDate()}`;
        milestones.push({
          level: i,
          date: formattedDate,
        });
      }
    }
    
    return milestones;
  }
  
 
function chargestimeleft() {
    charges = document.getElementById("numCharges").value
    timeh = charges/3600*2
    h = Math.floor(timeh)
    min = Math.round((timeh % 1)*60)
    document.getElementById("timeleft").textContent = h + "h " + min + "min"

};

async function rashid(){
    const city = ["Carlin","Svargrond","Liberty Bay","Port Hope","Ankrahmun","Darashia","Edron"];
    const date = new Date();
    const serverSave = 9;

    if ( date.getDay() == 0 && date.getHours() >= serverSave || date.getDay() == 1 && date.getHours() < serverSave ) document.getElementById("rashid").textContent = city[0]
    if ( date.getDay() == 1 && date.getHours() >= serverSave || date.getDay() == 2 && date.getHours() < serverSave ) document.getElementById("rashid").textContent = city[1]
    if ( date.getDay() == 2 && date.getHours() >= serverSave || date.getDay() == 3 && date.getHours() < serverSave ) document.getElementById("rashid").textContent = city[2]
    if ( date.getDay() == 3 && date.getHours() >= serverSave || date.getDay() == 4 && date.getHours() < serverSave ) document.getElementById("rashid").textContent = city[3]
    if ( date.getDay() == 4 && date.getHours() >= serverSave || date.getDay() == 5 && date.getHours() < serverSave ) document.getElementById("rashid").textContent = city[4]
    if ( date.getDay() == 5 && date.getHours() >= serverSave || date.getDay() == 6 && date.getHours() < serverSave ) document.getElementById("rashid").textContent = city[5]
    if ( date.getDay() == 6 && date.getHours() >= serverSave || date.getDay() == 0 && date.getHours() < serverSave ) document.getElementById("rashid").textContent = city[6]
};

async function boostedCreature(){
  const url = "https://api.tibiadata.com/v3/creatures"
  const data = await fetchApi(url)
  document.getElementById("boostedCreatureName").textContent = data.creatures.boosted.name
  document.getElementById("boostedCreatureImg").src = data.creatures.boosted.image_url
};

async function boostedBoss(){
  const url = "https://api.tibiadata.com/v3/boostablebosses"
  const data = await fetchApi(url)
  document.getElementById("boostedBossName").textContent = data.boostable_bosses.boosted.name
  document.getElementById("boostedBossImg").src = data.boostable_bosses.boosted.image_url
};

function numberWithDotss(x) {
  //return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (typeof x !== 'number') {
    return x; // Return the input as-is if it's not a number
  }

  const numberString = x.toString();
  const parts = [];
  let chunk = '';

  for (let i = numberString.length - 1; i >= 0; i--) {
    chunk = numberString[i] + chunk;

    if (chunk.length === 3 || i === 0) {
      parts.unshift(chunk);
      chunk = '';
    }
  }

  return parts.join('.');
};

/*
async function calculate() {

  const char = await characterLookup(document.getElementById('lookupName').value)

  var hoy = new Date();
  var fin = new Date(2024,1, 1);
  var fecha = document.getElementById("goalDatePicker").value;
  fin = new Date(fecha);

  const bar = document.querySelector(".bar");

  //if ( char.level < 600 ) document.getElementById("target").value = 600
  //if ( char.level >= 600 && char.level < 650 ) document.getElementById("target").value = 650
  //if ( char.level >= 650 && char.level < 700 ) document.getElementById("target").value = 700
  //if ( char.level >= 700 && char.level < 750 ) document.getElementById("target").value = 750
  //if ( char.level >= 750 && char.level < 800 ) document.getElementById("target").value = 800


  var targetXP = 3546319;
  if (targetLvl == 600) targetXP = 3546319;
  if (targetLvl == 650) targetXP = 4540544;
  if (targetLvl == 700) targetXP = 6245272;
  if (targetLvl == 750) targetXP = 9637054;
  if (targetLvl == 800) targetXP = 13748624;
  const one_day=1000*60*60*24;
  var daysLeft = Math.floor(Math.abs(fin-hoy) / one_day);

  var currentLvl = char.level;
  var targetLvl = Number(document.querySelector("#target").value);

  //if (currentLvl < 800) document.getElementById("target").value = "800"
  //if (currentLvl < 750) document.getElementById("target").value = "750"
  //if (currentLvl < 700) document.getElementById("target").value = "700"
  //if (currentLvl < 650) document.getElementById("target").value = "650"
  //if (currentLvl < 600) document.getElementById("target").value = "600"


  //var pctje = Number(document.querySelector("#myRange").value)/100;
  var pctjeApi = 100*(1-(xpTable[char.level].experience - char.value)/(xpTable[char.level].experience - xpTable[char.level-1].experience));
  var xpSiguienteLvl = xpTable[char.level].experience - char.value;
  var iniExp = char.value;
  var finExp = xpTable[targetLvl-1].experience;
  var blessCost = 1.1*5*(20000+(currentLvl-120)*75)+2*(26000+(currentLvl-120)*100);


  //document.getElementById("myRange").value = pctjeApi
  bar.style.setProperty("--progress", pctjeApi.toString()+"%");


  document.getElementById("xpDayG").textContent="";
  document.getElementById("xpDayR").textContent="";


  document.getElementById("xpSiguienteLvl").textContent = numberWithDotss(Math.floor(xpSiguienteLvl)) + " para siguiente lvl";
  if (Math.floor((finExp-iniExp) / daysLeft)>targetXP)
  document.getElementById("xpDayR").textContent = numberWithDotss(Math.floor((finExp-iniExp) / daysLeft)) + " xp/dia";
  else
  document.getElementById("xpDayG").textContent = numberWithDotss(Math.floor((finExp-iniExp) / daysLeft)) + " xp/dia";

  document.getElementById("dias").textContent = "Quedan " +daysLeft+ " dias.";
  document.getElementById("xpTotal").textContent = numberWithDotss(Math.floor((finExp-iniExp))) + " xp total";

  document.getElementById("xpWeek").textContent = numberWithDotss(Math.floor((finExp-iniExp) / daysLeft*7)) + " xp/semana";
  document.getElementById("xpMonth").textContent = numberWithDotss(Math.floor((finExp-iniExp) / daysLeft*30)) + " xp/mes";
  document.getElementById("blessCost").textContent = numberWithDotss(Math.floor(1.1*5*(20000+(currentLvl-120)*75)+2*(26000+(currentLvl-120)*100))) + " k blessings/muerte";
  document.getElementById("expShare").textContent = "Share desde level " + Math.round(currentLvl * (2/3)) + " hasta level " + Math.round(currentLvl * (3/2));
}
*/
async function calculate() {
    const charName = document.getElementById('lookupName').value;
    const targetLevel = Number(document.querySelector("#target").value);
    const char = await characterLookup(charName);
  
    if (!char) {
      console.log("Character not found");
      return;
    }
  
    const currentLevel = xpTable[char.level];
    const nextLevel = xpTable[char.level + 1];
    const currentExperience = char.value - currentLevel.experience;
    const remainingExperience = nextLevel.experience - currentExperience;
    const requiredExperience = xpTable[targetLevel - 1].experience - char.value;
    const daysLeft = calculateDaysLeft();
  
    updateProgressBar(currentExperience, remainingExperience);
    updateCharacterLevel(char.level);
    updateLevelProgress(remainingExperience);
    updateExperienceStats(requiredExperience, daysLeft);
    updateMiscellaneousStats(char.level);
  
    createCharacterCard(char);
  }
  
  function updateProgressBar(currentExperience, remainingExperience) {
    const progressPercentage = (currentExperience / remainingExperience) * 100;
    const bar = document.querySelector(".bar");
    bar.style.setProperty("--progress", progressPercentage + "%");
  }
  
  function updateCharacterLevel(level) {
    const charLevelElement = document.getElementById("charLevel");
    charLevelElement.textContent = level;
  }
  
  function updateLevelProgress(remainingExperience) {
    const xpSiguienteLvlElement = document.getElementById("xpSiguienteLvl");
    xpSiguienteLvlElement.textContent = numberWithDotss(remainingExperience) + " para siguiente lvl";
  }
  
  function updateExperienceStats(requiredExperience, daysLeft) {
    const xpDayGElement = document.getElementById("xpDayG");
    const xpDayRElement = document.getElementById("xpDayR");
  
    const xpDay = Math.floor(requiredExperience / daysLeft);
    if (xpDay > requiredExperience) {
      xpDayGElement.textContent = numberWithDotss(xpDay) + " xp/dia";
      xpDayRElement.textContent = "";
    } else {
      xpDayGElement.textContent = "";
      xpDayRElement.textContent = numberWithDotss(xpDay) + " xp/dia";
    }
  
    document.getElementById("dias").textContent = "Quedan " + daysLeft + " dias.";
    document.getElementById("xpTotal").textContent = numberWithDotss(requiredExperience) + " xp total";
    document.getElementById("xpWeek").textContent = numberWithDotss(xpDay * 7) + " xp/semana";
    document.getElementById("xpMonth").textContent = numberWithDotss(xpDay * 30) + " xp/mes";
  }
  
  function updateMiscellaneousStats(currentLevel) {
    const blessCost = calculateBlessingCost(currentLevel);
    const expShareElement = document.getElementById("expShare");
    const blessCostElement = document.getElementById("blessCost");
  
    expShareElement.textContent = "Share desde level " + Math.round(currentLevel * (2 / 3)) + " hasta level " + Math.round(currentLevel * (3 / 2));
    blessCostElement.textContent = numberWithDotss(blessCost) + " k blessings/muerte";
  }

async function init(){
    boostedCreature();
    boostedBoss();
    rashid();
}

let cardIdCounter = 0;

const xpTable = [
    {
        "level": 1,
        "experience": 0
    },
    {
        "level": 2,
        "experience": 100
    },
    {
        "level": 3,
        "experience": 200
    },
    {
        "level": 4,
        "experience": 400
    },
    {
        "level": 5,
        "experience": 800
    },
    {
        "level": 6,
        "experience": 1500
    },
    {
        "level": 7,
        "experience": 2600
    },
    {
        "level": 8,
        "experience": 4200
    },
    {
        "level": 9,
        "experience": 6400
    },
    {
        "level": 10,
        "experience": 9300
    },
    {
        "level": 11,
        "experience": 13000
    },
    {
        "level": 12,
        "experience": 17600
    },
    {
        "level": 13,
        "experience": 23200
    },
    {
        "level": 14,
        "experience": 29900
    },
    {
        "level": 15,
        "experience": 37800
    },
    {
        "level": 16,
        "experience": 47000
    },
    {
        "level": 17,
        "experience": 57600
    },
    {
        "level": 18,
        "experience": 69700
    },
    {
        "level": 19,
        "experience": 83400
    },
    {
        "level": 20,
        "experience": 98800
    },
    {
        "level": 21,
        "experience": 116000
    },
    {
        "level": 22,
        "experience": 135100
    },
    {
        "level": 23,
        "experience": 156200
    },
    {
        "level": 24,
        "experience": 179400
    },
    {
        "level": 25,
        "experience": 204800
    },
    {
        "level": 26,
        "experience": 232500
    },
    {
        "level": 27,
        "experience": 262600
    },
    {
        "level": 28,
        "experience": 295200
    },
    {
        "level": 29,
        "experience": 330400
    },
    {
        "level": 30,
        "experience": 368300
    },
    {
        "level": 31,
        "experience": 409000
    },
    {
        "level": 32,
        "experience": 452600
    },
    {
        "level": 33,
        "experience": 499200
    },
    {
        "level": 34,
        "experience": 548900
    },
    {
        "level": 35,
        "experience": 601800
    },
    {
        "level": 36,
        "experience": 658000
    },
    {
        "level": 37,
        "experience": 717600
    },
    {
        "level": 38,
        "experience": 780700
    },
    {
        "level": 39,
        "experience": 847400
    },
    {
        "level": 40,
        "experience": 917800
    },
    {
        "level": 41,
        "experience": 992000
    },
    {
        "level": 42,
        "experience": 1070100
    },
    {
        "level": 43,
        "experience": 1152200
    },
    {
        "level": 44,
        "experience": 1238400
    },
    {
        "level": 45,
        "experience": 1328800
    },
    {
        "level": 46,
        "experience": 1423500
    },
    {
        "level": 47,
        "experience": 1522600
    },
    {
        "level": 48,
        "experience": 1626200
    },
    {
        "level": 49,
        "experience": 1734400
    },
    {
        "level": 50,
        "experience": 1847300
    },
    {
        "level": 51,
        "experience": 1965000
    },
    {
        "level": 52,
        "experience": 2087600
    },
    {
        "level": 53,
        "experience": 2215200
    },
    {
        "level": 54,
        "experience": 2347900
    },
    {
        "level": 55,
        "experience": 2485800
    },
    {
        "level": 56,
        "experience": 2629000
    },
    {
        "level": 57,
        "experience": 2777600
    },
    {
        "level": 58,
        "experience": 2931700
    },
    {
        "level": 59,
        "experience": 3091400
    },
    {
        "level": 60,
        "experience": 3256800
    },
    {
        "level": 61,
        "experience": 3428000
    },
    {
        "level": 62,
        "experience": 3605100
    },
    {
        "level": 63,
        "experience": 3788200
    },
    {
        "level": 64,
        "experience": 3977400
    },
    {
        "level": 65,
        "experience": 4172800
    },
    {
        "level": 66,
        "experience": 4374500
    },
    {
        "level": 67,
        "experience": 4582600
    },
    {
        "level": 68,
        "experience": 4797200
    },
    {
        "level": 69,
        "experience": 5018400
    },
    {
        "level": 70,
        "experience": 5246300
    },
    {
        "level": 71,
        "experience": 5481000
    },
    {
        "level": 72,
        "experience": 5722600
    },
    {
        "level": 73,
        "experience": 5971200
    },
    {
        "level": 74,
        "experience": 6226900
    },
    {
        "level": 75,
        "experience": 6489800
    },
    {
        "level": 76,
        "experience": 6760000
    },
    {
        "level": 77,
        "experience": 7037600
    },
    {
        "level": 78,
        "experience": 7322700
    },
    {
        "level": 79,
        "experience": 7615400
    },
    {
        "level": 80,
        "experience": 7915800
    },
    {
        "level": 81,
        "experience": 8224000
    },
    {
        "level": 82,
        "experience": 8540100
    },
    {
        "level": 83,
        "experience": 8864200
    },
    {
        "level": 84,
        "experience": 9196400
    },
    {
        "level": 85,
        "experience": 9536800
    },
    {
        "level": 86,
        "experience": 9885500
    },
    {
        "level": 87,
        "experience": 10242600
    },
    {
        "level": 88,
        "experience": 10608200
    },
    {
        "level": 89,
        "experience": 10982400
    },
    {
        "level": 90,
        "experience": 11365300
    },
    {
        "level": 91,
        "experience": 11757000
    },
    {
        "level": 92,
        "experience": 12157600
    },
    {
        "level": 93,
        "experience": 12567200
    },
    {
        "level": 94,
        "experience": 12985900
    },
    {
        "level": 95,
        "experience": 13413800
    },
    {
        "level": 96,
        "experience": 13851000
    },
    {
        "level": 97,
        "experience": 14297600
    },
    {
        "level": 98,
        "experience": 14753700
    },
    {
        "level": 99,
        "experience": 15219400
    },
    {
        "level": 100,
        "experience": 15694800
    },
    {
        "level": 101,
        "experience": 16180000
    },
    {
        "level": 102,
        "experience": 16675100
    },
    {
        "level": 103,
        "experience": 17180200
    },
    {
        "level": 104,
        "experience": 17695400
    },
    {
        "level": 105,
        "experience": 18220800
    },
    {
        "level": 106,
        "experience": 18756500
    },
    {
        "level": 107,
        "experience": 19302600
    },
    {
        "level": 108,
        "experience": 19859200
    },
    {
        "level": 109,
        "experience": 20426400
    },
    {
        "level": 110,
        "experience": 21004300
    },
    {
        "level": 111,
        "experience": 21593000
    },
    {
        "level": 112,
        "experience": 22192600
    },
    {
        "level": 113,
        "experience": 22803200
    },
    {
        "level": 114,
        "experience": 23424900
    },
    {
        "level": 115,
        "experience": 24057800
    },
    {
        "level": 116,
        "experience": 24702000
    },
    {
        "level": 117,
        "experience": 25357600
    },
    {
        "level": 118,
        "experience": 26024700
    },
    {
        "level": 119,
        "experience": 26703400
    },
    {
        "level": 120,
        "experience": 27393800
    },
    {
        "level": 121,
        "experience": 28096000
    },
    {
        "level": 122,
        "experience": 28810100
    },
    {
        "level": 123,
        "experience": 29536200
    },
    {
        "level": 124,
        "experience": 30274400
    },
    {
        "level": 125,
        "experience": 31024800
    },
    {
        "level": 126,
        "experience": 31787500
    },
    {
        "level": 127,
        "experience": 32562600
    },
    {
        "level": 128,
        "experience": 33350200
    },
    {
        "level": 129,
        "experience": 34150400
    },
    {
        "level": 130,
        "experience": 34963300
    },
    {
        "level": 131,
        "experience": 35789000
    },
    {
        "level": 132,
        "experience": 36627600
    },
    {
        "level": 133,
        "experience": 37479200
    },
    {
        "level": 134,
        "experience": 38343900
    },
    {
        "level": 135,
        "experience": 39221800
    },
    {
        "level": 136,
        "experience": 40113000
    },
    {
        "level": 137,
        "experience": 41017600
    },
    {
        "level": 138,
        "experience": 41935700
    },
    {
        "level": 139,
        "experience": 42867400
    },
    {
        "level": 140,
        "experience": 43812800
    },
    {
        "level": 141,
        "experience": 44772000
    },
    {
        "level": 142,
        "experience": 45745100
    },
    {
        "level": 143,
        "experience": 46732200
    },
    {
        "level": 144,
        "experience": 47733400
    },
    {
        "level": 145,
        "experience": 48748800
    },
    {
        "level": 146,
        "experience": 49778500
    },
    {
        "level": 147,
        "experience": 50822600
    },
    {
        "level": 148,
        "experience": 51881200
    },
    {
        "level": 149,
        "experience": 52954400
    },
    {
        "level": 150,
        "experience": 54042300
    },
    {
        "level": 151,
        "experience": 55145000
    },
    {
        "level": 152,
        "experience": 56262600
    },
    {
        "level": 153,
        "experience": 57395200
    },
    {
        "level": 154,
        "experience": 58542900
    },
    {
        "level": 155,
        "experience": 59705800
    },
    {
        "level": 156,
        "experience": 60884000
    },
    {
        "level": 157,
        "experience": 62077600
    },
    {
        "level": 158,
        "experience": 63286700
    },
    {
        "level": 159,
        "experience": 64511400
    },
    {
        "level": 160,
        "experience": 65751800
    },
    {
        "level": 161,
        "experience": 67008000
    },
    {
        "level": 162,
        "experience": 68280100
    },
    {
        "level": 163,
        "experience": 69568200
    },
    {
        "level": 164,
        "experience": 70872400
    },
    {
        "level": 165,
        "experience": 72192800
    },
    {
        "level": 166,
        "experience": 73529500
    },
    {
        "level": 167,
        "experience": 74882600
    },
    {
        "level": 168,
        "experience": 76252200
    },
    {
        "level": 169,
        "experience": 77638400
    },
    {
        "level": 170,
        "experience": 79041300
    },
    {
        "level": 171,
        "experience": 80461000
    },
    {
        "level": 172,
        "experience": 81897600
    },
    {
        "level": 173,
        "experience": 83351200
    },
    {
        "level": 174,
        "experience": 84821900
    },
    {
        "level": 175,
        "experience": 86309800
    },
    {
        "level": 176,
        "experience": 87815000
    },
    {
        "level": 177,
        "experience": 89337600
    },
    {
        "level": 178,
        "experience": 90877700
    },
    {
        "level": 179,
        "experience": 92435400
    },
    {
        "level": 180,
        "experience": 94010800
    },
    {
        "level": 181,
        "experience": 95604000
    },
    {
        "level": 182,
        "experience": 97215100
    },
    {
        "level": 183,
        "experience": 98844200
    },
    {
        "level": 184,
        "experience": 100491400
    },
    {
        "level": 185,
        "experience": 102156800
    },
    {
        "level": 186,
        "experience": 103840500
    },
    {
        "level": 187,
        "experience": 105542600
    },
    {
        "level": 188,
        "experience": 107263200
    },
    {
        "level": 189,
        "experience": 109002400
    },
    {
        "level": 190,
        "experience": 110760300
    },
    {
        "level": 191,
        "experience": 112537000
    },
    {
        "level": 192,
        "experience": 114332600
    },
    {
        "level": 193,
        "experience": 116147200
    },
    {
        "level": 194,
        "experience": 117980900
    },
    {
        "level": 195,
        "experience": 119833800
    },
    {
        "level": 196,
        "experience": 121706000
    },
    {
        "level": 197,
        "experience": 123597600
    },
    {
        "level": 198,
        "experience": 125508700
    },
    {
        "level": 199,
        "experience": 127439400
    },
    {
        "level": 200,
        "experience": 129389800
    },
    {
        "level": 201,
        "experience": 131360000
    },
    {
        "level": 202,
        "experience": 133350100
    },
    {
        "level": 203,
        "experience": 135360200
    },
    {
        "level": 204,
        "experience": 137390400
    },
    {
        "level": 205,
        "experience": 139440800
    },
    {
        "level": 206,
        "experience": 141511500
    },
    {
        "level": 207,
        "experience": 143602600
    },
    {
        "level": 208,
        "experience": 145714200
    },
    {
        "level": 209,
        "experience": 147846400
    },
    {
        "level": 210,
        "experience": 149999300
    },
    {
        "level": 211,
        "experience": 152173000
    },
    {
        "level": 212,
        "experience": 154367600
    },
    {
        "level": 213,
        "experience": 156583200
    },
    {
        "level": 214,
        "experience": 158819900
    },
    {
        "level": 215,
        "experience": 161077800
    },
    {
        "level": 216,
        "experience": 163357000
    },
    {
        "level": 217,
        "experience": 165657600
    },
    {
        "level": 218,
        "experience": 167979700
    },
    {
        "level": 219,
        "experience": 170323400
    },
    {
        "level": 220,
        "experience": 172688800
    },
    {
        "level": 221,
        "experience": 175076000
    },
    {
        "level": 222,
        "experience": 177485100
    },
    {
        "level": 223,
        "experience": 179916200
    },
    {
        "level": 224,
        "experience": 182369400
    },
    {
        "level": 225,
        "experience": 184844800
    },
    {
        "level": 226,
        "experience": 187342500
    },
    {
        "level": 227,
        "experience": 189862600
    },
    {
        "level": 228,
        "experience": 192405200
    },
    {
        "level": 229,
        "experience": 194970400
    },
    {
        "level": 230,
        "experience": 197558300
    },
    {
        "level": 231,
        "experience": 200169000
    },
    {
        "level": 232,
        "experience": 202802600
    },
    {
        "level": 233,
        "experience": 205459200
    },
    {
        "level": 234,
        "experience": 208138900
    },
    {
        "level": 235,
        "experience": 210841800
    },
    {
        "level": 236,
        "experience": 213568000
    },
    {
        "level": 237,
        "experience": 216317600
    },
    {
        "level": 238,
        "experience": 219090700
    },
    {
        "level": 239,
        "experience": 221887400
    },
    {
        "level": 240,
        "experience": 224707800
    },
    {
        "level": 241,
        "experience": 227552000
    },
    {
        "level": 242,
        "experience": 230420100
    },
    {
        "level": 243,
        "experience": 233312200
    },
    {
        "level": 244,
        "experience": 236228400
    },
    {
        "level": 245,
        "experience": 239168800
    },
    {
        "level": 246,
        "experience": 242133500
    },
    {
        "level": 247,
        "experience": 245122600
    },
    {
        "level": 248,
        "experience": 248136200
    },
    {
        "level": 249,
        "experience": 251174400
    },
    {
        "level": 250,
        "experience": 254237300
    },
    {
        "level": 251,
        "experience": 257325000
    },
    {
        "level": 252,
        "experience": 260437600
    },
    {
        "level": 253,
        "experience": 263575200
    },
    {
        "level": 254,
        "experience": 266737900
    },
    {
        "level": 255,
        "experience": 269925800
    },
    {
        "level": 256,
        "experience": 273139000
    },
    {
        "level": 257,
        "experience": 276377600
    },
    {
        "level": 258,
        "experience": 279641700
    },
    {
        "level": 259,
        "experience": 282931400
    },
    {
        "level": 260,
        "experience": 286246800
    },
    {
        "level": 261,
        "experience": 289588000
    },
    {
        "level": 262,
        "experience": 292955100
    },
    {
        "level": 263,
        "experience": 296348200
    },
    {
        "level": 264,
        "experience": 299767400
    },
    {
        "level": 265,
        "experience": 303212800
    },
    {
        "level": 266,
        "experience": 306684500
    },
    {
        "level": 267,
        "experience": 310182600
    },
    {
        "level": 268,
        "experience": 313707200
    },
    {
        "level": 269,
        "experience": 317258400
    },
    {
        "level": 270,
        "experience": 320836300
    },
    {
        "level": 271,
        "experience": 324441000
    },
    {
        "level": 272,
        "experience": 328072600
    },
    {
        "level": 273,
        "experience": 331731200
    },
    {
        "level": 274,
        "experience": 335416900
    },
    {
        "level": 275,
        "experience": 339129800
    },
    {
        "level": 276,
        "experience": 342870000
    },
    {
        "level": 277,
        "experience": 346637600
    },
    {
        "level": 278,
        "experience": 350432700
    },
    {
        "level": 279,
        "experience": 354255400
    },
    {
        "level": 280,
        "experience": 358105800
    },
    {
        "level": 281,
        "experience": 361984000
    },
    {
        "level": 282,
        "experience": 365890100
    },
    {
        "level": 283,
        "experience": 369824200
    },
    {
        "level": 284,
        "experience": 373786400
    },
    {
        "level": 285,
        "experience": 377776800
    },
    {
        "level": 286,
        "experience": 381795500
    },
    {
        "level": 287,
        "experience": 385842600
    },
    {
        "level": 288,
        "experience": 389918200
    },
    {
        "level": 289,
        "experience": 394022400
    },
    {
        "level": 290,
        "experience": 398155300
    },
    {
        "level": 291,
        "experience": 402317000
    },
    {
        "level": 292,
        "experience": 406507600
    },
    {
        "level": 293,
        "experience": 410727200
    },
    {
        "level": 294,
        "experience": 414975900
    },
    {
        "level": 295,
        "experience": 419253800
    },
    {
        "level": 296,
        "experience": 423561000
    },
    {
        "level": 297,
        "experience": 427897600
    },
    {
        "level": 298,
        "experience": 432263700
    },
    {
        "level": 299,
        "experience": 436659400
    },
    {
        "level": 300,
        "experience": 441084800
    },
    {
        "level": 301,
        "experience": 445540000
    },
    {
        "level": 302,
        "experience": 450025100
    },
    {
        "level": 303,
        "experience": 454540200
    },
    {
        "level": 304,
        "experience": 459085400
    },
    {
        "level": 305,
        "experience": 463660800
    },
    {
        "level": 306,
        "experience": 468266500
    },
    {
        "level": 307,
        "experience": 472902600
    },
    {
        "level": 308,
        "experience": 477569200
    },
    {
        "level": 309,
        "experience": 482266400
    },
    {
        "level": 310,
        "experience": 486994300
    },
    {
        "level": 311,
        "experience": 491753000
    },
    {
        "level": 312,
        "experience": 496542600
    },
    {
        "level": 313,
        "experience": 501363200
    },
    {
        "level": 314,
        "experience": 506214900
    },
    {
        "level": 315,
        "experience": 511097800
    },
    {
        "level": 316,
        "experience": 516012000
    },
    {
        "level": 317,
        "experience": 520957600
    },
    {
        "level": 318,
        "experience": 525934700
    },
    {
        "level": 319,
        "experience": 530943400
    },
    {
        "level": 320,
        "experience": 535983800
    },
    {
        "level": 321,
        "experience": 541056000
    },
    {
        "level": 322,
        "experience": 546160100
    },
    {
        "level": 323,
        "experience": 551296200
    },
    {
        "level": 324,
        "experience": 556464400
    },
    {
        "level": 325,
        "experience": 561664800
    },
    {
        "level": 326,
        "experience": 566897500
    },
    {
        "level": 327,
        "experience": 572162600
    },
    {
        "level": 328,
        "experience": 577460200
    },
    {
        "level": 329,
        "experience": 582790400
    },
    {
        "level": 330,
        "experience": 588153300
    },
    {
        "level": 331,
        "experience": 593549000
    },
    {
        "level": 332,
        "experience": 598977600
    },
    {
        "level": 333,
        "experience": 604439200
    },
    {
        "level": 334,
        "experience": 609933900
    },
    {
        "level": 335,
        "experience": 615461800
    },
    {
        "level": 336,
        "experience": 621023000
    },
    {
        "level": 337,
        "experience": 626617600
    },
    {
        "level": 338,
        "experience": 632245700
    },
    {
        "level": 339,
        "experience": 637907400
    },
    {
        "level": 340,
        "experience": 643602800
    },
    {
        "level": 341,
        "experience": 649332000
    },
    {
        "level": 342,
        "experience": 655095100
    },
    {
        "level": 343,
        "experience": 660892200
    },
    {
        "level": 344,
        "experience": 666723400
    },
    {
        "level": 345,
        "experience": 672588800
    },
    {
        "level": 346,
        "experience": 678488500
    },
    {
        "level": 347,
        "experience": 684422600
    },
    {
        "level": 348,
        "experience": 690391200
    },
    {
        "level": 349,
        "experience": 696394400
    },
    {
        "level": 350,
        "experience": 702432300
    },
    {
        "level": 351,
        "experience": 708505000
    },
    {
        "level": 352,
        "experience": 714612600
    },
    {
        "level": 353,
        "experience": 720755200
    },
    {
        "level": 354,
        "experience": 726932900
    },
    {
        "level": 355,
        "experience": 733145800
    },
    {
        "level": 356,
        "experience": 739394000
    },
    {
        "level": 357,
        "experience": 745677600
    },
    {
        "level": 358,
        "experience": 751996700
    },
    {
        "level": 359,
        "experience": 758351400
    },
    {
        "level": 360,
        "experience": 764741800
    },
    {
        "level": 361,
        "experience": 771168000
    },
    {
        "level": 362,
        "experience": 777630100
    },
    {
        "level": 363,
        "experience": 784128200
    },
    {
        "level": 364,
        "experience": 790662400
    },
    {
        "level": 365,
        "experience": 797232800
    },
    {
        "level": 366,
        "experience": 803839500
    },
    {
        "level": 367,
        "experience": 810482600
    },
    {
        "level": 368,
        "experience": 817162200
    },
    {
        "level": 369,
        "experience": 823878400
    },
    {
        "level": 370,
        "experience": 830631300
    },
    {
        "level": 371,
        "experience": 837421000
    },
    {
        "level": 372,
        "experience": 844247600
    },
    {
        "level": 373,
        "experience": 851111200
    },
    {
        "level": 374,
        "experience": 858011900
    },
    {
        "level": 375,
        "experience": 864949800
    },
    {
        "level": 376,
        "experience": 871925000
    },
    {
        "level": 377,
        "experience": 878937600
    },
    {
        "level": 378,
        "experience": 885987700
    },
    {
        "level": 379,
        "experience": 893075400
    },
    {
        "level": 380,
        "experience": 900200800
    },
    {
        "level": 381,
        "experience": 907364000
    },
    {
        "level": 382,
        "experience": 914565100
    },
    {
        "level": 383,
        "experience": 921804200
    },
    {
        "level": 384,
        "experience": 929081400
    },
    {
        "level": 385,
        "experience": 936396800
    },
    {
        "level": 386,
        "experience": 943750500
    },
    {
        "level": 387,
        "experience": 951142600
    },
    {
        "level": 388,
        "experience": 958573200
    },
    {
        "level": 389,
        "experience": 966042400
    },
    {
        "level": 390,
        "experience": 973550300
    },
    {
        "level": 391,
        "experience": 981097000
    },
    {
        "level": 392,
        "experience": 988682600
    },
    {
        "level": 393,
        "experience": 996307200
    },
    {
        "level": 394,
        "experience": 1003970900
    },
    {
        "level": 395,
        "experience": 1011673800
    },
    {
        "level": 396,
        "experience": 1019416000
    },
    {
        "level": 397,
        "experience": 1027197600
    },
    {
        "level": 398,
        "experience": 1035018700
    },
    {
        "level": 399,
        "experience": 1042879400
    },
    {
        "level": 400,
        "experience": 1050779800
    },
    {
        "level": 401,
        "experience": 1058720000
    },
    {
        "level": 402,
        "experience": 1066700100
    },
    {
        "level": 403,
        "experience": 1074720200
    },
    {
        "level": 404,
        "experience": 1082780400
    },
    {
        "level": 405,
        "experience": 1090880800
    },
    {
        "level": 406,
        "experience": 1099021500
    },
    {
        "level": 407,
        "experience": 1107202600
    },
    {
        "level": 408,
        "experience": 1115424200
    },
    {
        "level": 409,
        "experience": 1123686400
    },
    {
        "level": 410,
        "experience": 1131989300
    },
    {
        "level": 411,
        "experience": 1140333000
    },
    {
        "level": 412,
        "experience": 1148717600
    },
    {
        "level": 413,
        "experience": 1157143200
    },
    {
        "level": 414,
        "experience": 1165609900
    },
    {
        "level": 415,
        "experience": 1174117800
    },
    {
        "level": 416,
        "experience": 1182667000
    },
    {
        "level": 417,
        "experience": 1191257600
    },
    {
        "level": 418,
        "experience": 1199889700
    },
    {
        "level": 419,
        "experience": 1208563400
    },
    {
        "level": 420,
        "experience": 1217278800
    },
    {
        "level": 421,
        "experience": 1226036000
    },
    {
        "level": 422,
        "experience": 1234835100
    },
    {
        "level": 423,
        "experience": 1243676200
    },
    {
        "level": 424,
        "experience": 1252559400
    },
    {
        "level": 425,
        "experience": 1261484800
    },
    {
        "level": 426,
        "experience": 1270452500
    },
    {
        "level": 427,
        "experience": 1279462600
    },
    {
        "level": 428,
        "experience": 1288515200
    },
    {
        "level": 429,
        "experience": 1297610400
    },
    {
        "level": 430,
        "experience": 1306748300
    },
    {
        "level": 431,
        "experience": 1315929000
    },
    {
        "level": 432,
        "experience": 1325152600
    },
    {
        "level": 433,
        "experience": 1334419200
    },
    {
        "level": 434,
        "experience": 1343728900
    },
    {
        "level": 435,
        "experience": 1353081800
    },
    {
        "level": 436,
        "experience": 1362478000
    },
    {
        "level": 437,
        "experience": 1371917600
    },
    {
        "level": 438,
        "experience": 1381400700
    },
    {
        "level": 439,
        "experience": 1390927400
    },
    {
        "level": 440,
        "experience": 1400497800
    },
    {
        "level": 441,
        "experience": 1410112000
    },
    {
        "level": 442,
        "experience": 1419770100
    },
    {
        "level": 443,
        "experience": 1429472200
    },
    {
        "level": 444,
        "experience": 1439218400
    },
    {
        "level": 445,
        "experience": 1449008800
    },
    {
        "level": 446,
        "experience": 1458843500
    },
    {
        "level": 447,
        "experience": 1468722600
    },
    {
        "level": 448,
        "experience": 1478646200
    },
    {
        "level": 449,
        "experience": 1488614400
    },
    {
        "level": 450,
        "experience": 1498627300
    },
    {
        "level": 451,
        "experience": 1508685000
    },
    {
        "level": 452,
        "experience": 1518787600
    },
    {
        "level": 453,
        "experience": 1528935200
    },
    {
        "level": 454,
        "experience": 1539127900
    },
    {
        "level": 455,
        "experience": 1549365800
    },
    {
        "level": 456,
        "experience": 1559649000
    },
    {
        "level": 457,
        "experience": 1569977600
    },
    {
        "level": 458,
        "experience": 1580351700
    },
    {
        "level": 459,
        "experience": 1590771400
    },
    {
        "level": 460,
        "experience": 1601236800
    },
    {
        "level": 461,
        "experience": 1611748000
    },
    {
        "level": 462,
        "experience": 1622305100
    },
    {
        "level": 463,
        "experience": 1632908200
    },
    {
        "level": 464,
        "experience": 1643557400
    },
    {
        "level": 465,
        "experience": 1654252800
    },
    {
        "level": 466,
        "experience": 1664994500
    },
    {
        "level": 467,
        "experience": 1675782600
    },
    {
        "level": 468,
        "experience": 1686617200
    },
    {
        "level": 469,
        "experience": 1697498400
    },
    {
        "level": 470,
        "experience": 1708426300
    },
    {
        "level": 471,
        "experience": 1719401000
    },
    {
        "level": 472,
        "experience": 1730422600
    },
    {
        "level": 473,
        "experience": 1741491200
    },
    {
        "level": 474,
        "experience": 1752606900
    },
    {
        "level": 475,
        "experience": 1763769800
    },
    {
        "level": 476,
        "experience": 1774980000
    },
    {
        "level": 477,
        "experience": 1786237600
    },
    {
        "level": 478,
        "experience": 1797542700
    },
    {
        "level": 479,
        "experience": 1808895400
    },
    {
        "level": 480,
        "experience": 1820295800
    },
    {
        "level": 481,
        "experience": 1831744000
    },
    {
        "level": 482,
        "experience": 1843240100
    },
    {
        "level": 483,
        "experience": 1854784200
    },
    {
        "level": 484,
        "experience": 1866376400
    },
    {
        "level": 485,
        "experience": 1878016800
    },
    {
        "level": 486,
        "experience": 1889705500
    },
    {
        "level": 487,
        "experience": 1901442600
    },
    {
        "level": 488,
        "experience": 1913228200
    },
    {
        "level": 489,
        "experience": 1925062400
    },
    {
        "level": 490,
        "experience": 1936945300
    },
    {
        "level": 491,
        "experience": 1948877000
    },
    {
        "level": 492,
        "experience": 1960857600
    },
    {
        "level": 493,
        "experience": 1972887200
    },
    {
        "level": 494,
        "experience": 1984965900
    },
    {
        "level": 495,
        "experience": 1997093800
    },
    {
        "level": 496,
        "experience": 2009271000
    },
    {
        "level": 497,
        "experience": 2021497600
    },
    {
        "level": 498,
        "experience": 2033773700
    },
    {
        "level": 499,
        "experience": 2046099400
    },
    {
        "level": 500,
        "experience": 2058474800
    },
    {
        "level": 501,
        "experience": 2070900000
    },
    {
        "level": 502,
        "experience": 2083375100
    },
    {
        "level": 503,
        "experience": 2095900200
    },
    {
        "level": 504,
        "experience": 2108475400
    },
    {
        "level": 505,
        "experience": 2121100800
    },
    {
        "level": 506,
        "experience": 2133776500
    },
    {
        "level": 507,
        "experience": 2146502600
    },
    {
        "level": 508,
        "experience": 2159279200
    },
    {
        "level": 509,
        "experience": 2172106400
    },
    {
        "level": 510,
        "experience": 2184984300
    },
    {
        "level": 511,
        "experience": 2197913000
    },
    {
        "level": 512,
        "experience": 2210892600
    },
    {
        "level": 513,
        "experience": 2223923200
    },
    {
        "level": 514,
        "experience": 2237004900
    },
    {
        "level": 515,
        "experience": 2250137800
    },
    {
        "level": 516,
        "experience": 2263322000
    },
    {
        "level": 517,
        "experience": 2276557600
    },
    {
        "level": 518,
        "experience": 2289844700
    },
    {
        "level": 519,
        "experience": 2303183400
    },
    {
        "level": 520,
        "experience": 2316573800
    },
    {
        "level": 521,
        "experience": 2330016000
    },
    {
        "level": 522,
        "experience": 2343510100
    },
    {
        "level": 523,
        "experience": 2357056200
    },
    {
        "level": 524,
        "experience": 2370654400
    },
    {
        "level": 525,
        "experience": 2384304800
    },
    {
        "level": 526,
        "experience": 2398007500
    },
    {
        "level": 527,
        "experience": 2411762600
    },
    {
        "level": 528,
        "experience": 2425570200
    },
    {
        "level": 529,
        "experience": 2439430400
    },
    {
        "level": 530,
        "experience": 2453343300
    },
    {
        "level": 531,
        "experience": 2467309000
    },
    {
        "level": 532,
        "experience": 2481327600
    },
    {
        "level": 533,
        "experience": 2495399200
    },
    {
        "level": 534,
        "experience": 2509523900
    },
    {
        "level": 535,
        "experience": 2523701800
    },
    {
        "level": 536,
        "experience": 2537933000
    },
    {
        "level": 537,
        "experience": 2552217600
    },
    {
        "level": 538,
        "experience": 2566555700
    },
    {
        "level": 539,
        "experience": 2580947400
    },
    {
        "level": 540,
        "experience": 2595392800
    },
    {
        "level": 541,
        "experience": 2609892000
    },
    {
        "level": 542,
        "experience": 2624445100
    },
    {
        "level": 543,
        "experience": 2639052200
    },
    {
        "level": 544,
        "experience": 2653713400
    },
    {
        "level": 545,
        "experience": 2668428800
    },
    {
        "level": 546,
        "experience": 2683198500
    },
    {
        "level": 547,
        "experience": 2698022600
    },
    {
        "level": 548,
        "experience": 2712901200
    },
    {
        "level": 549,
        "experience": 2727834400
    },
    {
        "level": 550,
        "experience": 2742822300
    },
    {
        "level": 551,
        "experience": 2757865000
    },
    {
        "level": 552,
        "experience": 2772962600
    },
    {
        "level": 553,
        "experience": 2788115200
    },
    {
        "level": 554,
        "experience": 2803322900
    },
    {
        "level": 555,
        "experience": 2818585800
    },
    {
        "level": 556,
        "experience": 2833904000
    },
    {
        "level": 557,
        "experience": 2849277600
    },
    {
        "level": 558,
        "experience": 2864706700
    },
    {
        "level": 559,
        "experience": 2880191400
    },
    {
        "level": 560,
        "experience": 2895731800
    },
    {
        "level": 561,
        "experience": 2911328000
    },
    {
        "level": 562,
        "experience": 2926980100
    },
    {
        "level": 563,
        "experience": 2942688200
    },
    {
        "level": 564,
        "experience": 2958452400
    },
    {
        "level": 565,
        "experience": 2974272800
    },
    {
        "level": 566,
        "experience": 2990149500
    },
    {
        "level": 567,
        "experience": 3006082600
    },
    {
        "level": 568,
        "experience": 3022072200
    },
    {
        "level": 569,
        "experience": 3038118400
    },
    {
        "level": 570,
        "experience": 3054221300
    },
    {
        "level": 571,
        "experience": 3070381000
    },
    {
        "level": 572,
        "experience": 3086597600
    },
    {
        "level": 573,
        "experience": 3102871200
    },
    {
        "level": 574,
        "experience": 3119201900
    },
    {
        "level": 575,
        "experience": 3135589800
    },
    {
        "level": 576,
        "experience": 3152035000
    },
    {
        "level": 577,
        "experience": 3168537600
    },
    {
        "level": 578,
        "experience": 3185097700
    },
    {
        "level": 579,
        "experience": 3201715400
    },
    {
        "level": 580,
        "experience": 3218390800
    },
    {
        "level": 581,
        "experience": 3235124000
    },
    {
        "level": 582,
        "experience": 3251915100
    },
    {
        "level": 583,
        "experience": 3268764200
    },
    {
        "level": 584,
        "experience": 3285671400
    },
    {
        "level": 585,
        "experience": 3302636800
    },
    {
        "level": 586,
        "experience": 3319660500
    },
    {
        "level": 587,
        "experience": 3336742600
    },
    {
        "level": 588,
        "experience": 3353883200
    },
    {
        "level": 589,
        "experience": 3371082400
    },
    {
        "level": 590,
        "experience": 3388340300
    },
    {
        "level": 591,
        "experience": 3405657000
    },
    {
        "level": 592,
        "experience": 3423032600
    },
    {
        "level": 593,
        "experience": 3440467200
    },
    {
        "level": 594,
        "experience": 3457960900
    },
    {
        "level": 595,
        "experience": 3475513800
    },
    {
        "level": 596,
        "experience": 3493126000
    },
    {
        "level": 597,
        "experience": 3510797600
    },
    {
        "level": 598,
        "experience": 3528528700
    },
    {
        "level": 599,
        "experience": 3546319400
    },
    {
        "level": 600,
        "experience": 3564169800
    },
    {
        "level": 601,
        "experience": 3582080000
    },
    {
        "level": 602,
        "experience": 3600050100
    },
    {
        "level": 603,
        "experience": 3618080200
    },
    {
        "level": 604,
        "experience": 3636170400
    },
    {
        "level": 605,
        "experience": 3654320800
    },
    {
        "level": 606,
        "experience": 3672531500
    },
    {
        "level": 607,
        "experience": 3690802600
    },
    {
        "level": 608,
        "experience": 3709134200
    },
    {
        "level": 609,
        "experience": 3727526400
    },
    {
        "level": 610,
        "experience": 3745979300
    },
    {
        "level": 611,
        "experience": 3764493000
    },
    {
        "level": 612,
        "experience": 3783067600
    },
    {
        "level": 613,
        "experience": 3801703200
    },
    {
        "level": 614,
        "experience": 3820399900
    },
    {
        "level": 615,
        "experience": 3839157800
    },
    {
        "level": 616,
        "experience": 3857977000
    },
    {
        "level": 617,
        "experience": 3876857600
    },
    {
        "level": 618,
        "experience": 3895799700
    },
    {
        "level": 619,
        "experience": 3914803400
    },
    {
        "level": 620,
        "experience": 3933868800
    },
    {
        "level": 621,
        "experience": 3952996000
    },
    {
        "level": 622,
        "experience": 3972185100
    },
    {
        "level": 623,
        "experience": 3991436200
    },
    {
        "level": 624,
        "experience": 4010749400
    },
    {
        "level": 625,
        "experience": 4030124800
    },
    {
        "level": 626,
        "experience": 4049562500
    },
    {
        "level": 627,
        "experience": 4069062600
    },
    {
        "level": 628,
        "experience": 4088625200
    },
    {
        "level": 629,
        "experience": 4108250400
    },
    {
        "level": 630,
        "experience": 4127938300
    },
    {
        "level": 631,
        "experience": 4147689000
    },
    {
        "level": 632,
        "experience": 4167502600
    },
    {
        "level": 633,
        "experience": 4187379200
    },
    {
        "level": 634,
        "experience": 4207318900
    },
    {
        "level": 635,
        "experience": 4227321800
    },
    {
        "level": 636,
        "experience": 4247388000
    },
    {
        "level": 637,
        "experience": 4267517600
    },
    {
        "level": 638,
        "experience": 4287710700
    },
    {
        "level": 639,
        "experience": 4307967400
    },
    {
        "level": 640,
        "experience": 4328287800
    },
    {
        "level": 641,
        "experience": 4348672000
    },
    {
        "level": 642,
        "experience": 4369120100
    },
    {
        "level": 643,
        "experience": 4389632200
    },
    {
        "level": 644,
        "experience": 4410208400
    },
    {
        "level": 645,
        "experience": 4430848800
    },
    {
        "level": 646,
        "experience": 4451553500
    },
    {
        "level": 647,
        "experience": 4472322600
    },
    {
        "level": 648,
        "experience": 4493156200
    },
    {
        "level": 649,
        "experience": 4514054400
    },
    {
        "level": 650,
        "experience": 4535017300
    },
    {
        "level": 651,
        "experience": 4556045000
    },
    {
        "level": 652,
        "experience": 4577137600
    },
    {
        "level": 653,
        "experience": 4598295200
    },
    {
        "level": 654,
        "experience": 4619517900
    },
    {
        "level": 655,
        "experience": 4640805800
    },
    {
        "level": 656,
        "experience": 4662159000
    },
    {
        "level": 657,
        "experience": 4683577600
    },
    {
        "level": 658,
        "experience": 4705061700
    },
    {
        "level": 659,
        "experience": 4726611400
    },
    {
        "level": 660,
        "experience": 4748226800
    },
    {
        "level": 661,
        "experience": 4769908000
    },
    {
        "level": 662,
        "experience": 4791655100
    },
    {
        "level": 663,
        "experience": 4813468200
    },
    {
        "level": 664,
        "experience": 4835347400
    },
    {
        "level": 665,
        "experience": 4857292800
    },
    {
        "level": 666,
        "experience": 4879304500
    },
    {
        "level": 667,
        "experience": 4901382600
    },
    {
        "level": 668,
        "experience": 4923527200
    },
    {
        "level": 669,
        "experience": 4945738400
    },
    {
        "level": 670,
        "experience": 4968016300
    },
    {
        "level": 671,
        "experience": 4990361000
    },
    {
        "level": 672,
        "experience": 5012772600
    },
    {
        "level": 673,
        "experience": 5035251200
    },
    {
        "level": 674,
        "experience": 5057796900
    },
    {
        "level": 675,
        "experience": 5080409800
    },
    {
        "level": 676,
        "experience": 5103090000
    },
    {
        "level": 677,
        "experience": 5125837600
    },
    {
        "level": 678,
        "experience": 5148652700
    },
    {
        "level": 679,
        "experience": 5171535400
    },
    {
        "level": 680,
        "experience": 5194485800
    },
    {
        "level": 681,
        "experience": 5217504000
    },
    {
        "level": 682,
        "experience": 5240590100
    },
    {
        "level": 683,
        "experience": 5263744200
    },
    {
        "level": 684,
        "experience": 5286966400
    },
    {
        "level": 685,
        "experience": 5310256800
    },
    {
        "level": 686,
        "experience": 5333615500
    },
    {
        "level": 687,
        "experience": 5357042600
    },
    {
        "level": 688,
        "experience": 5380538200
    },
    {
        "level": 689,
        "experience": 5404102400
    },
    {
        "level": 690,
        "experience": 5427735300
    },
    {
        "level": 691,
        "experience": 5451437000
    },
    {
        "level": 692,
        "experience": 5475207600
    },
    {
        "level": 693,
        "experience": 5499047200
    },
    {
        "level": 694,
        "experience": 5522955900
    },
    {
        "level": 695,
        "experience": 5546933800
    },
    {
        "level": 696,
        "experience": 5570981000
    },
    {
        "level": 697,
        "experience": 5595097600
    },
    {
        "level": 698,
        "experience": 5619283700
    },
    {
        "level": 699,
        "experience": 5643539400
    },
    {
        "level": 700,
        "experience": 5667864800
    },
    {
        "level": 701,
        "experience": 5692260000
    },
    {
        "level": 702,
        "experience": 5716725100
    },
    {
        "level": 703,
        "experience": 5741260200
    },
    {
        "level": 704,
        "experience": 5765865400
    },
    {
        "level": 705,
        "experience": 5790540800
    },
    {
        "level": 706,
        "experience": 5815286500
    },
    {
        "level": 707,
        "experience": 5840102600
    },
    {
        "level": 708,
        "experience": 5864989200
    },
    {
        "level": 709,
        "experience": 5889946400
    },
    {
        "level": 710,
        "experience": 5914974300
    },
    {
        "level": 711,
        "experience": 5940073000
    },
    {
        "level": 712,
        "experience": 5965242600
    },
    {
        "level": 713,
        "experience": 5990483200
    },
    {
        "level": 714,
        "experience": 6015794900
    },
    {
        "level": 715,
        "experience": 6041177800
    },
    {
        "level": 716,
        "experience": 6066632000
    },
    {
        "level": 717,
        "experience": 6092157600
    },
    {
        "level": 718,
        "experience": 6117754700
    },
    {
        "level": 719,
        "experience": 6143423400
    },
    {
        "level": 720,
        "experience": 6169163800
    },
    {
        "level": 721,
        "experience": 6194976000
    },
    {
        "level": 722,
        "experience": 6220860100
    },
    {
        "level": 723,
        "experience": 6246816200
    },
    {
        "level": 724,
        "experience": 6272844400
    },
    {
        "level": 725,
        "experience": 6298944800
    },
    {
        "level": 726,
        "experience": 6325117500
    },
    {
        "level": 727,
        "experience": 6351362600
    },
    {
        "level": 728,
        "experience": 6377680200
    },
    {
        "level": 729,
        "experience": 6404070400
    },
    {
        "level": 730,
        "experience": 6430533300
    },
    {
        "level": 731,
        "experience": 6457069000
    },
    {
        "level": 732,
        "experience": 6483677600
    },
    {
        "level": 733,
        "experience": 6510359200
    },
    {
        "level": 734,
        "experience": 6537113900
    },
    {
        "level": 735,
        "experience": 6563941800
    },
    {
        "level": 736,
        "experience": 6590843000
    },
    {
        "level": 737,
        "experience": 6617817600
    },
    {
        "level": 738,
        "experience": 6644865700
    },
    {
        "level": 739,
        "experience": 6671987400
    },
    {
        "level": 740,
        "experience": 6699182800
    },
    {
        "level": 741,
        "experience": 6726452000
    },
    {
        "level": 742,
        "experience": 6753795100
    },
    {
        "level": 743,
        "experience": 6781212200
    },
    {
        "level": 744,
        "experience": 6808703400
    },
    {
        "level": 745,
        "experience": 6836268800
    },
    {
        "level": 746,
        "experience": 6863908500
    },
    {
        "level": 747,
        "experience": 6891622600
    },
    {
        "level": 748,
        "experience": 6919411200
    },
    {
        "level": 749,
        "experience": 6947274400
    },
    {
        "level": 750,
        "experience": 6975212300
    },
    {
        "level": 751,
        "experience": 7003225000
    },
    {
        "level": 752,
        "experience": 7031312600
    },
    {
        "level": 753,
        "experience": 7059475200
    },
    {
        "level": 754,
        "experience": 7087712900
    },
    {
        "level": 755,
        "experience": 7116025800
    },
    {
        "level": 756,
        "experience": 7144414000
    },
    {
        "level": 757,
        "experience": 7172877600
    },
    {
        "level": 758,
        "experience": 7201416700
    },
    {
        "level": 759,
        "experience": 7230031400
    },
    {
        "level": 760,
        "experience": 7258721800
    },
    {
        "level": 761,
        "experience": 7287488000
    },
    {
        "level": 762,
        "experience": 7316330100
    },
    {
        "level": 763,
        "experience": 7345248200
    },
    {
        "level": 764,
        "experience": 7374242400
    },
    {
        "level": 765,
        "experience": 7403312800
    },
    {
        "level": 766,
        "experience": 7432459500
    },
    {
        "level": 767,
        "experience": 7461682600
    },
    {
        "level": 768,
        "experience": 7490982200
    },
    {
        "level": 769,
        "experience": 7520358400
    },
    {
        "level": 770,
        "experience": 7549811300
    },
    {
        "level": 771,
        "experience": 7579341000
    },
    {
        "level": 772,
        "experience": 7608947600
    },
    {
        "level": 773,
        "experience": 7638631200
    },
    {
        "level": 774,
        "experience": 7668391900
    },
    {
        "level": 775,
        "experience": 7698229800
    },
    {
        "level": 776,
        "experience": 7728145000
    },
    {
        "level": 777,
        "experience": 7758137600
    },
    {
        "level": 778,
        "experience": 7788207700
    },
    {
        "level": 779,
        "experience": 7818355400
    },
    {
        "level": 780,
        "experience": 7848580800
    },
    {
        "level": 781,
        "experience": 7878884000
    },
    {
        "level": 782,
        "experience": 7909265100
    },
    {
        "level": 783,
        "experience": 7939724200
    },
    {
        "level": 784,
        "experience": 7970261400
    },
    {
        "level": 785,
        "experience": 8000876800
    },
    {
        "level": 786,
        "experience": 8031570500
    },
    {
        "level": 787,
        "experience": 8062342600
    },
    {
        "level": 788,
        "experience": 8093193200
    },
    {
        "level": 789,
        "experience": 8124122400
    },
    {
        "level": 790,
        "experience": 8155130300
    },
    {
        "level": 791,
        "experience": 8186217000
    },
    {
        "level": 792,
        "experience": 8217382600
    },
    {
        "level": 793,
        "experience": 8248627200
    },
    {
        "level": 794,
        "experience": 8279950900
    },
    {
        "level": 795,
        "experience": 8311353800
    },
    {
        "level": 796,
        "experience": 8342836000
    },
    {
        "level": 797,
        "experience": 8374397600
    },
    {
        "level": 798,
        "experience": 8406038700
    },
    {
        "level": 799,
        "experience": 8437759400
    },
    {
        "level": 800,
        "experience": 8469559800
    },
    {
        "level": 801,
        "experience": 8501440000
    },
    {
        "level": 802,
        "experience": 8533400100
    },
    {
        "level": 803,
        "experience": 8565440200
    },
    {
        "level": 804,
        "experience": 8597560400
    },
    {
        "level": 805,
        "experience": 8629760800
    },
    {
        "level": 806,
        "experience": 8662041500
    },
    {
        "level": 807,
        "experience": 8694402600
    },
    {
        "level": 808,
        "experience": 8726844200
    },
    {
        "level": 809,
        "experience": 8759366400
    },
    {
        "level": 810,
        "experience": 8791969300
    },
    {
        "level": 811,
        "experience": 8824653000
    },
    {
        "level": 812,
        "experience": 8857417600
    },
    {
        "level": 813,
        "experience": 8890263200
    },
    {
        "level": 814,
        "experience": 8923189900
    },
    {
        "level": 815,
        "experience": 8956197800
    },
    {
        "level": 816,
        "experience": 8989287000
    },
    {
        "level": 817,
        "experience": 9022457600
    },
    {
        "level": 818,
        "experience": 9055709700
    },
    {
        "level": 819,
        "experience": 9089043400
    },
    {
        "level": 820,
        "experience": 9122458800
    },
    {
        "level": 821,
        "experience": 9155956000
    },
    {
        "level": 822,
        "experience": 9189535100
    },
    {
        "level": 823,
        "experience": 9223196200
    },
    {
        "level": 824,
        "experience": 9256939400
    },
    {
        "level": 825,
        "experience": 9290764800
    },
    {
        "level": 826,
        "experience": 9324672500
    },
    {
        "level": 827,
        "experience": 9358662600
    },
    {
        "level": 828,
        "experience": 9392735200
    },
    {
        "level": 829,
        "experience": 9426890400
    },
    {
        "level": 830,
        "experience": 9461128300
    },
    {
        "level": 831,
        "experience": 9495449000
    },
    {
        "level": 832,
        "experience": 9529852600
    },
    {
        "level": 833,
        "experience": 9564339200
    },
    {
        "level": 834,
        "experience": 9598908900
    },
    {
        "level": 835,
        "experience": 9633561800
    },
    {
        "level": 836,
        "experience": 9668298000
    },
    {
        "level": 837,
        "experience": 9703117600
    },
    {
        "level": 838,
        "experience": 9738020700
    },
    {
        "level": 839,
        "experience": 9773007400
    },
    {
        "level": 840,
        "experience": 9808077800
    },
    {
        "level": 841,
        "experience": 9843232000
    },
    {
        "level": 842,
        "experience": 9878470100
    },
    {
        "level": 843,
        "experience": 9913792200
    },
    {
        "level": 844,
        "experience": 9949198400
    },
    {
        "level": 845,
        "experience": 9984688800
    },
    {
        "level": 846,
        "experience": 10020263500
    },
    {
        "level": 847,
        "experience": 10055922600
    },
    {
        "level": 848,
        "experience": 10091666200
    },
    {
        "level": 849,
        "experience": 10127494400
    },
    {
        "level": 850,
        "experience": 10163407300
    },
    {
        "level": 851,
        "experience": 10199405000
    },
    {
        "level": 852,
        "experience": 10235487600
    },
    {
        "level": 853,
        "experience": 10271655200
    },
    {
        "level": 854,
        "experience": 10307907900
    },
    {
        "level": 855,
        "experience": 10344245800
    },
    {
        "level": 856,
        "experience": 10380669000
    },
    {
        "level": 857,
        "experience": 10417177600
    },
    {
        "level": 858,
        "experience": 10453771700
    },
    {
        "level": 859,
        "experience": 10490451400
    },
    {
        "level": 860,
        "experience": 10527216800
    },
    {
        "level": 861,
        "experience": 10564068000
    },
    {
        "level": 862,
        "experience": 10601005100
    },
    {
        "level": 863,
        "experience": 10638028200
    },
    {
        "level": 864,
        "experience": 10675137400
    },
    {
        "level": 865,
        "experience": 10712332800
    },
    {
        "level": 866,
        "experience": 10749614500
    },
    {
        "level": 867,
        "experience": 10786982600
    },
    {
        "level": 868,
        "experience": 10824437200
    },
    {
        "level": 869,
        "experience": 10861978400
    },
    {
        "level": 870,
        "experience": 10899606300
    },
    {
        "level": 871,
        "experience": 10937321000
    },
    {
        "level": 872,
        "experience": 10975122600
    },
    {
        "level": 873,
        "experience": 11013011200
    },
    {
        "level": 874,
        "experience": 11050986900
    },
    {
        "level": 875,
        "experience": 11089049800
    },
    {
        "level": 876,
        "experience": 11127200000
    },
    {
        "level": 877,
        "experience": 11165437600
    },
    {
        "level": 878,
        "experience": 11203762700
    },
    {
        "level": 879,
        "experience": 11242175400
    },
    {
        "level": 880,
        "experience": 11280675800
    },
    {
        "level": 881,
        "experience": 11319264000
    },
    {
        "level": 882,
        "experience": 11357940100
    },
    {
        "level": 883,
        "experience": 11396704200
    },
    {
        "level": 884,
        "experience": 11435556400
    },
    {
        "level": 885,
        "experience": 11474496800
    },
    {
        "level": 886,
        "experience": 11513525500
    },
    {
        "level": 887,
        "experience": 11552642600
    },
    {
        "level": 888,
        "experience": 11591848200
    },
    {
        "level": 889,
        "experience": 11631142400
    },
    {
        "level": 890,
        "experience": 11670525300
    },
    {
        "level": 891,
        "experience": 11709997000
    },
    {
        "level": 892,
        "experience": 11749557600
    },
    {
        "level": 893,
        "experience": 11789207200
    },
    {
        "level": 894,
        "experience": 11828945900
    },
    {
        "level": 895,
        "experience": 11868773800
    },
    {
        "level": 896,
        "experience": 11908691000
    },
    {
        "level": 897,
        "experience": 11948697600
    },
    {
        "level": 898,
        "experience": 11988793700
    },
    {
        "level": 899,
        "experience": 12028979400
    },
    {
        "level": 900,
        "experience": 12069254800
    },
    {
        "level": 901,
        "experience": 12109620000
    },
    {
        "level": 902,
        "experience": 12150075100
    },
    {
        "level": 903,
        "experience": 12190620200
    },
    {
        "level": 904,
        "experience": 12231255400
    },
    {
        "level": 905,
        "experience": 12271980800
    },
    {
        "level": 906,
        "experience": 12312796500
    },
    {
        "level": 907,
        "experience": 12353702600
    },
    {
        "level": 908,
        "experience": 12394699200
    },
    {
        "level": 909,
        "experience": 12435786400
    },
    {
        "level": 910,
        "experience": 12476964300
    },
    {
        "level": 911,
        "experience": 12518233000
    },
    {
        "level": 912,
        "experience": 12559592600
    },
    {
        "level": 913,
        "experience": 12601043200
    },
    {
        "level": 914,
        "experience": 12642584900
    },
    {
        "level": 915,
        "experience": 12684217800
    },
    {
        "level": 916,
        "experience": 12725942000
    },
    {
        "level": 917,
        "experience": 12767757600
    },
    {
        "level": 918,
        "experience": 12809664700
    },
    {
        "level": 919,
        "experience": 12851663400
    },
    {
        "level": 920,
        "experience": 12893753800
    },
    {
        "level": 921,
        "experience": 12935936000
    },
    {
        "level": 922,
        "experience": 12978210100
    },
    {
        "level": 923,
        "experience": 13020576200
    },
    {
        "level": 924,
        "experience": 13063034400
    },
    {
        "level": 925,
        "experience": 13105584800
    },
    {
        "level": 926,
        "experience": 13148227500
    },
    {
        "level": 927,
        "experience": 13190962600
    },
    {
        "level": 928,
        "experience": 13233790200
    },
    {
        "level": 929,
        "experience": 13276710400
    },
    {
        "level": 930,
        "experience": 13319723300
    },
    {
        "level": 931,
        "experience": 13362829000
    },
    {
        "level": 932,
        "experience": 13406027600
    },
    {
        "level": 933,
        "experience": 13449319200
    },
    {
        "level": 934,
        "experience": 13492703900
    },
    {
        "level": 935,
        "experience": 13536181800
    },
    {
        "level": 936,
        "experience": 13579753000
    },
    {
        "level": 937,
        "experience": 13623417600
    },
    {
        "level": 938,
        "experience": 13667175700
    },
    {
        "level": 939,
        "experience": 13711027400
    },
    {
        "level": 940,
        "experience": 13754972800
    },
    {
        "level": 941,
        "experience": 13799012000
    },
    {
        "level": 942,
        "experience": 13843145100
    },
    {
        "level": 943,
        "experience": 13887372200
    },
    {
        "level": 944,
        "experience": 13931693400
    },
    {
        "level": 945,
        "experience": 13976108800
    },
    {
        "level": 946,
        "experience": 14020618500
    },
    {
        "level": 947,
        "experience": 14065222600
    },
    {
        "level": 948,
        "experience": 14109921200
    },
    {
        "level": 949,
        "experience": 14154714400
    },
    {
        "level": 950,
        "experience": 14199602300
    },
    {
        "level": 951,
        "experience": 14244585000
    },
    {
        "level": 952,
        "experience": 14289662600
    },
    {
        "level": 953,
        "experience": 14334835200
    },
    {
        "level": 954,
        "experience": 14380102900
    },
    {
        "level": 955,
        "experience": 14425465800
    },
    {
        "level": 956,
        "experience": 14470924000
    },
    {
        "level": 957,
        "experience": 14516477600
    },
    {
        "level": 958,
        "experience": 14562126700
    },
    {
        "level": 959,
        "experience": 14607871400
    },
    {
        "level": 960,
        "experience": 14653711800
    },
    {
        "level": 961,
        "experience": 14699648000
    },
    {
        "level": 962,
        "experience": 14745680100
    },
    {
        "level": 963,
        "experience": 14791808200
    },
    {
        "level": 964,
        "experience": 14838032400
    },
    {
        "level": 965,
        "experience": 14884352800
    },
    {
        "level": 966,
        "experience": 14930769500
    },
    {
        "level": 967,
        "experience": 14977282600
    },
    {
        "level": 968,
        "experience": 15023892200
    },
    {
        "level": 969,
        "experience": 15070598400
    },
    {
        "level": 970,
        "experience": 15117401300
    },
    {
        "level": 971,
        "experience": 15164301000
    },
    {
        "level": 972,
        "experience": 15211297600
    },
    {
        "level": 973,
        "experience": 15258391200
    },
    {
        "level": 974,
        "experience": 15305581900
    },
    {
        "level": 975,
        "experience": 15352869800
    },
    {
        "level": 976,
        "experience": 15400255000
    },
    {
        "level": 977,
        "experience": 15447737600
    },
    {
        "level": 978,
        "experience": 15495317700
    },
    {
        "level": 979,
        "experience": 15542995400
    },
    {
        "level": 980,
        "experience": 15590770800
    },
    {
        "level": 981,
        "experience": 15638644000
    },
    {
        "level": 982,
        "experience": 15686615100
    },
    {
        "level": 983,
        "experience": 15734684200
    },
    {
        "level": 984,
        "experience": 15782851400
    },
    {
        "level": 985,
        "experience": 15831116800
    },
    {
        "level": 986,
        "experience": 15879480500
    },
    {
        "level": 987,
        "experience": 15927942600
    },
    {
        "level": 988,
        "experience": 15976503200
    },
    {
        "level": 989,
        "experience": 16025162400
    },
    {
        "level": 990,
        "experience": 16073920300
    },
    {
        "level": 991,
        "experience": 16122777000
    },
    {
        "level": 992,
        "experience": 16171732600
    },
    {
        "level": 993,
        "experience": 16220787200
    },
    {
        "level": 994,
        "experience": 16269940900
    },
    {
        "level": 995,
        "experience": 16319193800
    },
    {
        "level": 996,
        "experience": 16368546000
    },
    {
        "level": 997,
        "experience": 16417997600
    },
    {
        "level": 998,
        "experience": 16467548700
    },
    {
        "level": 999,
        "experience": 16517199400
    },
    {
        "level": 1000,
        "experience": 16566949800
    },
    {
        "level": 1001,
        "experience": 16616800000
    },
    {
        "level": 1002,
        "experience": 16666750100
    },
    {
        "level": 1003,
        "experience": 16716800200
    },
    {
        "level": 1004,
        "experience": 16766950400
    },
    {
        "level": 1005,
        "experience": 16817200800
    },
    {
        "level": 1006,
        "experience": 16867551500
    },
    {
        "level": 1007,
        "experience": 16918002600
    },
    {
        "level": 1008,
        "experience": 16968554200
    },
    {
        "level": 1009,
        "experience": 17019206400
    },
    {
        "level": 1010,
        "experience": 17069959300
    },
    {
        "level": 1011,
        "experience": 17120813000
    },
    {
        "level": 1012,
        "experience": 17171767600
    },
    {
        "level": 1013,
        "experience": 17222823200
    },
    {
        "level": 1014,
        "experience": 17273979900
    },
    {
        "level": 1015,
        "experience": 17325237800
    },
    {
        "level": 1016,
        "experience": 17376597000
    },
    {
        "level": 1017,
        "experience": 17428057600
    },
    {
        "level": 1018,
        "experience": 17479619700
    },
    {
        "level": 1019,
        "experience": 17531283400
    },
    {
        "level": 1020,
        "experience": 17583048800
    },
    {
        "level": 1021,
        "experience": 17634916000
    },
    {
        "level": 1022,
        "experience": 17686885100
    },
    {
        "level": 1023,
        "experience": 17738956200
    },
    {
        "level": 1024,
        "experience": 17791129400
    },
    {
        "level": 1025,
        "experience": 17843404800
    },
    {
        "level": 1026,
        "experience": 17895782500
    },
    {
        "level": 1027,
        "experience": 17948262600
    },
    {
        "level": 1028,
        "experience": 18000845200
    },
    {
        "level": 1029,
        "experience": 18053530400
    },
    {
        "level": 1030,
        "experience": 18106318300
    },
    {
        "level": 1031,
        "experience": 18159209000
    },
    {
        "level": 1032,
        "experience": 18212202600
    },
    {
        "level": 1033,
        "experience": 18265299200
    },
    {
        "level": 1034,
        "experience": 18318498900
    },
    {
        "level": 1035,
        "experience": 18371801800
    },
    {
        "level": 1036,
        "experience": 18425208000
    },
    {
        "level": 1037,
        "experience": 18478717600
    },
    {
        "level": 1038,
        "experience": 18532330700
    },
    {
        "level": 1039,
        "experience": 18586047400
    },
    {
        "level": 1040,
        "experience": 18639867800
    },
    {
        "level": 1041,
        "experience": 18693792000
    },
    {
        "level": 1042,
        "experience": 18747820100
    },
    {
        "level": 1043,
        "experience": 18801952200
    },
    {
        "level": 1044,
        "experience": 18856188400
    },
    {
        "level": 1045,
        "experience": 18910528800
    },
    {
        "level": 1046,
        "experience": 18964973500
    },
    {
        "level": 1047,
        "experience": 19019522600
    },
    {
        "level": 1048,
        "experience": 19074176200
    },
    {
        "level": 1049,
        "experience": 19128934400
    },
    {
        "level": 1050,
        "experience": 19183797300
    },
    {
        "level": 1051,
        "experience": 19238765000
    },
    {
        "level": 1052,
        "experience": 19293837600
    },
    {
        "level": 1053,
        "experience": 19349015200
    },
    {
        "level": 1054,
        "experience": 19404297900
    },
    {
        "level": 1055,
        "experience": 19459685800
    },
    {
        "level": 1056,
        "experience": 19515179000
    },
    {
        "level": 1057,
        "experience": 19570777600
    },
    {
        "level": 1058,
        "experience": 19626481700
    },
    {
        "level": 1059,
        "experience": 19682291400
    },
    {
        "level": 1060,
        "experience": 19738206800
    },
    {
        "level": 1061,
        "experience": 19794228000
    },
    {
        "level": 1062,
        "experience": 19850355100
    },
    {
        "level": 1063,
        "experience": 19906588200
    },
    {
        "level": 1064,
        "experience": 19962927400
    },
    {
        "level": 1065,
        "experience": 20019372800
    },
    {
        "level": 1066,
        "experience": 20075924500
    },
    {
        "level": 1067,
        "experience": 20132582600
    },
    {
        "level": 1068,
        "experience": 20189347200
    },
    {
        "level": 1069,
        "experience": 20246218400
    },
    {
        "level": 1070,
        "experience": 20303196300
    },
    {
        "level": 1071,
        "experience": 20360281000
    },
    {
        "level": 1072,
        "experience": 20417472600
    },
    {
        "level": 1073,
        "experience": 20474771200
    },
    {
        "level": 1074,
        "experience": 20532176900
    },
    {
        "level": 1075,
        "experience": 20589689800
    },
    {
        "level": 1076,
        "experience": 20647310000
    },
    {
        "level": 1077,
        "experience": 20705037600
    },
    {
        "level": 1078,
        "experience": 20762872700
    },
    {
        "level": 1079,
        "experience": 20820815400
    },
    {
        "level": 1080,
        "experience": 20878865800
    },
    {
        "level": 1081,
        "experience": 20937024000
    },
    {
        "level": 1082,
        "experience": 20995290100
    },
    {
        "level": 1083,
        "experience": 21053664200
    },
    {
        "level": 1084,
        "experience": 21112146400
    },
    {
        "level": 1085,
        "experience": 21170736800
    },
    {
        "level": 1086,
        "experience": 21229435500
    },
    {
        "level": 1087,
        "experience": 21288242600
    },
    {
        "level": 1088,
        "experience": 21347158200
    },
    {
        "level": 1089,
        "experience": 21406182400
    },
    {
        "level": 1090,
        "experience": 21465315300
    },
    {
        "level": 1091,
        "experience": 21524557000
    },
    {
        "level": 1092,
        "experience": 21583907600
    },
    {
        "level": 1093,
        "experience": 21643367200
    },
    {
        "level": 1094,
        "experience": 21702935900
    },
    {
        "level": 1095,
        "experience": 21762613800
    },
    {
        "level": 1096,
        "experience": 21822401000
    },
    {
        "level": 1097,
        "experience": 21882297600
    },
    {
        "level": 1098,
        "experience": 21942303700
    },
    {
        "level": 1099,
        "experience": 22002419400
    },
    {
        "level": 1100,
        "experience": 22062644800
    },
    {
        "level": 1101,
        "experience": 22122980000
    },
    {
        "level": 1102,
        "experience": 22183425100
    },
    {
        "level": 1103,
        "experience": 22243980200
    },
    {
        "level": 1104,
        "experience": 22304645400
    },
    {
        "level": 1105,
        "experience": 22365420800
    },
    {
        "level": 1106,
        "experience": 22426306500
    },
    {
        "level": 1107,
        "experience": 22487302600
    },
    {
        "level": 1108,
        "experience": 22548409200
    },
    {
        "level": 1109,
        "experience": 22609626400
    },
    {
        "level": 1110,
        "experience": 22670954300
    },
    {
        "level": 1111,
        "experience": 22732393000
    },
    {
        "level": 1112,
        "experience": 22793942600
    },
    {
        "level": 1113,
        "experience": 22855603200
    },
    {
        "level": 1114,
        "experience": 22917374900
    },
    {
        "level": 1115,
        "experience": 22979257800
    },
    {
        "level": 1116,
        "experience": 23041252000
    },
    {
        "level": 1117,
        "experience": 23103357600
    },
    {
        "level": 1118,
        "experience": 23165574700
    },
    {
        "level": 1119,
        "experience": 23227903400
    },
    {
        "level": 1120,
        "experience": 23290343800
    },
    {
        "level": 1121,
        "experience": 23352896000
    },
    {
        "level": 1122,
        "experience": 23415560100
    },
    {
        "level": 1123,
        "experience": 23478336200
    },
    {
        "level": 1124,
        "experience": 23541224400
    },
    {
        "level": 1125,
        "experience": 23604224800
    },
    {
        "level": 1126,
        "experience": 23667337500
    },
    {
        "level": 1127,
        "experience": 23730562600
    },
    {
        "level": 1128,
        "experience": 23793900200
    },
    {
        "level": 1129,
        "experience": 23857350400
    },
    {
        "level": 1130,
        "experience": 23920913300
    },
    {
        "level": 1131,
        "experience": 23984589000
    },
    {
        "level": 1132,
        "experience": 24048377600
    },
    {
        "level": 1133,
        "experience": 24112279200
    },
    {
        "level": 1134,
        "experience": 24176293900
    },
    {
        "level": 1135,
        "experience": 24240421800
    },
    {
        "level": 1136,
        "experience": 24304663000
    },
    {
        "level": 1137,
        "experience": 24369017600
    },
    {
        "level": 1138,
        "experience": 24433485700
    },
    {
        "level": 1139,
        "experience": 24498067400
    },
    {
        "level": 1140,
        "experience": 24562762800
    },
    {
        "level": 1141,
        "experience": 24627572000
    },
    {
        "level": 1142,
        "experience": 24692495100
    },
    {
        "level": 1143,
        "experience": 24757532200
    },
    {
        "level": 1144,
        "experience": 24822683400
    },
    {
        "level": 1145,
        "experience": 24887948800
    },
    {
        "level": 1146,
        "experience": 24953328500
    },
    {
        "level": 1147,
        "experience": 25018822600
    },
    {
        "level": 1148,
        "experience": 25084431200
    },
    {
        "level": 1149,
        "experience": 25150154400
    },
    {
        "level": 1150,
        "experience": 25215992300
    },
    {
        "level": 1151,
        "experience": 25281945000
    },
    {
        "level": 1152,
        "experience": 25348012600
    },
    {
        "level": 1153,
        "experience": 25414195200
    },
    {
        "level": 1154,
        "experience": 25480492900
    },
    {
        "level": 1155,
        "experience": 25546905800
    },
    {
        "level": 1156,
        "experience": 25613434000
    },
    {
        "level": 1157,
        "experience": 25680077600
    },
    {
        "level": 1158,
        "experience": 25746836700
    },
    {
        "level": 1159,
        "experience": 25813711400
    },
    {
        "level": 1160,
        "experience": 25880701800
    },
    {
        "level": 1161,
        "experience": 25947808000
    },
    {
        "level": 1162,
        "experience": 26015030100
    },
    {
        "level": 1163,
        "experience": 26082368200
    },
    {
        "level": 1164,
        "experience": 26149822400
    },
    {
        "level": 1165,
        "experience": 26217392800
    },
    {
        "level": 1166,
        "experience": 26285079500
    },
    {
        "level": 1167,
        "experience": 26352882600
    },
    {
        "level": 1168,
        "experience": 26420802200
    },
    {
        "level": 1169,
        "experience": 26488838400
    },
    {
        "level": 1170,
        "experience": 26556991300
    },
    {
        "level": 1171,
        "experience": 26625261000
    },
    {
        "level": 1172,
        "experience": 26693647600
    },
    {
        "level": 1173,
        "experience": 26762151200
    },
    {
        "level": 1174,
        "experience": 26830771900
    },
    {
        "level": 1175,
        "experience": 26899509800
    },
    {
        "level": 1176,
        "experience": 26968365000
    },
    {
        "level": 1177,
        "experience": 27037337600
    },
    {
        "level": 1178,
        "experience": 27106427700
    },
    {
        "level": 1179,
        "experience": 27175635400
    },
    {
        "level": 1180,
        "experience": 27244960800
    },
    {
        "level": 1181,
        "experience": 27314404000
    },
    {
        "level": 1182,
        "experience": 27383965100
    },
    {
        "level": 1183,
        "experience": 27453644200
    },
    {
        "level": 1184,
        "experience": 27523441400
    },
    {
        "level": 1185,
        "experience": 27593356800
    },
    {
        "level": 1186,
        "experience": 27663390500
    },
    {
        "level": 1187,
        "experience": 27733542600
    },
    {
        "level": 1188,
        "experience": 27803813200
    },
    {
        "level": 1189,
        "experience": 27874202400
    },
    {
        "level": 1190,
        "experience": 27944710300
    },
    {
        "level": 1191,
        "experience": 28015337000
    },
    {
        "level": 1192,
        "experience": 28086082600
    },
    {
        "level": 1193,
        "experience": 28156947200
    },
    {
        "level": 1194,
        "experience": 28227930900
    },
    {
        "level": 1195,
        "experience": 28299033800
    },
    {
        "level": 1196,
        "experience": 28370256000
    },
    {
        "level": 1197,
        "experience": 28441597600
    },
    {
        "level": 1198,
        "experience": 28513058700
    },
    {
        "level": 1199,
        "experience": 28584639400
    },
    {
        "level": 1200,
        "experience": 28656339800
    },
    {
        "level": 1201,
        "experience": 28728160000
    },
    {
        "level": 1202,
        "experience": 28800100100
    },
    {
        "level": 1203,
        "experience": 28872160200
    },
    {
        "level": 1204,
        "experience": 28944340400
    },
    {
        "level": 1205,
        "experience": 29016640800
    },
    {
        "level": 1206,
        "experience": 29089061500
    },
    {
        "level": 1207,
        "experience": 29161602600
    },
    {
        "level": 1208,
        "experience": 29234264200
    },
    {
        "level": 1209,
        "experience": 29307046400
    },
    {
        "level": 1210,
        "experience": 29379949300
    },
    {
        "level": 1211,
        "experience": 29452973000
    },
    {
        "level": 1212,
        "experience": 29526117600
    },
    {
        "level": 1213,
        "experience": 29599383200
    },
    {
        "level": 1214,
        "experience": 29672769900
    },
    {
        "level": 1215,
        "experience": 29746277800
    },
    {
        "level": 1216,
        "experience": 29819907000
    },
    {
        "level": 1217,
        "experience": 29893657600
    },
    {
        "level": 1218,
        "experience": 29967529700
    },
    {
        "level": 1219,
        "experience": 30041523400
    },
    {
        "level": 1220,
        "experience": 30115638800
    },
    {
        "level": 1221,
        "experience": 30189876000
    },
    {
        "level": 1222,
        "experience": 30264235100
    },
    {
        "level": 1223,
        "experience": 30338716200
    },
    {
        "level": 1224,
        "experience": 30413319400
    },
    {
        "level": 1225,
        "experience": 30488044800
    },
    {
        "level": 1226,
        "experience": 30562892500
    },
    {
        "level": 1227,
        "experience": 30637862600
    },
    {
        "level": 1228,
        "experience": 30712955200
    },
    {
        "level": 1229,
        "experience": 30788170400
    },
    {
        "level": 1230,
        "experience": 30863508300
    },
    {
        "level": 1231,
        "experience": 30938969000
    },
    {
        "level": 1232,
        "experience": 31014552600
    },
    {
        "level": 1233,
        "experience": 31090259200
    },
    {
        "level": 1234,
        "experience": 31166088900
    },
    {
        "level": 1235,
        "experience": 31242041800
    },
    {
        "level": 1236,
        "experience": 31318118000
    },
    {
        "level": 1237,
        "experience": 31394317600
    },
    {
        "level": 1238,
        "experience": 31470640700
    },
    {
        "level": 1239,
        "experience": 31547087400
    },
    {
        "level": 1240,
        "experience": 31623657800
    },
    {
        "level": 1241,
        "experience": 31700352000
    },
    {
        "level": 1242,
        "experience": 31777170100
    },
    {
        "level": 1243,
        "experience": 31854112200
    },
    {
        "level": 1244,
        "experience": 31931178400
    },
    {
        "level": 1245,
        "experience": 32008368800
    },
    {
        "level": 1246,
        "experience": 32085683500
    },
    {
        "level": 1247,
        "experience": 32163122600
    },
    {
        "level": 1248,
        "experience": 32240686200
    },
    {
        "level": 1249,
        "experience": 32318374400
    },
    {
        "level": 1250,
        "experience": 32396187300
    },
    {
        "level": 1251,
        "experience": 32474125000
    },
    {
        "level": 1252,
        "experience": 32552187600
    },
    {
        "level": 1253,
        "experience": 32630375200
    },
    {
        "level": 1254,
        "experience": 32708687900
    },
    {
        "level": 1255,
        "experience": 32787125800
    },
    {
        "level": 1256,
        "experience": 32865689000
    },
    {
        "level": 1257,
        "experience": 32944377600
    },
    {
        "level": 1258,
        "experience": 33023191700
    },
    {
        "level": 1259,
        "experience": 33102131400
    },
    {
        "level": 1260,
        "experience": 33181196800
    },
    {
        "level": 1261,
        "experience": 33260388000
    },
    {
        "level": 1262,
        "experience": 33339705100
    },
    {
        "level": 1263,
        "experience": 33419148200
    },
    {
        "level": 1264,
        "experience": 33498717400
    },
    {
        "level": 1265,
        "experience": 33578412800
    },
    {
        "level": 1266,
        "experience": 33658234500
    },
    {
        "level": 1267,
        "experience": 33738182600
    },
    {
        "level": 1268,
        "experience": 33818257200
    },
    {
        "level": 1269,
        "experience": 33898458400
    },
    {
        "level": 1270,
        "experience": 33978786300
    },
    {
        "level": 1271,
        "experience": 34059241000
    },
    {
        "level": 1272,
        "experience": 34139822600
    },
    {
        "level": 1273,
        "experience": 34220531200
    },
    {
        "level": 1274,
        "experience": 34301366900
    },
    {
        "level": 1275,
        "experience": 34382329800
    },
    {
        "level": 1276,
        "experience": 34463420000
    },
    {
        "level": 1277,
        "experience": 34544637600
    },
    {
        "level": 1278,
        "experience": 34625982700
    },
    {
        "level": 1279,
        "experience": 34707455400
    },
    {
        "level": 1280,
        "experience": 34789055800
    },
    {
        "level": 1281,
        "experience": 34870784000
    },
    {
        "level": 1282,
        "experience": 34952640100
    },
    {
        "level": 1283,
        "experience": 35034624200
    },
    {
        "level": 1284,
        "experience": 35116736400
    },
    {
        "level": 1285,
        "experience": 35198976800
    },
    {
        "level": 1286,
        "experience": 35281345500
    },
    {
        "level": 1287,
        "experience": 35363842600
    },
    {
        "level": 1288,
        "experience": 35446468200
    },
    {
        "level": 1289,
        "experience": 35529222400
    },
    {
        "level": 1290,
        "experience": 35612105300
    },
    {
        "level": 1291,
        "experience": 35695117000
    },
    {
        "level": 1292,
        "experience": 35778257600
    },
    {
        "level": 1293,
        "experience": 35861527200
    },
    {
        "level": 1294,
        "experience": 35944925900
    },
    {
        "level": 1295,
        "experience": 36028453800
    },
    {
        "level": 1296,
        "experience": 36112111000
    },
    {
        "level": 1297,
        "experience": 36195897600
    },
    {
        "level": 1298,
        "experience": 36279813700
    },
    {
        "level": 1299,
        "experience": 36363859400
    },
    {
        "level": 1300,
        "experience": 36448034800
    },
    {
        "level": 1301,
        "experience": 36532340000
    },
    {
        "level": 1302,
        "experience": 36616775100
    },
    {
        "level": 1303,
        "experience": 36701340200
    },
    {
        "level": 1304,
        "experience": 36786035400
    },
    {
        "level": 1305,
        "experience": 36870860800
    },
    {
        "level": 1306,
        "experience": 36955816500
    },
    {
        "level": 1307,
        "experience": 37040902600
    },
    {
        "level": 1308,
        "experience": 37126119200
    },
    {
        "level": 1309,
        "experience": 37211466400
    },
    {
        "level": 1310,
        "experience": 37296944300
    },
    {
        "level": 1311,
        "experience": 37382553000
    },
    {
        "level": 1312,
        "experience": 37468292600
    },
    {
        "level": 1313,
        "experience": 37554163200
    },
    {
        "level": 1314,
        "experience": 37640164900
    },
    {
        "level": 1315,
        "experience": 37726297800
    },
    {
        "level": 1316,
        "experience": 37812562000
    },
    {
        "level": 1317,
        "experience": 37898957600
    },
    {
        "level": 1318,
        "experience": 37985484700
    },
    {
        "level": 1319,
        "experience": 38072143400
    },
    {
        "level": 1320,
        "experience": 38158933800
    },
    {
        "level": 1321,
        "experience": 38245856000
    },
    {
        "level": 1322,
        "experience": 38332910100
    },
    {
        "level": 1323,
        "experience": 38420096200
    },
    {
        "level": 1324,
        "experience": 38507414400
    },
    {
        "level": 1325,
        "experience": 38594864800
    },
    {
        "level": 1326,
        "experience": 38682447500
    },
    {
        "level": 1327,
        "experience": 38770162600
    },
    {
        "level": 1328,
        "experience": 38858010200
    },
    {
        "level": 1329,
        "experience": 38945990400
    },
    {
        "level": 1330,
        "experience": 39034103300
    },
    {
        "level": 1331,
        "experience": 39122349000
    },
    {
        "level": 1332,
        "experience": 39210727600
    },
    {
        "level": 1333,
        "experience": 39299239200
    },
    {
        "level": 1334,
        "experience": 39387883900
    },
    {
        "level": 1335,
        "experience": 39476661800
    },
    {
        "level": 1336,
        "experience": 39565573000
    },
    {
        "level": 1337,
        "experience": 39654617600
    },
    {
        "level": 1338,
        "experience": 39743795700
    },
    {
        "level": 1339,
        "experience": 39833107400
    },
    {
        "level": 1340,
        "experience": 39922552800
    },
    {
        "level": 1341,
        "experience": 40012132000
    },
    {
        "level": 1342,
        "experience": 40101845100
    },
    {
        "level": 1343,
        "experience": 40191692200
    },
    {
        "level": 1344,
        "experience": 40281673400
    },
    {
        "level": 1345,
        "experience": 40371788800
    },
    {
        "level": 1346,
        "experience": 40462038500
    },
    {
        "level": 1347,
        "experience": 40552422600
    },
    {
        "level": 1348,
        "experience": 40642941200
    },
    {
        "level": 1349,
        "experience": 40733594400
    },
    {
        "level": 1350,
        "experience": 40824382300
    },
    {
        "level": 1351,
        "experience": 40915305000
    },
    {
        "level": 1352,
        "experience": 41006362600
    },
    {
        "level": 1353,
        "experience": 41097555200
    },
    {
        "level": 1354,
        "experience": 41188882900
    },
    {
        "level": 1355,
        "experience": 41280345800
    },
    {
        "level": 1356,
        "experience": 41371944000
    },
    {
        "level": 1357,
        "experience": 41463677600
    },
    {
        "level": 1358,
        "experience": 41555546700
    },
    {
        "level": 1359,
        "experience": 41647551400
    },
    {
        "level": 1360,
        "experience": 41739691800
    },
    {
        "level": 1361,
        "experience": 41831968000
    },
    {
        "level": 1362,
        "experience": 41924380100
    },
    {
        "level": 1363,
        "experience": 42016928200
    },
    {
        "level": 1364,
        "experience": 42109612400
    },
    {
        "level": 1365,
        "experience": 42202432800
    },
    {
        "level": 1366,
        "experience": 42295389500
    },
    {
        "level": 1367,
        "experience": 42388482600
    },
    {
        "level": 1368,
        "experience": 42481712200
    },
    {
        "level": 1369,
        "experience": 42575078400
    },
    {
        "level": 1370,
        "experience": 42668581300
    },
    {
        "level": 1371,
        "experience": 42762221000
    },
    {
        "level": 1372,
        "experience": 42855997600
    },
    {
        "level": 1373,
        "experience": 42949911200
    },
    {
        "level": 1374,
        "experience": 43043961900
    },
    {
        "level": 1375,
        "experience": 43138149800
    },
    {
        "level": 1376,
        "experience": 43232475000
    },
    {
        "level": 1377,
        "experience": 43326937600
    },
    {
        "level": 1378,
        "experience": 43421537700
    },
    {
        "level": 1379,
        "experience": 43516275400
    },
    {
        "level": 1380,
        "experience": 43611150800
    },
    {
        "level": 1381,
        "experience": 43706164000
    },
    {
        "level": 1382,
        "experience": 43801315100
    },
    {
        "level": 1383,
        "experience": 43896604200
    },
    {
        "level": 1384,
        "experience": 43992031400
    },
    {
        "level": 1385,
        "experience": 44087596800
    },
    {
        "level": 1386,
        "experience": 44183300500
    },
    {
        "level": 1387,
        "experience": 44279142600
    },
    {
        "level": 1388,
        "experience": 44375123200
    },
    {
        "level": 1389,
        "experience": 44471242400
    },
    {
        "level": 1390,
        "experience": 44567500300
    },
    {
        "level": 1391,
        "experience": 44663897000
    },
    {
        "level": 1392,
        "experience": 44760432600
    },
    {
        "level": 1393,
        "experience": 44857107200
    },
    {
        "level": 1394,
        "experience": 44953920900
    },
    {
        "level": 1395,
        "experience": 45050873800
    },
    {
        "level": 1396,
        "experience": 45147966000
    },
    {
        "level": 1397,
        "experience": 45245197600
    },
    {
        "level": 1398,
        "experience": 45342568700
    },
    {
        "level": 1399,
        "experience": 45440079400
    },
    {
        "level": 1400,
        "experience": 45537729800
    },
    {
        "level": 1401,
        "experience": 45635520000
    },
    {
        "level": 1402,
        "experience": 45733450100
    },
    {
        "level": 1403,
        "experience": 45831520200
    },
    {
        "level": 1404,
        "experience": 45929730400
    },
    {
        "level": 1405,
        "experience": 46028080800
    },
    {
        "level": 1406,
        "experience": 46126571500
    },
    {
        "level": 1407,
        "experience": 46225202600
    },
    {
        "level": 1408,
        "experience": 46323974200
    },
    {
        "level": 1409,
        "experience": 46422886400
    },
    {
        "level": 1410,
        "experience": 46521939300
    },
    {
        "level": 1411,
        "experience": 46621133000
    },
    {
        "level": 1412,
        "experience": 46720467600
    },
    {
        "level": 1413,
        "experience": 46819943200
    },
    {
        "level": 1414,
        "experience": 46919559900
    },
    {
        "level": 1415,
        "experience": 47019317800
    },
    {
        "level": 1416,
        "experience": 47119217000
    },
    {
        "level": 1417,
        "experience": 47219257600
    },
    {
        "level": 1418,
        "experience": 47319439700
    },
    {
        "level": 1419,
        "experience": 47419763400
    },
    {
        "level": 1420,
        "experience": 47520228800
    },
    {
        "level": 1421,
        "experience": 47620836000
    },
    {
        "level": 1422,
        "experience": 47721585100
    },
    {
        "level": 1423,
        "experience": 47822476200
    },
    {
        "level": 1424,
        "experience": 47923509400
    },
    {
        "level": 1425,
        "experience": 48024684800
    },
    {
        "level": 1426,
        "experience": 48126002500
    },
    {
        "level": 1427,
        "experience": 48227462600
    },
    {
        "level": 1428,
        "experience": 48329065200
    },
    {
        "level": 1429,
        "experience": 48430810400
    },
    {
        "level": 1430,
        "experience": 48532698300
    },
    {
        "level": 1431,
        "experience": 48634729000
    },
    {
        "level": 1432,
        "experience": 48736902600
    },
    {
        "level": 1433,
        "experience": 48839219200
    },
    {
        "level": 1434,
        "experience": 48941678900
    },
    {
        "level": 1435,
        "experience": 49044281800
    },
    {
        "level": 1436,
        "experience": 49147028000
    },
    {
        "level": 1437,
        "experience": 49249917600
    },
    {
        "level": 1438,
        "experience": 49352950700
    },
    {
        "level": 1439,
        "experience": 49456127400
    },
    {
        "level": 1440,
        "experience": 49559447800
    },
    {
        "level": 1441,
        "experience": 49662912000
    },
    {
        "level": 1442,
        "experience": 49766520100
    },
    {
        "level": 1443,
        "experience": 49870272200
    },
    {
        "level": 1444,
        "experience": 49974168400
    },
    {
        "level": 1445,
        "experience": 50078208800
    },
    {
        "level": 1446,
        "experience": 50182393500
    },
    {
        "level": 1447,
        "experience": 50286722600
    },
    {
        "level": 1448,
        "experience": 50391196200
    },
    {
        "level": 1449,
        "experience": 50495814400
    },
    {
        "level": 1450,
        "experience": 50600577300
    },
    {
        "level": 1451,
        "experience": 50705485000
    },
    {
        "level": 1452,
        "experience": 50810537600
    },
    {
        "level": 1453,
        "experience": 50915735200
    },
    {
        "level": 1454,
        "experience": 51021077900
    },
    {
        "level": 1455,
        "experience": 51126565800
    },
    {
        "level": 1456,
        "experience": 51232199000
    },
    {
        "level": 1457,
        "experience": 51337977600
    },
    {
        "level": 1458,
        "experience": 51443901700
    },
    {
        "level": 1459,
        "experience": 51549971400
    },
    {
        "level": 1460,
        "experience": 51656186800
    },
    {
        "level": 1461,
        "experience": 51762548000
    },
    {
        "level": 1462,
        "experience": 51869055100
    },
    {
        "level": 1463,
        "experience": 51975708200
    },
    {
        "level": 1464,
        "experience": 52082507400
    },
    {
        "level": 1465,
        "experience": 52189452800
    },
    {
        "level": 1466,
        "experience": 52296544500
    },
    {
        "level": 1467,
        "experience": 52403782600
    },
    {
        "level": 1468,
        "experience": 52511167200
    },
    {
        "level": 1469,
        "experience": 52618698400
    },
    {
        "level": 1470,
        "experience": 52726376300
    },
    {
        "level": 1471,
        "experience": 52834201000
    },
    {
        "level": 1472,
        "experience": 52942172600
    },
    {
        "level": 1473,
        "experience": 53050291200
    },
    {
        "level": 1474,
        "experience": 53158556900
    },
    {
        "level": 1475,
        "experience": 53266969800
    },
    {
        "level": 1476,
        "experience": 53375530000
    },
    {
        "level": 1477,
        "experience": 53484237600
    },
    {
        "level": 1478,
        "experience": 53593092700
    },
    {
        "level": 1479,
        "experience": 53702095400
    },
    {
        "level": 1480,
        "experience": 53811245800
    },
    {
        "level": 1481,
        "experience": 53920544000
    },
    {
        "level": 1482,
        "experience": 54029990100
    },
    {
        "level": 1483,
        "experience": 54139584200
    },
    {
        "level": 1484,
        "experience": 54249326400
    },
    {
        "level": 1485,
        "experience": 54359216800
    },
    {
        "level": 1486,
        "experience": 54469255500
    },
    {
        "level": 1487,
        "experience": 54579442600
    },
    {
        "level": 1488,
        "experience": 54689778200
    },
    {
        "level": 1489,
        "experience": 54800262400
    },
    {
        "level": 1490,
        "experience": 54910895300
    },
    {
        "level": 1491,
        "experience": 55021677000
    },
    {
        "level": 1492,
        "experience": 55132607600
    },
    {
        "level": 1493,
        "experience": 55243687200
    },
    {
        "level": 1494,
        "experience": 55354915900
    },
    {
        "level": 1495,
        "experience": 55466293800
    },
    {
        "level": 1496,
        "experience": 55577821000
    },
    {
        "level": 1497,
        "experience": 55689497600
    },
    {
        "level": 1498,
        "experience": 55801323700
    },
    {
        "level": 1499,
        "experience": 55913299400
    },
    {
        "level": 1500,
        "experience": 56025424800
    },
    {
        "level": 1501,
        "experience": 56137700000
    },
    {
        "level": 1502,
        "experience": 56250125100
    },
    {
        "level": 1503,
        "experience": 56362700200
    },
    {
        "level": 1504,
        "experience": 56475425400
    },
    {
        "level": 1505,
        "experience": 56588300800
    },
    {
        "level": 1506,
        "experience": 56701326500
    },
    {
        "level": 1507,
        "experience": 56814502600
    },
    {
        "level": 1508,
        "experience": 56927829200
    },
    {
        "level": 1509,
        "experience": 57041306400
    },
    {
        "level": 1510,
        "experience": 57154934300
    },
    {
        "level": 1511,
        "experience": 57268713000
    },
    {
        "level": 1512,
        "experience": 57382642600
    },
    {
        "level": 1513,
        "experience": 57496723200
    },
    {
        "level": 1514,
        "experience": 57610954900
    },
    {
        "level": 1515,
        "experience": 57725337800
    },
    {
        "level": 1516,
        "experience": 57839872000
    },
    {
        "level": 1517,
        "experience": 57954557600
    },
    {
        "level": 1518,
        "experience": 58069394700
    },
    {
        "level": 1519,
        "experience": 58184383400
    },
    {
        "level": 1520,
        "experience": 58299523800
    },
    {
        "level": 1521,
        "experience": 58414816000
    },
    {
        "level": 1522,
        "experience": 58530260100
    },
    {
        "level": 1523,
        "experience": 58645856200
    },
    {
        "level": 1524,
        "experience": 58761604400
    },
    {
        "level": 1525,
        "experience": 58877504800
    },
    {
        "level": 1526,
        "experience": 58993557500
    },
    {
        "level": 1527,
        "experience": 59109762600
    },
    {
        "level": 1528,
        "experience": 59226120200
    },
    {
        "level": 1529,
        "experience": 59342630400
    },
    {
        "level": 1530,
        "experience": 59459293300
    },
    {
        "level": 1531,
        "experience": 59576109000
    },
    {
        "level": 1532,
        "experience": 59693077600
    },
    {
        "level": 1533,
        "experience": 59810199200
    },
    {
        "level": 1534,
        "experience": 59927473900
    },
    {
        "level": 1535,
        "experience": 60044901800
    },
    {
        "level": 1536,
        "experience": 60162483000
    },
    {
        "level": 1537,
        "experience": 60280217600
    },
    {
        "level": 1538,
        "experience": 60398105700
    },
    {
        "level": 1539,
        "experience": 60516147400
    },
    {
        "level": 1540,
        "experience": 60634342800
    },
    {
        "level": 1541,
        "experience": 60752692000
    },
    {
        "level": 1542,
        "experience": 60871195100
    },
    {
        "level": 1543,
        "experience": 60989852200
    },
    {
        "level": 1544,
        "experience": 61108663400
    },
    {
        "level": 1545,
        "experience": 61227628800
    },
    {
        "level": 1546,
        "experience": 61346748500
    },
    {
        "level": 1547,
        "experience": 61466022600
    },
    {
        "level": 1548,
        "experience": 61585451200
    },
    {
        "level": 1549,
        "experience": 61705034400
    },
    {
        "level": 1550,
        "experience": 61824772300
    },
    {
        "level": 1551,
        "experience": 61944665000
    },
    {
        "level": 1552,
        "experience": 62064712600
    },
    {
        "level": 1553,
        "experience": 62184915200
    },
    {
        "level": 1554,
        "experience": 62305272900
    },
    {
        "level": 1555,
        "experience": 62425785800
    },
    {
        "level": 1556,
        "experience": 62546454000
    },
    {
        "level": 1557,
        "experience": 62667277600
    },
    {
        "level": 1558,
        "experience": 62788256700
    },
    {
        "level": 1559,
        "experience": 62909391400
    },
    {
        "level": 1560,
        "experience": 63030681800
    },
    {
        "level": 1561,
        "experience": 63152128000
    },
    {
        "level": 1562,
        "experience": 63273730100
    },
    {
        "level": 1563,
        "experience": 63395488200
    },
    {
        "level": 1564,
        "experience": 63517402400
    },
    {
        "level": 1565,
        "experience": 63639472800
    },
    {
        "level": 1566,
        "experience": 63761699500
    },
    {
        "level": 1567,
        "experience": 63884082600
    },
    {
        "level": 1568,
        "experience": 64006622200
    },
    {
        "level": 1569,
        "experience": 64129318400
    },
    {
        "level": 1570,
        "experience": 64252171300
    },
    {
        "level": 1571,
        "experience": 64375181000
    },
    {
        "level": 1572,
        "experience": 64498347600
    },
    {
        "level": 1573,
        "experience": 64621671200
    },
    {
        "level": 1574,
        "experience": 64745151900
    },
    {
        "level": 1575,
        "experience": 64868789800
    },
    {
        "level": 1576,
        "experience": 64992585000
    },
    {
        "level": 1577,
        "experience": 65116537600
    },
    {
        "level": 1578,
        "experience": 65240647700
    },
    {
        "level": 1579,
        "experience": 65364915400
    },
    {
        "level": 1580,
        "experience": 65489340800
    },
    {
        "level": 1581,
        "experience": 65613924000
    },
    {
        "level": 1582,
        "experience": 65738665100
    },
    {
        "level": 1583,
        "experience": 65863564200
    },
    {
        "level": 1584,
        "experience": 65988621400
    },
    {
        "level": 1585,
        "experience": 66113836800
    },
    {
        "level": 1586,
        "experience": 66239210500
    },
    {
        "level": 1587,
        "experience": 66364742600
    },
    {
        "level": 1588,
        "experience": 66490433200
    },
    {
        "level": 1589,
        "experience": 66616282400
    },
    {
        "level": 1590,
        "experience": 66742290300
    },
    {
        "level": 1591,
        "experience": 66868457000
    },
    {
        "level": 1592,
        "experience": 66994782600
    },
    {
        "level": 1593,
        "experience": 67121267200
    },
    {
        "level": 1594,
        "experience": 67247910900
    },
    {
        "level": 1595,
        "experience": 67374713800
    },
    {
        "level": 1596,
        "experience": 67501676000
    },
    {
        "level": 1597,
        "experience": 67628797600
    },
    {
        "level": 1598,
        "experience": 67756078700
    },
    {
        "level": 1599,
        "experience": 67883519400
    },
    {
        "level": 1600,
        "experience": 68011119800
    },
    {
        "level": 1601,
        "experience": 68138880000
    },
    {
        "level": 1602,
        "experience": 68266800100
    },
    {
        "level": 1603,
        "experience": 68394880200
    },
    {
        "level": 1604,
        "experience": 68523120400
    },
    {
        "level": 1605,
        "experience": 68651520800
    },
    {
        "level": 1606,
        "experience": 68780081500
    },
    {
        "level": 1607,
        "experience": 68908802600
    },
    {
        "level": 1608,
        "experience": 69037684200
    },
    {
        "level": 1609,
        "experience": 69166726400
    },
    {
        "level": 1610,
        "experience": 69295929300
    },
    {
        "level": 1611,
        "experience": 69425293000
    },
    {
        "level": 1612,
        "experience": 69554817600
    },
    {
        "level": 1613,
        "experience": 69684503200
    },
    {
        "level": 1614,
        "experience": 69814349900
    },
    {
        "level": 1615,
        "experience": 69944357800
    },
    {
        "level": 1616,
        "experience": 70074527000
    },
    {
        "level": 1617,
        "experience": 70204857600
    },
    {
        "level": 1618,
        "experience": 70335349700
    },
    {
        "level": 1619,
        "experience": 70466003400
    },
    {
        "level": 1620,
        "experience": 70596818800
    },
    {
        "level": 1621,
        "experience": 70727796000
    },
    {
        "level": 1622,
        "experience": 70858935100
    },
    {
        "level": 1623,
        "experience": 70990236200
    },
    {
        "level": 1624,
        "experience": 71121699400
    },
    {
        "level": 1625,
        "experience": 71253324800
    },
    {
        "level": 1626,
        "experience": 71385112500
    },
    {
        "level": 1627,
        "experience": 71517062600
    },
    {
        "level": 1628,
        "experience": 71649175200
    },
    {
        "level": 1629,
        "experience": 71781450400
    },
    {
        "level": 1630,
        "experience": 71913888300
    },
    {
        "level": 1631,
        "experience": 72046489000
    },
    {
        "level": 1632,
        "experience": 72179252600
    },
    {
        "level": 1633,
        "experience": 72312179200
    },
    {
        "level": 1634,
        "experience": 72445268900
    },
    {
        "level": 1635,
        "experience": 72578521800
    },
    {
        "level": 1636,
        "experience": 72711938000
    },
    {
        "level": 1637,
        "experience": 72845517600
    },
    {
        "level": 1638,
        "experience": 72979260700
    },
    {
        "level": 1639,
        "experience": 73113167400
    },
    {
        "level": 1640,
        "experience": 73247237800
    },
    {
        "level": 1641,
        "experience": 73381472000
    },
    {
        "level": 1642,
        "experience": 73515870100
    },
    {
        "level": 1643,
        "experience": 73650432200
    },
    {
        "level": 1644,
        "experience": 73785158400
    },
    {
        "level": 1645,
        "experience": 73920048800
    },
    {
        "level": 1646,
        "experience": 74055103500
    },
    {
        "level": 1647,
        "experience": 74190322600
    },
    {
        "level": 1648,
        "experience": 74325706200
    },
    {
        "level": 1649,
        "experience": 74461254400
    },
    {
        "level": 1650,
        "experience": 74596967300
    },
    {
        "level": 1651,
        "experience": 74732845000
    },
    {
        "level": 1652,
        "experience": 74868887600
    },
    {
        "level": 1653,
        "experience": 75005095200
    },
    {
        "level": 1654,
        "experience": 75141467900
    },
    {
        "level": 1655,
        "experience": 75278005800
    },
    {
        "level": 1656,
        "experience": 75414709000
    },
    {
        "level": 1657,
        "experience": 75551577600
    },
    {
        "level": 1658,
        "experience": 75688611700
    },
    {
        "level": 1659,
        "experience": 75825811400
    },
    {
        "level": 1660,
        "experience": 75963176800
    },
    {
        "level": 1661,
        "experience": 76100708000
    },
    {
        "level": 1662,
        "experience": 76238405100
    },
    {
        "level": 1663,
        "experience": 76376268200
    },
    {
        "level": 1664,
        "experience": 76514297400
    },
    {
        "level": 1665,
        "experience": 76652492800
    },
    {
        "level": 1666,
        "experience": 76790854500
    },
    {
        "level": 1667,
        "experience": 76929382600
    },
    {
        "level": 1668,
        "experience": 77068077200
    },
    {
        "level": 1669,
        "experience": 77206938400
    },
    {
        "level": 1670,
        "experience": 77345966300
    },
    {
        "level": 1671,
        "experience": 77485161000
    },
    {
        "level": 1672,
        "experience": 77624522600
    },
    {
        "level": 1673,
        "experience": 77764051200
    },
    {
        "level": 1674,
        "experience": 77903746900
    },
    {
        "level": 1675,
        "experience": 78043609800
    },
    {
        "level": 1676,
        "experience": 78183640000
    },
    {
        "level": 1677,
        "experience": 78323837600
    },
    {
        "level": 1678,
        "experience": 78464202700
    },
    {
        "level": 1679,
        "experience": 78604735400
    },
    {
        "level": 1680,
        "experience": 78745435800
    },
    {
        "level": 1681,
        "experience": 78886304000
    },
    {
        "level": 1682,
        "experience": 79027340100
    },
    {
        "level": 1683,
        "experience": 79168544200
    },
    {
        "level": 1684,
        "experience": 79309916400
    },
    {
        "level": 1685,
        "experience": 79451456800
    },
    {
        "level": 1686,
        "experience": 79593165500
    },
    {
        "level": 1687,
        "experience": 79735042600
    },
    {
        "level": 1688,
        "experience": 79877088200
    },
    {
        "level": 1689,
        "experience": 80019302400
    },
    {
        "level": 1690,
        "experience": 80161685300
    },
    {
        "level": 1691,
        "experience": 80304237000
    },
    {
        "level": 1692,
        "experience": 80446957600
    },
    {
        "level": 1693,
        "experience": 80589847200
    },
    {
        "level": 1694,
        "experience": 80732905900
    },
    {
        "level": 1695,
        "experience": 80876133800
    },
    {
        "level": 1696,
        "experience": 81019531000
    },
    {
        "level": 1697,
        "experience": 81163097600
    },
    {
        "level": 1698,
        "experience": 81306833700
    },
    {
        "level": 1699,
        "experience": 81450739400
    },
    {
        "level": 1700,
        "experience": 81594814800
    },
    {
        "level": 1701,
        "experience": 81739060000
    },
    {
        "level": 1702,
        "experience": 81883475100
    },
    {
        "level": 1703,
        "experience": 82028060200
    },
    {
        "level": 1704,
        "experience": 82172815400
    },
    {
        "level": 1705,
        "experience": 82317740800
    },
    {
        "level": 1706,
        "experience": 82462836500
    },
    {
        "level": 1707,
        "experience": 82608102600
    },
    {
        "level": 1708,
        "experience": 82753539200
    },
    {
        "level": 1709,
        "experience": 82899146400
    },
    {
        "level": 1710,
        "experience": 83044924300
    },
    {
        "level": 1711,
        "experience": 83190873000
    },
    {
        "level": 1712,
        "experience": 83336992600
    },
    {
        "level": 1713,
        "experience": 83483283200
    },
    {
        "level": 1714,
        "experience": 83629744900
    },
    {
        "level": 1715,
        "experience": 83776377800
    },
    {
        "level": 1716,
        "experience": 83923182000
    },
    {
        "level": 1717,
        "experience": 84070157600
    },
    {
        "level": 1718,
        "experience": 84217304700
    },
    {
        "level": 1719,
        "experience": 84364623400
    },
    {
        "level": 1720,
        "experience": 84512113800
    },
    {
        "level": 1721,
        "experience": 84659776000
    },
    {
        "level": 1722,
        "experience": 84807610100
    },
    {
        "level": 1723,
        "experience": 84955616200
    },
    {
        "level": 1724,
        "experience": 85103794400
    },
    {
        "level": 1725,
        "experience": 85252144800
    },
    {
        "level": 1726,
        "experience": 85400667500
    },
    {
        "level": 1727,
        "experience": 85549362600
    },
    {
        "level": 1728,
        "experience": 85698230200
    },
    {
        "level": 1729,
        "experience": 85847270400
    },
    {
        "level": 1730,
        "experience": 85996483300
    },
    {
        "level": 1731,
        "experience": 86145869000
    },
    {
        "level": 1732,
        "experience": 86295427600
    },
    {
        "level": 1733,
        "experience": 86445159200
    },
    {
        "level": 1734,
        "experience": 86595063900
    },
    {
        "level": 1735,
        "experience": 86745141800
    },
    {
        "level": 1736,
        "experience": 86895393000
    },
    {
        "level": 1737,
        "experience": 87045817600
    },
    {
        "level": 1738,
        "experience": 87196415700
    },
    {
        "level": 1739,
        "experience": 87347187400
    },
    {
        "level": 1740,
        "experience": 87498132800
    },
    {
        "level": 1741,
        "experience": 87649252000
    },
    {
        "level": 1742,
        "experience": 87800545100
    },
    {
        "level": 1743,
        "experience": 87952012200
    },
    {
        "level": 1744,
        "experience": 88103653400
    },
    {
        "level": 1745,
        "experience": 88255468800
    },
    {
        "level": 1746,
        "experience": 88407458500
    },
    {
        "level": 1747,
        "experience": 88559622600
    },
    {
        "level": 1748,
        "experience": 88711961200
    },
    {
        "level": 1749,
        "experience": 88864474400
    },
    {
        "level": 1750,
        "experience": 89017162300
    },
    {
        "level": 1751,
        "experience": 89170025000
    },
    {
        "level": 1752,
        "experience": 89323062600
    },
    {
        "level": 1753,
        "experience": 89476275200
    },
    {
        "level": 1754,
        "experience": 89629662900
    },
    {
        "level": 1755,
        "experience": 89783225800
    },
    {
        "level": 1756,
        "experience": 89936964000
    },
    {
        "level": 1757,
        "experience": 90090877600
    },
    {
        "level": 1758,
        "experience": 90244966700
    },
    {
        "level": 1759,
        "experience": 90399231400
    },
    {
        "level": 1760,
        "experience": 90553671800
    },
    {
        "level": 1761,
        "experience": 90708288000
    },
    {
        "level": 1762,
        "experience": 90863080100
    },
    {
        "level": 1763,
        "experience": 91018048200
    },
    {
        "level": 1764,
        "experience": 91173192400
    },
    {
        "level": 1765,
        "experience": 91328512800
    },
    {
        "level": 1766,
        "experience": 91484009500
    },
    {
        "level": 1767,
        "experience": 91639682600
    },
    {
        "level": 1768,
        "experience": 91795532200
    },
    {
        "level": 1769,
        "experience": 91951558400
    },
    {
        "level": 1770,
        "experience": 92107761300
    },
    {
        "level": 1771,
        "experience": 92264141000
    },
    {
        "level": 1772,
        "experience": 92420697600
    },
    {
        "level": 1773,
        "experience": 92577431200
    },
    {
        "level": 1774,
        "experience": 92734341900
    },
    {
        "level": 1775,
        "experience": 92891429800
    },
    {
        "level": 1776,
        "experience": 93048695000
    },
    {
        "level": 1777,
        "experience": 93206137600
    },
    {
        "level": 1778,
        "experience": 93363757700
    },
    {
        "level": 1779,
        "experience": 93521555400
    },
    {
        "level": 1780,
        "experience": 93679530800
    },
    {
        "level": 1781,
        "experience": 93837684000
    },
    {
        "level": 1782,
        "experience": 93996015100
    },
    {
        "level": 1783,
        "experience": 94154524200
    },
    {
        "level": 1784,
        "experience": 94313211400
    },
    {
        "level": 1785,
        "experience": 94472076800
    },
    {
        "level": 1786,
        "experience": 94631120500
    },
    {
        "level": 1787,
        "experience": 94790342600
    },
    {
        "level": 1788,
        "experience": 94949743200
    },
    {
        "level": 1789,
        "experience": 95109322400
    },
    {
        "level": 1790,
        "experience": 95269080300
    },
    {
        "level": 1791,
        "experience": 95429017000
    },
    {
        "level": 1792,
        "experience": 95589132600
    },
    {
        "level": 1793,
        "experience": 95749427200
    },
    {
        "level": 1794,
        "experience": 95909900900
    },
    {
        "level": 1795,
        "experience": 96070553800
    },
    {
        "level": 1796,
        "experience": 96231386000
    },
    {
        "level": 1797,
        "experience": 96392397600
    },
    {
        "level": 1798,
        "experience": 96553588700
    },
    {
        "level": 1799,
        "experience": 96714959400
    },
    {
        "level": 1800,
        "experience": 96876509800
    },
    {
        "level": 1801,
        "experience": 97038240000
    },
    {
        "level": 1802,
        "experience": 97200150100
    },
    {
        "level": 1803,
        "experience": 97362240200
    },
    {
        "level": 1804,
        "experience": 97524510400
    },
    {
        "level": 1805,
        "experience": 97686960800
    },
    {
        "level": 1806,
        "experience": 97849591500
    },
    {
        "level": 1807,
        "experience": 98012402600
    },
    {
        "level": 1808,
        "experience": 98175394200
    },
    {
        "level": 1809,
        "experience": 98338566400
    },
    {
        "level": 1810,
        "experience": 98501919300
    },
    {
        "level": 1811,
        "experience": 98665453000
    },
    {
        "level": 1812,
        "experience": 98829167600
    },
    {
        "level": 1813,
        "experience": 98993063200
    },
    {
        "level": 1814,
        "experience": 99157139900
    },
    {
        "level": 1815,
        "experience": 99321397800
    },
    {
        "level": 1816,
        "experience": 99485837000
    },
    {
        "level": 1817,
        "experience": 99650457600
    },
    {
        "level": 1818,
        "experience": 99815259700
    },
    {
        "level": 1819,
        "experience": 99980243400
    },
    {
        "level": 1820,
        "experience": 100145408800
    },
    {
        "level": 1821,
        "experience": 100310756000
    },
    {
        "level": 1822,
        "experience": 100476285100
    },
    {
        "level": 1823,
        "experience": 100641996200
    },
    {
        "level": 1824,
        "experience": 100807889400
    },
    {
        "level": 1825,
        "experience": 100973964800
    },
    {
        "level": 1826,
        "experience": 101140222500
    },
    {
        "level": 1827,
        "experience": 101306662600
    },
    {
        "level": 1828,
        "experience": 101473285200
    },
    {
        "level": 1829,
        "experience": 101640090400
    },
    {
        "level": 1830,
        "experience": 101807078300
    },
    {
        "level": 1831,
        "experience": 101974249000
    },
    {
        "level": 1832,
        "experience": 102141602600
    },
    {
        "level": 1833,
        "experience": 102309139200
    },
    {
        "level": 1834,
        "experience": 102476858900
    },
    {
        "level": 1835,
        "experience": 102644761800
    },
    {
        "level": 1836,
        "experience": 102812848000
    },
    {
        "level": 1837,
        "experience": 102981117600
    },
    {
        "level": 1838,
        "experience": 103149570700
    },
    {
        "level": 1839,
        "experience": 103318207400
    },
    {
        "level": 1840,
        "experience": 103487027800
    },
    {
        "level": 1841,
        "experience": 103656032000
    },
    {
        "level": 1842,
        "experience": 103825220100
    },
    {
        "level": 1843,
        "experience": 103994592200
    },
    {
        "level": 1844,
        "experience": 104164148400
    },
    {
        "level": 1845,
        "experience": 104333888800
    },
    {
        "level": 1846,
        "experience": 104503813500
    },
    {
        "level": 1847,
        "experience": 104673922600
    },
    {
        "level": 1848,
        "experience": 104844216200
    },
    {
        "level": 1849,
        "experience": 105014694400
    },
    {
        "level": 1850,
        "experience": 105185357300
    },
    {
        "level": 1851,
        "experience": 105356205000
    },
    {
        "level": 1852,
        "experience": 105527237600
    },
    {
        "level": 1853,
        "experience": 105698455200
    },
    {
        "level": 1854,
        "experience": 105869857900
    },
    {
        "level": 1855,
        "experience": 106041445800
    },
    {
        "level": 1856,
        "experience": 106213219000
    },
    {
        "level": 1857,
        "experience": 106385177600
    },
    {
        "level": 1858,
        "experience": 106557321700
    },
    {
        "level": 1859,
        "experience": 106729651400
    },
    {
        "level": 1860,
        "experience": 106902166800
    },
    {
        "level": 1861,
        "experience": 107074868000
    },
    {
        "level": 1862,
        "experience": 107247755100
    },
    {
        "level": 1863,
        "experience": 107420828200
    },
    {
        "level": 1864,
        "experience": 107594087400
    },
    {
        "level": 1865,
        "experience": 107767532800
    },
    {
        "level": 1866,
        "experience": 107941164500
    },
    {
        "level": 1867,
        "experience": 108114982600
    },
    {
        "level": 1868,
        "experience": 108288987200
    },
    {
        "level": 1869,
        "experience": 108463178400
    },
    {
        "level": 1870,
        "experience": 108637556300
    },
    {
        "level": 1871,
        "experience": 108812121000
    },
    {
        "level": 1872,
        "experience": 108986872600
    },
    {
        "level": 1873,
        "experience": 109161811200
    },
    {
        "level": 1874,
        "experience": 109336936900
    },
    {
        "level": 1875,
        "experience": 109512249800
    },
    {
        "level": 1876,
        "experience": 109687750000
    },
    {
        "level": 1877,
        "experience": 109863437600
    },
    {
        "level": 1878,
        "experience": 110039312700
    },
    {
        "level": 1879,
        "experience": 110215375400
    },
    {
        "level": 1880,
        "experience": 110391625800
    },
    {
        "level": 1881,
        "experience": 110568064000
    },
    {
        "level": 1882,
        "experience": 110744690100
    },
    {
        "level": 1883,
        "experience": 110921504200
    },
    {
        "level": 1884,
        "experience": 111098506400
    },
    {
        "level": 1885,
        "experience": 111275696800
    },
    {
        "level": 1886,
        "experience": 111453075500
    },
    {
        "level": 1887,
        "experience": 111630642600
    },
    {
        "level": 1888,
        "experience": 111808398200
    },
    {
        "level": 1889,
        "experience": 111986342400
    },
    {
        "level": 1890,
        "experience": 112164475300
    },
    {
        "level": 1891,
        "experience": 112342797000
    },
    {
        "level": 1892,
        "experience": 112521307600
    },
    {
        "level": 1893,
        "experience": 112700007200
    },
    {
        "level": 1894,
        "experience": 112878895900
    },
    {
        "level": 1895,
        "experience": 113057973800
    },
    {
        "level": 1896,
        "experience": 113237241000
    },
    {
        "level": 1897,
        "experience": 113416697600
    },
    {
        "level": 1898,
        "experience": 113596343700
    },
    {
        "level": 1899,
        "experience": 113776179400
    },
    {
        "level": 1900,
        "experience": 113956204800
    },
    {
        "level": 1901,
        "experience": 114136420000
    },
    {
        "level": 1902,
        "experience": 114316825100
    },
    {
        "level": 1903,
        "experience": 114497420200
    },
    {
        "level": 1904,
        "experience": 114678205400
    },
    {
        "level": 1905,
        "experience": 114859180800
    },
    {
        "level": 1906,
        "experience": 115040346500
    },
    {
        "level": 1907,
        "experience": 115221702600
    },
    {
        "level": 1908,
        "experience": 115403249200
    },
    {
        "level": 1909,
        "experience": 115584986400
    },
    {
        "level": 1910,
        "experience": 115766914300
    },
    {
        "level": 1911,
        "experience": 115949033000
    },
    {
        "level": 1912,
        "experience": 116131342600
    },
    {
        "level": 1913,
        "experience": 116313843200
    },
    {
        "level": 1914,
        "experience": 116496534900
    },
    {
        "level": 1915,
        "experience": 116679417800
    },
    {
        "level": 1916,
        "experience": 116862492000
    },
    {
        "level": 1917,
        "experience": 117045757600
    },
    {
        "level": 1918,
        "experience": 117229214700
    },
    {
        "level": 1919,
        "experience": 117412863400
    },
    {
        "level": 1920,
        "experience": 117596703800
    },
    {
        "level": 1921,
        "experience": 117780736000
    },
    {
        "level": 1922,
        "experience": 117964960100
    },
    {
        "level": 1923,
        "experience": 118149376200
    },
    {
        "level": 1924,
        "experience": 118333984400
    },
    {
        "level": 1925,
        "experience": 118518784800
    },
    {
        "level": 1926,
        "experience": 118703777500
    },
    {
        "level": 1927,
        "experience": 118888962600
    },
    {
        "level": 1928,
        "experience": 119074340200
    },
    {
        "level": 1929,
        "experience": 119259910400
    },
    {
        "level": 1930,
        "experience": 119445673300
    },
    {
        "level": 1931,
        "experience": 119631629000
    },
    {
        "level": 1932,
        "experience": 119817777600
    },
    {
        "level": 1933,
        "experience": 120004119200
    },
    {
        "level": 1934,
        "experience": 120190653900
    },
    {
        "level": 1935,
        "experience": 120377381800
    },
    {
        "level": 1936,
        "experience": 120564303000
    },
    {
        "level": 1937,
        "experience": 120751417600
    },
    {
        "level": 1938,
        "experience": 120938725700
    },
    {
        "level": 1939,
        "experience": 121126227400
    },
    {
        "level": 1940,
        "experience": 121313922800
    },
    {
        "level": 1941,
        "experience": 121501812000
    },
    {
        "level": 1942,
        "experience": 121689895100
    },
    {
        "level": 1943,
        "experience": 121878172200
    },
    {
        "level": 1944,
        "experience": 122066643400
    },
    {
        "level": 1945,
        "experience": 122255308800
    },
    {
        "level": 1946,
        "experience": 122444168500
    },
    {
        "level": 1947,
        "experience": 122633222600
    },
    {
        "level": 1948,
        "experience": 122822471200
    },
    {
        "level": 1949,
        "experience": 123011914400
    },
    {
        "level": 1950,
        "experience": 123201552300
    },
    {
        "level": 1951,
        "experience": 123391385000
    },
    {
        "level": 1952,
        "experience": 123581412600
    },
    {
        "level": 1953,
        "experience": 123771635200
    },
    {
        "level": 1954,
        "experience": 123962052900
    },
    {
        "level": 1955,
        "experience": 124152665800
    },
    {
        "level": 1956,
        "experience": 124343474000
    },
    {
        "level": 1957,
        "experience": 124534477600
    },
    {
        "level": 1958,
        "experience": 124725676700
    },
    {
        "level": 1959,
        "experience": 124917071400
    },
    {
        "level": 1960,
        "experience": 125108661800
    },
    {
        "level": 1961,
        "experience": 125300448000
    },
    {
        "level": 1962,
        "experience": 125492430100
    },
    {
        "level": 1963,
        "experience": 125684608200
    },
    {
        "level": 1964,
        "experience": 125876982400
    },
    {
        "level": 1965,
        "experience": 126069552800
    },
    {
        "level": 1966,
        "experience": 126262319500
    },
    {
        "level": 1967,
        "experience": 126455282600
    },
    {
        "level": 1968,
        "experience": 126648442200
    },
    {
        "level": 1969,
        "experience": 126841798400
    },
    {
        "level": 1970,
        "experience": 127035351300
    },
    {
        "level": 1971,
        "experience": 127229101000
    },
    {
        "level": 1972,
        "experience": 127423047600
    },
    {
        "level": 1973,
        "experience": 127617191200
    },
    {
        "level": 1974,
        "experience": 127811531900
    },
    {
        "level": 1975,
        "experience": 128006069800
    },
    {
        "level": 1976,
        "experience": 128200805000
    },
    {
        "level": 1977,
        "experience": 128395737600
    },
    {
        "level": 1978,
        "experience": 128590867700
    },
    {
        "level": 1979,
        "experience": 128786195400
    },
    {
        "level": 1980,
        "experience": 128981720800
    },
    {
        "level": 1981,
        "experience": 129177444000
    },
    {
        "level": 1982,
        "experience": 129373365100
    },
    {
        "level": 1983,
        "experience": 129569484200
    },
    {
        "level": 1984,
        "experience": 129765801400
    },
    {
        "level": 1985,
        "experience": 129962316800
    },
    {
        "level": 1986,
        "experience": 130159030500
    },
    {
        "level": 1987,
        "experience": 130355942600
    },
    {
        "level": 1988,
        "experience": 130553053200
    },
    {
        "level": 1989,
        "experience": 130750362400
    },
    {
        "level": 1990,
        "experience": 130947870300
    },
    {
        "level": 1991,
        "experience": 131145577000
    },
    {
        "level": 1992,
        "experience": 131343482600
    },
    {
        "level": 1993,
        "experience": 131541587200
    },
    {
        "level": 1994,
        "experience": 131739890900
    },
    {
        "level": 1995,
        "experience": 131938393800
    },
    {
        "level": 1996,
        "experience": 132137096000
    },
    {
        "level": 1997,
        "experience": 132335997600
    },
    {
        "level": 1998,
        "experience": 132535098700
    },
    {
        "level": 1999,
        "experience": 132734399400
    },
    {
        "level": 2000,
        "experience": 132933899800
    },
    {
        "level": 2001,
        "experience": 133133600000
    },
    {
        "level": 2002,
        "experience": 133333500100
    },
    {
        "level": 2003,
        "experience": 133533600200
    },
    {
        "level": 2004,
        "experience": 133733900400
    },
    {
        "level": 2005,
        "experience": 133934400800
    },
    {
        "level": 2006,
        "experience": 134135101500
    },
    {
        "level": 2007,
        "experience": 134336002600
    },
    {
        "level": 2008,
        "experience": 134537104200
    },
    {
        "level": 2009,
        "experience": 134738406400
    },
    {
        "level": 2010,
        "experience": 134939909300
    },
    {
        "level": 2011,
        "experience": 135141613000
    },
    {
        "level": 2012,
        "experience": 135343517600
    },
    {
        "level": 2013,
        "experience": 135545623200
    },
    {
        "level": 2014,
        "experience": 135747929900
    },
    {
        "level": 2015,
        "experience": 135950437800
    },
    {
        "level": 2016,
        "experience": 136153147000
    },
    {
        "level": 2017,
        "experience": 136356057600
    },
    {
        "level": 2018,
        "experience": 136559169700
    },
    {
        "level": 2019,
        "experience": 136762483400
    },
    {
        "level": 2020,
        "experience": 136965998800
    },
    {
        "level": 2021,
        "experience": 137169716000
    },
    {
        "level": 2022,
        "experience": 137373635100
    },
    {
        "level": 2023,
        "experience": 137577756200
    },
    {
        "level": 2024,
        "experience": 137782079400
    },
    {
        "level": 2025,
        "experience": 137986604800
    },
    {
        "level": 2026,
        "experience": 138191332500
    },
    {
        "level": 2027,
        "experience": 138396262600
    },
    {
        "level": 2028,
        "experience": 138601395200
    },
    {
        "level": 2029,
        "experience": 138806730400
    },
    {
        "level": 2030,
        "experience": 139012268300
    },
    {
        "level": 2031,
        "experience": 139218009000
    },
    {
        "level": 2032,
        "experience": 139423952600
    },
    {
        "level": 2033,
        "experience": 139630099200
    },
    {
        "level": 2034,
        "experience": 139836448900
    },
    {
        "level": 2035,
        "experience": 140043001800
    },
    {
        "level": 2036,
        "experience": 140249758000
    },
    {
        "level": 2037,
        "experience": 140456717600
    },
    {
        "level": 2038,
        "experience": 140663880700
    },
    {
        "level": 2039,
        "experience": 140871247400
    },
    {
        "level": 2040,
        "experience": 141078817800
    },
    {
        "level": 2041,
        "experience": 141286592000
    },
    {
        "level": 2042,
        "experience": 141494570100
    },
    {
        "level": 2043,
        "experience": 141702752200
    },
    {
        "level": 2044,
        "experience": 141911138400
    },
    {
        "level": 2045,
        "experience": 142119728800
    },
    {
        "level": 2046,
        "experience": 142328523500
    },
    {
        "level": 2047,
        "experience": 142537522600
    },
    {
        "level": 2048,
        "experience": 142746726200
    },
    {
        "level": 2049,
        "experience": 142956134400
    },
    {
        "level": 2050,
        "experience": 143165747300
    },
    {
        "level": 2051,
        "experience": 143375565000
    },
    {
        "level": 2052,
        "experience": 143585587600
    },
    {
        "level": 2053,
        "experience": 143795815200
    },
    {
        "level": 2054,
        "experience": 144006247900
    },
    {
        "level": 2055,
        "experience": 144216885800
    },
    {
        "level": 2056,
        "experience": 144427729000
    },
    {
        "level": 2057,
        "experience": 144638777600
    },
    {
        "level": 2058,
        "experience": 144850031700
    },
    {
        "level": 2059,
        "experience": 145061491400
    },
    {
        "level": 2060,
        "experience": 145273156800
    },
    {
        "level": 2061,
        "experience": 145485028000
    },
    {
        "level": 2062,
        "experience": 145697105100
    },
    {
        "level": 2063,
        "experience": 145909388200
    },
    {
        "level": 2064,
        "experience": 146121877400
    },
    {
        "level": 2065,
        "experience": 146334572800
    },
    {
        "level": 2066,
        "experience": 146547474500
    },
    {
        "level": 2067,
        "experience": 146760582600
    },
    {
        "level": 2068,
        "experience": 146973897200
    },
    {
        "level": 2069,
        "experience": 147187418400
    },
    {
        "level": 2070,
        "experience": 147401146300
    },
    {
        "level": 2071,
        "experience": 147615081000
    },
    {
        "level": 2072,
        "experience": 147829222600
    },
    {
        "level": 2073,
        "experience": 148043571200
    },
    {
        "level": 2074,
        "experience": 148258126900
    },
    {
        "level": 2075,
        "experience": 148472889800
    },
    {
        "level": 2076,
        "experience": 148687860000
    },
    {
        "level": 2077,
        "experience": 148903037600
    },
    {
        "level": 2078,
        "experience": 149118422700
    },
    {
        "level": 2079,
        "experience": 149334015400
    },
    {
        "level": 2080,
        "experience": 149549815800
    },
    {
        "level": 2081,
        "experience": 149765824000
    },
    {
        "level": 2082,
        "experience": 149982040100
    },
    {
        "level": 2083,
        "experience": 150198464200
    },
    {
        "level": 2084,
        "experience": 150415096400
    },
    {
        "level": 2085,
        "experience": 150631936800
    },
    {
        "level": 2086,
        "experience": 150848985500
    },
    {
        "level": 2087,
        "experience": 151066242600
    },
    {
        "level": 2088,
        "experience": 151283708200
    },
    {
        "level": 2089,
        "experience": 151501382400
    },
    {
        "level": 2090,
        "experience": 151719265300
    },
    {
        "level": 2091,
        "experience": 151937357000
    },
    {
        "level": 2092,
        "experience": 152155657600
    },
    {
        "level": 2093,
        "experience": 152374167200
    },
    {
        "level": 2094,
        "experience": 152592885900
    },
    {
        "level": 2095,
        "experience": 152811813800
    },
    {
        "level": 2096,
        "experience": 153030951000
    },
    {
        "level": 2097,
        "experience": 153250297600
    },
    {
        "level": 2098,
        "experience": 153469853700
    },
    {
        "level": 2099,
        "experience": 153689619400
    },
    {
        "level": 2100,
        "experience": 153909594800
    },
    {
        "level": 2101,
        "experience": 154129780000
    },
    {
        "level": 2102,
        "experience": 154350175100
    },
    {
        "level": 2103,
        "experience": 154570780200
    },
    {
        "level": 2104,
        "experience": 154791595400
    },
    {
        "level": 2105,
        "experience": 155012620800
    },
    {
        "level": 2106,
        "experience": 155233856500
    },
    {
        "level": 2107,
        "experience": 155455302600
    },
    {
        "level": 2108,
        "experience": 155676959200
    },
    {
        "level": 2109,
        "experience": 155898826400
    },
    {
        "level": 2110,
        "experience": 156120904300
    },
    {
        "level": 2111,
        "experience": 156343193000
    },
    {
        "level": 2112,
        "experience": 156565692600
    },
    {
        "level": 2113,
        "experience": 156788403200
    },
    {
        "level": 2114,
        "experience": 157011324900
    },
    {
        "level": 2115,
        "experience": 157234457800
    },
    {
        "level": 2116,
        "experience": 157457802000
    },
    {
        "level": 2117,
        "experience": 157681357600
    },
    {
        "level": 2118,
        "experience": 157905124700
    },
    {
        "level": 2119,
        "experience": 158129103400
    },
    {
        "level": 2120,
        "experience": 158353293800
    },
    {
        "level": 2121,
        "experience": 158577696000
    },
    {
        "level": 2122,
        "experience": 158802310100
    },
    {
        "level": 2123,
        "experience": 159027136200
    },
    {
        "level": 2124,
        "experience": 159252174400
    },
    {
        "level": 2125,
        "experience": 159477424800
    },
    {
        "level": 2126,
        "experience": 159702887500
    },
    {
        "level": 2127,
        "experience": 159928562600
    },
    {
        "level": 2128,
        "experience": 160154450200
    },
    {
        "level": 2129,
        "experience": 160380550400
    },
    {
        "level": 2130,
        "experience": 160606863300
    },
    {
        "level": 2131,
        "experience": 160833389000
    },
    {
        "level": 2132,
        "experience": 161060127600
    },
    {
        "level": 2133,
        "experience": 161287079200
    },
    {
        "level": 2134,
        "experience": 161514243900
    },
    {
        "level": 2135,
        "experience": 161741621800
    },
    {
        "level": 2136,
        "experience": 161969213000
    },
    {
        "level": 2137,
        "experience": 162197017600
    },
    {
        "level": 2138,
        "experience": 162425035700
    },
    {
        "level": 2139,
        "experience": 162653267400
    },
    {
        "level": 2140,
        "experience": 162881712800
    },
    {
        "level": 2141,
        "experience": 163110372000
    },
    {
        "level": 2142,
        "experience": 163339245100
    },
    {
        "level": 2143,
        "experience": 163568332200
    },
    {
        "level": 2144,
        "experience": 163797633400
    },
    {
        "level": 2145,
        "experience": 164027148800
    },
    {
        "level": 2146,
        "experience": 164256878500
    },
    {
        "level": 2147,
        "experience": 164486822600
    },
    {
        "level": 2148,
        "experience": 164716981200
    },
    {
        "level": 2149,
        "experience": 164947354400
    },
    {
        "level": 2150,
        "experience": 165177942300
    },
    {
        "level": 2151,
        "experience": 165408745000
    },
    {
        "level": 2152,
        "experience": 165639762600
    },
    {
        "level": 2153,
        "experience": 165870995200
    },
    {
        "level": 2154,
        "experience": 166102442900
    },
    {
        "level": 2155,
        "experience": 166334105800
    },
    {
        "level": 2156,
        "experience": 166565984000
    },
    {
        "level": 2157,
        "experience": 166798077600
    },
    {
        "level": 2158,
        "experience": 167030386700
    },
    {
        "level": 2159,
        "experience": 167262911400
    },
    {
        "level": 2160,
        "experience": 167495651800
    },
    {
        "level": 2161,
        "experience": 167728608000
    },
    {
        "level": 2162,
        "experience": 167961780100
    },
    {
        "level": 2163,
        "experience": 168195168200
    },
    {
        "level": 2164,
        "experience": 168428772400
    },
    {
        "level": 2165,
        "experience": 168662592800
    },
    {
        "level": 2166,
        "experience": 168896629500
    },
    {
        "level": 2167,
        "experience": 169130882600
    },
    {
        "level": 2168,
        "experience": 169365352200
    },
    {
        "level": 2169,
        "experience": 169600038400
    },
    {
        "level": 2170,
        "experience": 169834941300
    },
    {
        "level": 2171,
        "experience": 170070061000
    },
    {
        "level": 2172,
        "experience": 170305397600
    },
    {
        "level": 2173,
        "experience": 170540951200
    },
    {
        "level": 2174,
        "experience": 170776721900
    },
    {
        "level": 2175,
        "experience": 171012709800
    },
    {
        "level": 2176,
        "experience": 171248915000
    },
    {
        "level": 2177,
        "experience": 171485337600
    },
    {
        "level": 2178,
        "experience": 171721977700
    },
    {
        "level": 2179,
        "experience": 171958835400
    },
    {
        "level": 2180,
        "experience": 172195910800
    },
    {
        "level": 2181,
        "experience": 172433204000
    },
    {
        "level": 2182,
        "experience": 172670715100
    },
    {
        "level": 2183,
        "experience": 172908444200
    },
    {
        "level": 2184,
        "experience": 173146391400
    },
    {
        "level": 2185,
        "experience": 173384556800
    },
    {
        "level": 2186,
        "experience": 173622940500
    },
    {
        "level": 2187,
        "experience": 173861542600
    },
    {
        "level": 2188,
        "experience": 174100363200
    },
    {
        "level": 2189,
        "experience": 174339402400
    },
    {
        "level": 2190,
        "experience": 174578660300
    },
    {
        "level": 2191,
        "experience": 174818137000
    },
    {
        "level": 2192,
        "experience": 175057832600
    },
    {
        "level": 2193,
        "experience": 175297747200
    },
    {
        "level": 2194,
        "experience": 175537880900
    },
    {
        "level": 2195,
        "experience": 175778233800
    },
    {
        "level": 2196,
        "experience": 176018806000
    },
    {
        "level": 2197,
        "experience": 176259597600
    },
    {
        "level": 2198,
        "experience": 176500608700
    },
    {
        "level": 2199,
        "experience": 176741839400
    },
    {
        "level": 2200,
        "experience": 176983289800
    },
    {
        "level": 2201,
        "experience": 177224960000
    },
    {
        "level": 2202,
        "experience": 177466850100
    },
    {
        "level": 2203,
        "experience": 177708960200
    },
    {
        "level": 2204,
        "experience": 177951290400
    },
    {
        "level": 2205,
        "experience": 178193840800
    },
    {
        "level": 2206,
        "experience": 178436611500
    },
    {
        "level": 2207,
        "experience": 178679602600
    },
    {
        "level": 2208,
        "experience": 178922814200
    },
    {
        "level": 2209,
        "experience": 179166246400
    },
    {
        "level": 2210,
        "experience": 179409899300
    },
    {
        "level": 2211,
        "experience": 179653773000
    },
    {
        "level": 2212,
        "experience": 179897867600
    },
    {
        "level": 2213,
        "experience": 180142183200
    },
    {
        "level": 2214,
        "experience": 180386719900
    },
    {
        "level": 2215,
        "experience": 180631477800
    },
    {
        "level": 2216,
        "experience": 180876457000
    },
    {
        "level": 2217,
        "experience": 181121657600
    },
    {
        "level": 2218,
        "experience": 181367079700
    },
    {
        "level": 2219,
        "experience": 181612723400
    },
    {
        "level": 2220,
        "experience": 181858588800
    },
    {
        "level": 2221,
        "experience": 182104676000
    },
    {
        "level": 2222,
        "experience": 182350985100
    },
    {
        "level": 2223,
        "experience": 182597516200
    },
    {
        "level": 2224,
        "experience": 182844269400
    },
    {
        "level": 2225,
        "experience": 183091244800
    },
    {
        "level": 2226,
        "experience": 183338442500
    },
    {
        "level": 2227,
        "experience": 183585862600
    },
    {
        "level": 2228,
        "experience": 183833505200
    },
    {
        "level": 2229,
        "experience": 184081370400
    },
    {
        "level": 2230,
        "experience": 184329458300
    },
    {
        "level": 2231,
        "experience": 184577769000
    },
    {
        "level": 2232,
        "experience": 184826302600
    },
    {
        "level": 2233,
        "experience": 185075059200
    },
    {
        "level": 2234,
        "experience": 185324038900
    },
    {
        "level": 2235,
        "experience": 185573241800
    },
    {
        "level": 2236,
        "experience": 185822668000
    },
    {
        "level": 2237,
        "experience": 186072317600
    },
    {
        "level": 2238,
        "experience": 186322190700
    },
    {
        "level": 2239,
        "experience": 186572287400
    },
    {
        "level": 2240,
        "experience": 186822607800
    },
    {
        "level": 2241,
        "experience": 187073152000
    },
    {
        "level": 2242,
        "experience": 187323920100
    },
    {
        "level": 2243,
        "experience": 187574912200
    },
    {
        "level": 2244,
        "experience": 187826128400
    },
    {
        "level": 2245,
        "experience": 188077568800
    },
    {
        "level": 2246,
        "experience": 188329233500
    },
    {
        "level": 2247,
        "experience": 188581122600
    },
    {
        "level": 2248,
        "experience": 188833236200
    },
    {
        "level": 2249,
        "experience": 189085574400
    },
    {
        "level": 2250,
        "experience": 189338137300
    },
    {
        "level": 2251,
        "experience": 189590925000
    },
    {
        "level": 2252,
        "experience": 189843937600
    },
    {
        "level": 2253,
        "experience": 190097175200
    },
    {
        "level": 2254,
        "experience": 190350637900
    },
    {
        "level": 2255,
        "experience": 190604325800
    },
    {
        "level": 2256,
        "experience": 190858239000
    },
    {
        "level": 2257,
        "experience": 191112377600
    },
    {
        "level": 2258,
        "experience": 191366741700
    },
    {
        "level": 2259,
        "experience": 191621331400
    },
    {
        "level": 2260,
        "experience": 191876146800
    },
    {
        "level": 2261,
        "experience": 192131188000
    },
    {
        "level": 2262,
        "experience": 192386455100
    },
    {
        "level": 2263,
        "experience": 192641948200
    },
    {
        "level": 2264,
        "experience": 192897667400
    },
    {
        "level": 2265,
        "experience": 193153612800
    },
    {
        "level": 2266,
        "experience": 193409784500
    },
    {
        "level": 2267,
        "experience": 193666182600
    },
    {
        "level": 2268,
        "experience": 193922807200
    },
    {
        "level": 2269,
        "experience": 194179658400
    },
    {
        "level": 2270,
        "experience": 194436736300
    },
    {
        "level": 2271,
        "experience": 194694041000
    },
    {
        "level": 2272,
        "experience": 194951572600
    },
    {
        "level": 2273,
        "experience": 195209331200
    },
    {
        "level": 2274,
        "experience": 195467316900
    },
    {
        "level": 2275,
        "experience": 195725529800
    },
    {
        "level": 2276,
        "experience": 195983970000
    },
    {
        "level": 2277,
        "experience": 196242637600
    },
    {
        "level": 2278,
        "experience": 196501532700
    },
    {
        "level": 2279,
        "experience": 196760655400
    },
    {
        "level": 2280,
        "experience": 197020005800
    },
    {
        "level": 2281,
        "experience": 197279584000
    },
    {
        "level": 2282,
        "experience": 197539390100
    },
    {
        "level": 2283,
        "experience": 197799424200
    },
    {
        "level": 2284,
        "experience": 198059686400
    },
    {
        "level": 2285,
        "experience": 198320176800
    },
    {
        "level": 2286,
        "experience": 198580895500
    },
    {
        "level": 2287,
        "experience": 198841842600
    },
    {
        "level": 2288,
        "experience": 199103018200
    },
    {
        "level": 2289,
        "experience": 199364422400
    },
    {
        "level": 2290,
        "experience": 199626055300
    },
    {
        "level": 2291,
        "experience": 199887917000
    },
    {
        "level": 2292,
        "experience": 200150007600
    },
    {
        "level": 2293,
        "experience": 200412327200
    },
    {
        "level": 2294,
        "experience": 200674875900
    },
    {
        "level": 2295,
        "experience": 200937653800
    },
    {
        "level": 2296,
        "experience": 201200661000
    },
    {
        "level": 2297,
        "experience": 201463897600
    },
    {
        "level": 2298,
        "experience": 201727363700
    },
    {
        "level": 2299,
        "experience": 201991059400
    },
    {
        "level": 2300,
        "experience": 202254984800
    },
    {
        "level": 2301,
        "experience": 202519140000
    },
    {
        "level": 2302,
        "experience": 202783525100
    },
    {
        "level": 2303,
        "experience": 203048140200
    },
    {
        "level": 2304,
        "experience": 203312985400
    },
    {
        "level": 2305,
        "experience": 203578060800
    },
    {
        "level": 2306,
        "experience": 203843366500
    },
    {
        "level": 2307,
        "experience": 204108902600
    },
    {
        "level": 2308,
        "experience": 204374669200
    },
    {
        "level": 2309,
        "experience": 204640666400
    },
    {
        "level": 2310,
        "experience": 204906894300
    },
    {
        "level": 2311,
        "experience": 205173353000
    },
    {
        "level": 2312,
        "experience": 205440042600
    },
    {
        "level": 2313,
        "experience": 205706963200
    },
    {
        "level": 2314,
        "experience": 205974114900
    },
    {
        "level": 2315,
        "experience": 206241497800
    },
    {
        "level": 2316,
        "experience": 206509112000
    },
    {
        "level": 2317,
        "experience": 206776957600
    },
    {
        "level": 2318,
        "experience": 207045034700
    },
    {
        "level": 2319,
        "experience": 207313343400
    },
    {
        "level": 2320,
        "experience": 207581883800
    },
    {
        "level": 2321,
        "experience": 207850656000
    },
    {
        "level": 2322,
        "experience": 208119660100
    },
    {
        "level": 2323,
        "experience": 208388896200
    },
    {
        "level": 2324,
        "experience": 208658364400
    },
    {
        "level": 2325,
        "experience": 208928064800
    },
    {
        "level": 2326,
        "experience": 209197997500
    },
    {
        "level": 2327,
        "experience": 209468162600
    },
    {
        "level": 2328,
        "experience": 209738560200
    },
    {
        "level": 2329,
        "experience": 210009190400
    },
    {
        "level": 2330,
        "experience": 210280053300
    },
    {
        "level": 2331,
        "experience": 210551149000
    },
    {
        "level": 2332,
        "experience": 210822477600
    },
    {
        "level": 2333,
        "experience": 211094039200
    },
    {
        "level": 2334,
        "experience": 211365833900
    },
    {
        "level": 2335,
        "experience": 211637861800
    },
    {
        "level": 2336,
        "experience": 211910123000
    },
    {
        "level": 2337,
        "experience": 212182617600
    },
    {
        "level": 2338,
        "experience": 212455345700
    },
    {
        "level": 2339,
        "experience": 212728307400
    },
    {
        "level": 2340,
        "experience": 213001502800
    },
    {
        "level": 2341,
        "experience": 213274932000
    },
    {
        "level": 2342,
        "experience": 213548595100
    },
    {
        "level": 2343,
        "experience": 213822492200
    },
    {
        "level": 2344,
        "experience": 214096623400
    },
    {
        "level": 2345,
        "experience": 214370988800
    },
    {
        "level": 2346,
        "experience": 214645588500
    },
    {
        "level": 2347,
        "experience": 214920422600
    },
    {
        "level": 2348,
        "experience": 215195491200
    },
    {
        "level": 2349,
        "experience": 215470794400
    },
    {
        "level": 2350,
        "experience": 215746332300
    },
    {
        "level": 2351,
        "experience": 216022105000
    },
    {
        "level": 2352,
        "experience": 216298112600
    },
    {
        "level": 2353,
        "experience": 216574355200
    },
    {
        "level": 2354,
        "experience": 216850832900
    },
    {
        "level": 2355,
        "experience": 217127545800
    },
    {
        "level": 2356,
        "experience": 217404494000
    },
    {
        "level": 2357,
        "experience": 217681677600
    },
    {
        "level": 2358,
        "experience": 217959096700
    },
    {
        "level": 2359,
        "experience": 218236751400
    },
    {
        "level": 2360,
        "experience": 218514641800
    },
    {
        "level": 2361,
        "experience": 218792768000
    },
    {
        "level": 2362,
        "experience": 219071130100
    },
    {
        "level": 2363,
        "experience": 219349728200
    },
    {
        "level": 2364,
        "experience": 219628562400
    },
    {
        "level": 2365,
        "experience": 219907632800
    },
    {
        "level": 2366,
        "experience": 220186939500
    },
    {
        "level": 2367,
        "experience": 220466482600
    },
    {
        "level": 2368,
        "experience": 220746262200
    },
    {
        "level": 2369,
        "experience": 221026278400
    },
    {
        "level": 2370,
        "experience": 221306531300
    },
    {
        "level": 2371,
        "experience": 221587021000
    },
    {
        "level": 2372,
        "experience": 221867747600
    },
    {
        "level": 2373,
        "experience": 222148711200
    },
    {
        "level": 2374,
        "experience": 222429911900
    },
    {
        "level": 2375,
        "experience": 222711349800
    },
    {
        "level": 2376,
        "experience": 222993025000
    },
    {
        "level": 2377,
        "experience": 223274937600
    },
    {
        "level": 2378,
        "experience": 223557087700
    },
    {
        "level": 2379,
        "experience": 223839475400
    },
    {
        "level": 2380,
        "experience": 224122100800
    },
    {
        "level": 2381,
        "experience": 224404964000
    },
    {
        "level": 2382,
        "experience": 224688065100
    },
    {
        "level": 2383,
        "experience": 224971404200
    },
    {
        "level": 2384,
        "experience": 225254981400
    },
    {
        "level": 2385,
        "experience": 225538796800
    },
    {
        "level": 2386,
        "experience": 225822850500
    },
    {
        "level": 2387,
        "experience": 226107142600
    },
    {
        "level": 2388,
        "experience": 226391673200
    },
    {
        "level": 2389,
        "experience": 226676442400
    },
    {
        "level": 2390,
        "experience": 226961450300
    },
    {
        "level": 2391,
        "experience": 227246697000
    },
    {
        "level": 2392,
        "experience": 227532182600
    },
    {
        "level": 2393,
        "experience": 227817907200
    },
    {
        "level": 2394,
        "experience": 228103870900
    },
    {
        "level": 2395,
        "experience": 228390073800
    },
    {
        "level": 2396,
        "experience": 228676516000
    },
    {
        "level": 2397,
        "experience": 228963197600
    },
    {
        "level": 2398,
        "experience": 229250118700
    },
    {
        "level": 2399,
        "experience": 229537279400
    },
    {
        "level": 2400,
        "experience": 229824679800
    },
    {
        "level": 2401,
        "experience": 230112320000
    },
    {
        "level": 2402,
        "experience": 230400200100
    },
    {
        "level": 2403,
        "experience": 230688320200
    },
    {
        "level": 2404,
        "experience": 230976680400
    },
    {
        "level": 2405,
        "experience": 231265280800
    },
    {
        "level": 2406,
        "experience": 231554121500
    },
    {
        "level": 2407,
        "experience": 231843202600
    },
    {
        "level": 2408,
        "experience": 232132524200
    },
    {
        "level": 2409,
        "experience": 232422086400
    },
    {
        "level": 2410,
        "experience": 232711889300
    },
    {
        "level": 2411,
        "experience": 233001933000
    },
    {
        "level": 2412,
        "experience": 233292217600
    },
    {
        "level": 2413,
        "experience": 233582743200
    },
    {
        "level": 2414,
        "experience": 233873509900
    },
    {
        "level": 2415,
        "experience": 234164517800
    },
    {
        "level": 2416,
        "experience": 234455767000
    },
    {
        "level": 2417,
        "experience": 234747257600
    },
    {
        "level": 2418,
        "experience": 235038989700
    },
    {
        "level": 2419,
        "experience": 235330963400
    },
    {
        "level": 2420,
        "experience": 235623178800
    },
    {
        "level": 2421,
        "experience": 235915636000
    },
    {
        "level": 2422,
        "experience": 236208335100
    },
    {
        "level": 2423,
        "experience": 236501276200
    },
    {
        "level": 2424,
        "experience": 236794459400
    },
    {
        "level": 2425,
        "experience": 237087884800
    },
    {
        "level": 2426,
        "experience": 237381552500
    },
    {
        "level": 2427,
        "experience": 237675462600
    },
    {
        "level": 2428,
        "experience": 237969615200
    },
    {
        "level": 2429,
        "experience": 238264010400
    },
    {
        "level": 2430,
        "experience": 238558648300
    },
    {
        "level": 2431,
        "experience": 238853529000
    },
    {
        "level": 2432,
        "experience": 239148652600
    },
    {
        "level": 2433,
        "experience": 239444019200
    },
    {
        "level": 2434,
        "experience": 239739628900
    },
    {
        "level": 2435,
        "experience": 240035481800
    },
    {
        "level": 2436,
        "experience": 240331578000
    },
    {
        "level": 2437,
        "experience": 240627917600
    },
    {
        "level": 2438,
        "experience": 240924500700
    },
    {
        "level": 2439,
        "experience": 241221327400
    },
    {
        "level": 2440,
        "experience": 241518397800
    },
    {
        "level": 2441,
        "experience": 241815712000
    },
    {
        "level": 2442,
        "experience": 242113270100
    },
    {
        "level": 2443,
        "experience": 242411072200
    },
    {
        "level": 2444,
        "experience": 242709118400
    },
    {
        "level": 2445,
        "experience": 243007408800
    },
    {
        "level": 2446,
        "experience": 243305943500
    },
    {
        "level": 2447,
        "experience": 243604722600
    },
    {
        "level": 2448,
        "experience": 243903746200
    },
    {
        "level": 2449,
        "experience": 244203014400
    },
    {
        "level": 2450,
        "experience": 244502527300
    },
    {
        "level": 2451,
        "experience": 244802285000
    },
    {
        "level": 2452,
        "experience": 245102287600
    },
    {
        "level": 2453,
        "experience": 245402535200
    },
    {
        "level": 2454,
        "experience": 245703027900
    },
    {
        "level": 2455,
        "experience": 246003765800
    },
    {
        "level": 2456,
        "experience": 246304749000
    },
    {
        "level": 2457,
        "experience": 246605977600
    },
    {
        "level": 2458,
        "experience": 246907451700
    },
    {
        "level": 2459,
        "experience": 247209171400
    },
    {
        "level": 2460,
        "experience": 247511136800
    },
    {
        "level": 2461,
        "experience": 247813348000
    },
    {
        "level": 2462,
        "experience": 248115805100
    },
    {
        "level": 2463,
        "experience": 248418508200
    },
    {
        "level": 2464,
        "experience": 248721457400
    },
    {
        "level": 2465,
        "experience": 249024652800
    },
    {
        "level": 2466,
        "experience": 249328094500
    },
    {
        "level": 2467,
        "experience": 249631782600
    },
    {
        "level": 2468,
        "experience": 249935717200
    },
    {
        "level": 2469,
        "experience": 250239898400
    },
    {
        "level": 2470,
        "experience": 250544326300
    },
    {
        "level": 2471,
        "experience": 250849001000
    },
    {
        "level": 2472,
        "experience": 251153922600
    },
    {
        "level": 2473,
        "experience": 251459091200
    },
    {
        "level": 2474,
        "experience": 251764506900
    },
    {
        "level": 2475,
        "experience": 252070169800
    },
    {
        "level": 2476,
        "experience": 252376080000
    },
    {
        "level": 2477,
        "experience": 252682237600
    },
    {
        "level": 2478,
        "experience": 252988642700
    },
    {
        "level": 2479,
        "experience": 253295295400
    },
    {
        "level": 2480,
        "experience": 253602195800
    },
    {
        "level": 2481,
        "experience": 253909344000
    },
    {
        "level": 2482,
        "experience": 254216740100
    },
    {
        "level": 2483,
        "experience": 254524384200
    },
    {
        "level": 2484,
        "experience": 254832276400
    },
    {
        "level": 2485,
        "experience": 255140416800
    },
    {
        "level": 2486,
        "experience": 255448805500
    },
    {
        "level": 2487,
        "experience": 255757442600
    },
    {
        "level": 2488,
        "experience": 256066328200
    },
    {
        "level": 2489,
        "experience": 256375462400
    },
    {
        "level": 2490,
        "experience": 256684845300
    },
    {
        "level": 2491,
        "experience": 256994477000
    },
    {
        "level": 2492,
        "experience": 257304357600
    },
    {
        "level": 2493,
        "experience": 257614487200
    },
    {
        "level": 2494,
        "experience": 257924865900
    },
    {
        "level": 2495,
        "experience": 258235493800
    },
    {
        "level": 2496,
        "experience": 258546371000
    },
    {
        "level": 2497,
        "experience": 258857497600
    },
    {
        "level": 2498,
        "experience": 259168873700
    },
    {
        "level": 2499,
        "experience": 259480499400
    },
    {
        "level": 2500,
        "experience": 259792374800
    },
    {
        "level": 2501,
        "experience": 260104500000
    },
    {
        "level": 2502,
        "experience": 260416875100
    },
    {
        "level": 2503,
        "experience": 260729500200
    },
    {
        "level": 2504,
        "experience": 261042375400
    },
    {
        "level": 2505,
        "experience": 261355500800
    },
    {
        "level": 2506,
        "experience": 261668876500
    },
    {
        "level": 2507,
        "experience": 261982502600
    },
    {
        "level": 2508,
        "experience": 262296379200
    },
    {
        "level": 2509,
        "experience": 262610506400
    },
    {
        "level": 2510,
        "experience": 262924884300
    },
    {
        "level": 2511,
        "experience": 263239513000
    },
    {
        "level": 2512,
        "experience": 263554392600
    },
    {
        "level": 2513,
        "experience": 263869523200
    },
    {
        "level": 2514,
        "experience": 264184904900
    },
    {
        "level": 2515,
        "experience": 264500537800
    },
    {
        "level": 2516,
        "experience": 264816422000
    },
    {
        "level": 2517,
        "experience": 265132557600
    },
    {
        "level": 2518,
        "experience": 265448944700
    },
    {
        "level": 2519,
        "experience": 265765583400
    },
    {
        "level": 2520,
        "experience": 266082473800
    },
    {
        "level": 2521,
        "experience": 266399616000
    },
    {
        "level": 2522,
        "experience": 266717010100
    },
    {
        "level": 2523,
        "experience": 267034656200
    },
    {
        "level": 2524,
        "experience": 267352554400
    },
    {
        "level": 2525,
        "experience": 267670704800
    },
    {
        "level": 2526,
        "experience": 267989107500
    },
    {
        "level": 2527,
        "experience": 268307762600
    },
    {
        "level": 2528,
        "experience": 268626670200
    },
    {
        "level": 2529,
        "experience": 268945830400
    },
    {
        "level": 2530,
        "experience": 269265243300
    },
    {
        "level": 2531,
        "experience": 269584909000
    },
    {
        "level": 2532,
        "experience": 269904827600
    },
    {
        "level": 2533,
        "experience": 270224999200
    },
    {
        "level": 2534,
        "experience": 270545423900
    },
    {
        "level": 2535,
        "experience": 270866101800
    },
    {
        "level": 2536,
        "experience": 271187033000
    },
    {
        "level": 2537,
        "experience": 271508217600
    },
    {
        "level": 2538,
        "experience": 271829655700
    },
    {
        "level": 2539,
        "experience": 272151347400
    },
    {
        "level": 2540,
        "experience": 272473292800
    },
    {
        "level": 2541,
        "experience": 272795492000
    },
    {
        "level": 2542,
        "experience": 273117945100
    },
    {
        "level": 2543,
        "experience": 273440652200
    },
    {
        "level": 2544,
        "experience": 273763613400
    },
    {
        "level": 2545,
        "experience": 274086828800
    },
    {
        "level": 2546,
        "experience": 274410298500
    },
    {
        "level": 2547,
        "experience": 274734022600
    },
    {
        "level": 2548,
        "experience": 275058001200
    },
    {
        "level": 2549,
        "experience": 275382234400
    },
    {
        "level": 2550,
        "experience": 275706722300
    },
    {
        "level": 2551,
        "experience": 276031465000
    },
    {
        "level": 2552,
        "experience": 276356462600
    },
    {
        "level": 2553,
        "experience": 276681715200
    },
    {
        "level": 2554,
        "experience": 277007222900
    },
    {
        "level": 2555,
        "experience": 277332985800
    },
    {
        "level": 2556,
        "experience": 277659004000
    },
    {
        "level": 2557,
        "experience": 277985277600
    },
    {
        "level": 2558,
        "experience": 278311806700
    },
    {
        "level": 2559,
        "experience": 278638591400
    },
    {
        "level": 2560,
        "experience": 278965631800
    },
    {
        "level": 2561,
        "experience": 279292928000
    },
    {
        "level": 2562,
        "experience": 279620480100
    },
    {
        "level": 2563,
        "experience": 279948288200
    },
    {
        "level": 2564,
        "experience": 280276352400
    },
    {
        "level": 2565,
        "experience": 280604672800
    },
    {
        "level": 2566,
        "experience": 280933249500
    },
    {
        "level": 2567,
        "experience": 281262082600
    },
    {
        "level": 2568,
        "experience": 281591172200
    },
    {
        "level": 2569,
        "experience": 281920518400
    },
    {
        "level": 2570,
        "experience": 282250121300
    },
    {
        "level": 2571,
        "experience": 282579981000
    },
    {
        "level": 2572,
        "experience": 282910097600
    },
    {
        "level": 2573,
        "experience": 283240471200
    },
    {
        "level": 2574,
        "experience": 283571101900
    },
    {
        "level": 2575,
        "experience": 283901989800
    },
    {
        "level": 2576,
        "experience": 284233135000
    },
    {
        "level": 2577,
        "experience": 284564537600
    },
    {
        "level": 2578,
        "experience": 284896197700
    },
    {
        "level": 2579,
        "experience": 285228115400
    },
    {
        "level": 2580,
        "experience": 285560290800
    },
    {
        "level": 2581,
        "experience": 285892724000
    },
    {
        "level": 2582,
        "experience": 286225415100
    },
    {
        "level": 2583,
        "experience": 286558364200
    },
    {
        "level": 2584,
        "experience": 286891571400
    },
    {
        "level": 2585,
        "experience": 287225036800
    },
    {
        "level": 2586,
        "experience": 287558760500
    },
    {
        "level": 2587,
        "experience": 287892742600
    },
    {
        "level": 2588,
        "experience": 288226983200
    },
    {
        "level": 2589,
        "experience": 288561482400
    },
    {
        "level": 2590,
        "experience": 288896240300
    },
    {
        "level": 2591,
        "experience": 289231257000
    },
    {
        "level": 2592,
        "experience": 289566532600
    },
    {
        "level": 2593,
        "experience": 289902067200
    },
    {
        "level": 2594,
        "experience": 290237860900
    },
    {
        "level": 2595,
        "experience": 290573913800
    },
    {
        "level": 2596,
        "experience": 290910226000
    },
    {
        "level": 2597,
        "experience": 291246797600
    },
    {
        "level": 2598,
        "experience": 291583628700
    },
    {
        "level": 2599,
        "experience": 291920719400
    },
    {
        "level": 2600,
        "experience": 292258069800
    },
    {
        "level": 2601,
        "experience": 292595680000
    },
    {
        "level": 2602,
        "experience": 292933550100
    },
    {
        "level": 2603,
        "experience": 293271680200
    },
    {
        "level": 2604,
        "experience": 293610070400
    },
    {
        "level": 2605,
        "experience": 293948720800
    },
    {
        "level": 2606,
        "experience": 294287631500
    },
    {
        "level": 2607,
        "experience": 294626802600
    },
    {
        "level": 2608,
        "experience": 294966234200
    },
    {
        "level": 2609,
        "experience": 295305926400
    },
    {
        "level": 2610,
        "experience": 295645879300
    },
    {
        "level": 2611,
        "experience": 295986093000
    },
    {
        "level": 2612,
        "experience": 296326567600
    },
    {
        "level": 2613,
        "experience": 296667303200
    },
    {
        "level": 2614,
        "experience": 297008299900
    },
    {
        "level": 2615,
        "experience": 297349557800
    },
    {
        "level": 2616,
        "experience": 297691077000
    },
    {
        "level": 2617,
        "experience": 298032857600
    },
    {
        "level": 2618,
        "experience": 298374899700
    },
    {
        "level": 2619,
        "experience": 298717203400
    },
    {
        "level": 2620,
        "experience": 299059768800
    },
    {
        "level": 2621,
        "experience": 299402596000
    },
    {
        "level": 2622,
        "experience": 299745685100
    },
    {
        "level": 2623,
        "experience": 300089036200
    },
    {
        "level": 2624,
        "experience": 300432649400
    },
    {
        "level": 2625,
        "experience": 300776524800
    },
    {
        "level": 2626,
        "experience": 301120662500
    },
    {
        "level": 2627,
        "experience": 301465062600
    },
    {
        "level": 2628,
        "experience": 301809725200
    },
    {
        "level": 2629,
        "experience": 302154650400
    },
    {
        "level": 2630,
        "experience": 302499838300
    },
    {
        "level": 2631,
        "experience": 302845289000
    },
    {
        "level": 2632,
        "experience": 303191002600
    },
    {
        "level": 2633,
        "experience": 303536979200
    },
    {
        "level": 2634,
        "experience": 303883218900
    },
    {
        "level": 2635,
        "experience": 304229721800
    },
    {
        "level": 2636,
        "experience": 304576488000
    },
    {
        "level": 2637,
        "experience": 304923517600
    },
    {
        "level": 2638,
        "experience": 305270810700
    },
    {
        "level": 2639,
        "experience": 305618367400
    },
    {
        "level": 2640,
        "experience": 305966187800
    },
    {
        "level": 2641,
        "experience": 306314272000
    },
    {
        "level": 2642,
        "experience": 306662620100
    },
    {
        "level": 2643,
        "experience": 307011232200
    },
    {
        "level": 2644,
        "experience": 307360108400
    },
    {
        "level": 2645,
        "experience": 307709248800
    },
    {
        "level": 2646,
        "experience": 308058653500
    },
    {
        "level": 2647,
        "experience": 308408322600
    },
    {
        "level": 2648,
        "experience": 308758256200
    },
    {
        "level": 2649,
        "experience": 309108454400
    },
    {
        "level": 2650,
        "experience": 309458917300
    },
    {
        "level": 2651,
        "experience": 309809645000
    },
    {
        "level": 2652,
        "experience": 310160637600
    },
    {
        "level": 2653,
        "experience": 310511895200
    },
    {
        "level": 2654,
        "experience": 310863417900
    },
    {
        "level": 2655,
        "experience": 311215205800
    },
    {
        "level": 2656,
        "experience": 311567259000
    },
    {
        "level": 2657,
        "experience": 311919577600
    },
    {
        "level": 2658,
        "experience": 312272161700
    },
    {
        "level": 2659,
        "experience": 312625011400
    },
    {
        "level": 2660,
        "experience": 312978126800
    },
    {
        "level": 2661,
        "experience": 313331508000
    },
    {
        "level": 2662,
        "experience": 313685155100
    },
    {
        "level": 2663,
        "experience": 314039068200
    },
    {
        "level": 2664,
        "experience": 314393247400
    },
    {
        "level": 2665,
        "experience": 314747692800
    },
    {
        "level": 2666,
        "experience": 315102404500
    },
    {
        "level": 2667,
        "experience": 315457382600
    },
    {
        "level": 2668,
        "experience": 315812627200
    },
    {
        "level": 2669,
        "experience": 316168138400
    },
    {
        "level": 2670,
        "experience": 316523916300
    },
    {
        "level": 2671,
        "experience": 316879961000
    },
    {
        "level": 2672,
        "experience": 317236272600
    },
    {
        "level": 2673,
        "experience": 317592851200
    },
    {
        "level": 2674,
        "experience": 317949696900
    },
    {
        "level": 2675,
        "experience": 318306809800
    },
    {
        "level": 2676,
        "experience": 318664190000
    },
    {
        "level": 2677,
        "experience": 319021837600
    },
    {
        "level": 2678,
        "experience": 319379752700
    },
    {
        "level": 2679,
        "experience": 319737935400
    },
    {
        "level": 2680,
        "experience": 320096385800
    },
    {
        "level": 2681,
        "experience": 320455104000
    },
    {
        "level": 2682,
        "experience": 320814090100
    },
    {
        "level": 2683,
        "experience": 321173344200
    },
    {
        "level": 2684,
        "experience": 321532866400
    },
    {
        "level": 2685,
        "experience": 321892656800
    },
    {
        "level": 2686,
        "experience": 322252715500
    },
    {
        "level": 2687,
        "experience": 322613042600
    },
    {
        "level": 2688,
        "experience": 322973638200
    },
    {
        "level": 2689,
        "experience": 323334502400
    },
    {
        "level": 2690,
        "experience": 323695635300
    },
    {
        "level": 2691,
        "experience": 324057037000
    },
    {
        "level": 2692,
        "experience": 324418707600
    },
    {
        "level": 2693,
        "experience": 324780647200
    },
    {
        "level": 2694,
        "experience": 325142855900
    },
    {
        "level": 2695,
        "experience": 325505333800
    },
    {
        "level": 2696,
        "experience": 325868081000
    },
    {
        "level": 2697,
        "experience": 326231097600
    },
    {
        "level": 2698,
        "experience": 326594383700
    },
    {
        "level": 2699,
        "experience": 326957939400
    },
    {
        "level": 2700,
        "experience": 327321764800
    },
    {
        "level": 2701,
        "experience": 327685860000
    },
    {
        "level": 2702,
        "experience": 328050225100
    },
    {
        "level": 2703,
        "experience": 328414860200
    },
    {
        "level": 2704,
        "experience": 328779765400
    },
    {
        "level": 2705,
        "experience": 329144940800
    },
    {
        "level": 2706,
        "experience": 329510386500
    },
    {
        "level": 2707,
        "experience": 329876102600
    },
    {
        "level": 2708,
        "experience": 330242089200
    },
    {
        "level": 2709,
        "experience": 330608346400
    },
    {
        "level": 2710,
        "experience": 330974874300
    },
    {
        "level": 2711,
        "experience": 331341673000
    },
    {
        "level": 2712,
        "experience": 331708742600
    },
    {
        "level": 2713,
        "experience": 332076083200
    },
    {
        "level": 2714,
        "experience": 332443694900
    },
    {
        "level": 2715,
        "experience": 332811577800
    },
    {
        "level": 2716,
        "experience": 333179732000
    },
    {
        "level": 2717,
        "experience": 333548157600
    },
    {
        "level": 2718,
        "experience": 333916854700
    },
    {
        "level": 2719,
        "experience": 334285823400
    },
    {
        "level": 2720,
        "experience": 334655063800
    },
    {
        "level": 2721,
        "experience": 335024576000
    },
    {
        "level": 2722,
        "experience": 335394360100
    },
    {
        "level": 2723,
        "experience": 335764416200
    },
    {
        "level": 2724,
        "experience": 336134744400
    },
    {
        "level": 2725,
        "experience": 336505344800
    },
    {
        "level": 2726,
        "experience": 336876217500
    },
    {
        "level": 2727,
        "experience": 337247362600
    },
    {
        "level": 2728,
        "experience": 337618780200
    },
    {
        "level": 2729,
        "experience": 337990470400
    },
    {
        "level": 2730,
        "experience": 338362433300
    },
    {
        "level": 2731,
        "experience": 338734669000
    },
    {
        "level": 2732,
        "experience": 339107177600
    },
    {
        "level": 2733,
        "experience": 339479959200
    },
    {
        "level": 2734,
        "experience": 339853013900
    },
    {
        "level": 2735,
        "experience": 340226341800
    },
    {
        "level": 2736,
        "experience": 340599943000
    },
    {
        "level": 2737,
        "experience": 340973817600
    },
    {
        "level": 2738,
        "experience": 341347965700
    },
    {
        "level": 2739,
        "experience": 341722387400
    },
    {
        "level": 2740,
        "experience": 342097082800
    },
    {
        "level": 2741,
        "experience": 342472052000
    },
    {
        "level": 2742,
        "experience": 342847295100
    },
    {
        "level": 2743,
        "experience": 343222812200
    },
    {
        "level": 2744,
        "experience": 343598603400
    },
    {
        "level": 2745,
        "experience": 343974668800
    },
    {
        "level": 2746,
        "experience": 344351008500
    },
    {
        "level": 2747,
        "experience": 344727622600
    },
    {
        "level": 2748,
        "experience": 345104511200
    },
    {
        "level": 2749,
        "experience": 345481674400
    },
    {
        "level": 2750,
        "experience": 345859112300
    },
    {
        "level": 2751,
        "experience": 346236825000
    },
    {
        "level": 2752,
        "experience": 346614812600
    },
    {
        "level": 2753,
        "experience": 346993075200
    },
    {
        "level": 2754,
        "experience": 347371612900
    },
    {
        "level": 2755,
        "experience": 347750425800
    },
    {
        "level": 2756,
        "experience": 348129514000
    },
    {
        "level": 2757,
        "experience": 348508877600
    },
    {
        "level": 2758,
        "experience": 348888516700
    },
    {
        "level": 2759,
        "experience": 349268431400
    },
    {
        "level": 2760,
        "experience": 349648621800
    },
    {
        "level": 2761,
        "experience": 350029088000
    },
    {
        "level": 2762,
        "experience": 350409830100
    },
    {
        "level": 2763,
        "experience": 350790848200
    },
    {
        "level": 2764,
        "experience": 351172142400
    },
    {
        "level": 2765,
        "experience": 351553712800
    },
    {
        "level": 2766,
        "experience": 351935559500
    },
    {
        "level": 2767,
        "experience": 352317682600
    },
    {
        "level": 2768,
        "experience": 352700082200
    },
    {
        "level": 2769,
        "experience": 353082758400
    },
    {
        "level": 2770,
        "experience": 353465711300
    },
    {
        "level": 2771,
        "experience": 353848941000
    },
    {
        "level": 2772,
        "experience": 354232447600
    },
    {
        "level": 2773,
        "experience": 354616231200
    },
    {
        "level": 2774,
        "experience": 355000291900
    },
    {
        "level": 2775,
        "experience": 355384629800
    },
    {
        "level": 2776,
        "experience": 355769245000
    },
    {
        "level": 2777,
        "experience": 356154137600
    },
    {
        "level": 2778,
        "experience": 356539307700
    },
    {
        "level": 2779,
        "experience": 356924755400
    },
    {
        "level": 2780,
        "experience": 357310480800
    },
    {
        "level": 2781,
        "experience": 357696484000
    },
    {
        "level": 2782,
        "experience": 358082765100
    },
    {
        "level": 2783,
        "experience": 358469324200
    },
    {
        "level": 2784,
        "experience": 358856161400
    },
    {
        "level": 2785,
        "experience": 359243276800
    },
    {
        "level": 2786,
        "experience": 359630670500
    },
    {
        "level": 2787,
        "experience": 360018342600
    },
    {
        "level": 2788,
        "experience": 360406293200
    },
    {
        "level": 2789,
        "experience": 360794522400
    },
    {
        "level": 2790,
        "experience": 361183030300
    },
    {
        "level": 2791,
        "experience": 361571817000
    },
    {
        "level": 2792,
        "experience": 361960882600
    },
    {
        "level": 2793,
        "experience": 362350227200
    },
    {
        "level": 2794,
        "experience": 362739850900
    },
    {
        "level": 2795,
        "experience": 363129753800
    },
    {
        "level": 2796,
        "experience": 363519936000
    },
    {
        "level": 2797,
        "experience": 363910397600
    },
    {
        "level": 2798,
        "experience": 364301138700
    },
    {
        "level": 2799,
        "experience": 364692159400
    },
    {
        "level": 2800,
        "experience": 365083459800
    },
    {
        "level": 2801,
        "experience": 365475040000
    },
    {
        "level": 2802,
        "experience": 365866900100
    },
    {
        "level": 2803,
        "experience": 366259040200
    },
    {
        "level": 2804,
        "experience": 366651460400
    },
    {
        "level": 2805,
        "experience": 367044160800
    },
    {
        "level": 2806,
        "experience": 367437141500
    },
    {
        "level": 2807,
        "experience": 367830402600
    },
    {
        "level": 2808,
        "experience": 368223944200
    },
    {
        "level": 2809,
        "experience": 368617766400
    },
    {
        "level": 2810,
        "experience": 369011869300
    },
    {
        "level": 2811,
        "experience": 369406253000
    },
    {
        "level": 2812,
        "experience": 369800917600
    },
    {
        "level": 2813,
        "experience": 370195863200
    },
    {
        "level": 2814,
        "experience": 370591089900
    },
    {
        "level": 2815,
        "experience": 370986597800
    },
    {
        "level": 2816,
        "experience": 371382387000
    },
    {
        "level": 2817,
        "experience": 371778457600
    },
    {
        "level": 2818,
        "experience": 372174809700
    },
    {
        "level": 2819,
        "experience": 372571443400
    },
    {
        "level": 2820,
        "experience": 372968358800
    },
    {
        "level": 2821,
        "experience": 373365556000
    },
    {
        "level": 2822,
        "experience": 373763035100
    },
    {
        "level": 2823,
        "experience": 374160796200
    },
    {
        "level": 2824,
        "experience": 374558839400
    },
    {
        "level": 2825,
        "experience": 374957164800
    },
    {
        "level": 2826,
        "experience": 375355772500
    },
    {
        "level": 2827,
        "experience": 375754662600
    },
    {
        "level": 2828,
        "experience": 376153835200
    },
    {
        "level": 2829,
        "experience": 376553290400
    },
    {
        "level": 2830,
        "experience": 376953028300
    },
    {
        "level": 2831,
        "experience": 377353049000
    },
    {
        "level": 2832,
        "experience": 377753352600
    },
    {
        "level": 2833,
        "experience": 378153939200
    },
    {
        "level": 2834,
        "experience": 378554808900
    },
    {
        "level": 2835,
        "experience": 378955961800
    },
    {
        "level": 2836,
        "experience": 379357398000
    },
    {
        "level": 2837,
        "experience": 379759117600
    },
    {
        "level": 2838,
        "experience": 380161120700
    },
    {
        "level": 2839,
        "experience": 380563407400
    },
    {
        "level": 2840,
        "experience": 380965977800
    },
    {
        "level": 2841,
        "experience": 381368832000
    },
    {
        "level": 2842,
        "experience": 381771970100
    },
    {
        "level": 2843,
        "experience": 382175392200
    },
    {
        "level": 2844,
        "experience": 382579098400
    },
    {
        "level": 2845,
        "experience": 382983088800
    },
    {
        "level": 2846,
        "experience": 383387363500
    },
    {
        "level": 2847,
        "experience": 383791922600
    },
    {
        "level": 2848,
        "experience": 384196766200
    },
    {
        "level": 2849,
        "experience": 384601894400
    },
    {
        "level": 2850,
        "experience": 385007307300
    },
    {
        "level": 2851,
        "experience": 385413005000
    },
    {
        "level": 2852,
        "experience": 385818987600
    },
    {
        "level": 2853,
        "experience": 386225255200
    },
    {
        "level": 2854,
        "experience": 386631807900
    },
    {
        "level": 2855,
        "experience": 387038645800
    },
    {
        "level": 2856,
        "experience": 387445769000
    },
    {
        "level": 2857,
        "experience": 387853177600
    },
    {
        "level": 2858,
        "experience": 388260871700
    },
    {
        "level": 2859,
        "experience": 388668851400
    },
    {
        "level": 2860,
        "experience": 389077116800
    },
    {
        "level": 2861,
        "experience": 389485668000
    },
    {
        "level": 2862,
        "experience": 389894505100
    },
    {
        "level": 2863,
        "experience": 390303628200
    },
    {
        "level": 2864,
        "experience": 390713037400
    },
    {
        "level": 2865,
        "experience": 391122732800
    },
    {
        "level": 2866,
        "experience": 391532714500
    },
    {
        "level": 2867,
        "experience": 391942982600
    },
    {
        "level": 2868,
        "experience": 392353537200
    },
    {
        "level": 2869,
        "experience": 392764378400
    },
    {
        "level": 2870,
        "experience": 393175506300
    },
    {
        "level": 2871,
        "experience": 393586921000
    },
    {
        "level": 2872,
        "experience": 393998622600
    },
    {
        "level": 2873,
        "experience": 394410611200
    },
    {
        "level": 2874,
        "experience": 394822886900
    },
    {
        "level": 2875,
        "experience": 395235449800
    },
    {
        "level": 2876,
        "experience": 395648300000
    },
    {
        "level": 2877,
        "experience": 396061437600
    },
    {
        "level": 2878,
        "experience": 396474862700
    },
    {
        "level": 2879,
        "experience": 396888575400
    },
    {
        "level": 2880,
        "experience": 397302575800
    },
    {
        "level": 2881,
        "experience": 397716864000
    },
    {
        "level": 2882,
        "experience": 398131440100
    },
    {
        "level": 2883,
        "experience": 398546304200
    },
    {
        "level": 2884,
        "experience": 398961456400
    },
    {
        "level": 2885,
        "experience": 399376896800
    },
    {
        "level": 2886,
        "experience": 399792625500
    },
    {
        "level": 2887,
        "experience": 400208642600
    },
    {
        "level": 2888,
        "experience": 400624948200
    },
    {
        "level": 2889,
        "experience": 401041542400
    },
    {
        "level": 2890,
        "experience": 401458425300
    },
    {
        "level": 2891,
        "experience": 401875597000
    },
    {
        "level": 2892,
        "experience": 402293057600
    },
    {
        "level": 2893,
        "experience": 402710807200
    },
    {
        "level": 2894,
        "experience": 403128845900
    },
    {
        "level": 2895,
        "experience": 403547173800
    },
    {
        "level": 2896,
        "experience": 403965791000
    },
    {
        "level": 2897,
        "experience": 404384697600
    },
    {
        "level": 2898,
        "experience": 404803893700
    },
    {
        "level": 2899,
        "experience": 405223379400
    },
    {
        "level": 2900,
        "experience": 405643154800
    },
    {
        "level": 2901,
        "experience": 406063220000
    },
    {
        "level": 2902,
        "experience": 406483575100
    },
    {
        "level": 2903,
        "experience": 406904220200
    },
    {
        "level": 2904,
        "experience": 407325155400
    },
    {
        "level": 2905,
        "experience": 407746380800
    },
    {
        "level": 2906,
        "experience": 408167896500
    },
    {
        "level": 2907,
        "experience": 408589702600
    },
    {
        "level": 2908,
        "experience": 409011799200
    },
    {
        "level": 2909,
        "experience": 409434186400
    },
    {
        "level": 2910,
        "experience": 409856864300
    },
    {
        "level": 2911,
        "experience": 410279833000
    },
    {
        "level": 2912,
        "experience": 410703092600
    },
    {
        "level": 2913,
        "experience": 411126643200
    },
    {
        "level": 2914,
        "experience": 411550484900
    },
    {
        "level": 2915,
        "experience": 411974617800
    },
    {
        "level": 2916,
        "experience": 412399042000
    },
    {
        "level": 2917,
        "experience": 412823757600
    },
    {
        "level": 2918,
        "experience": 413248764700
    },
    {
        "level": 2919,
        "experience": 413674063400
    },
    {
        "level": 2920,
        "experience": 414099653800
    },
    {
        "level": 2921,
        "experience": 414525536000
    },
    {
        "level": 2922,
        "experience": 414951710100
    },
    {
        "level": 2923,
        "experience": 415378176200
    },
    {
        "level": 2924,
        "experience": 415804934400
    },
    {
        "level": 2925,
        "experience": 416231984800
    },
    {
        "level": 2926,
        "experience": 416659327500
    },
    {
        "level": 2927,
        "experience": 417086962600
    },
    {
        "level": 2928,
        "experience": 417514890200
    },
    {
        "level": 2929,
        "experience": 417943110400
    },
    {
        "level": 2930,
        "experience": 418371623300
    },
    {
        "level": 2931,
        "experience": 418800429000
    },
    {
        "level": 2932,
        "experience": 419229527600
    },
    {
        "level": 2933,
        "experience": 419658919200
    },
    {
        "level": 2934,
        "experience": 420088603900
    },
    {
        "level": 2935,
        "experience": 420518581800
    },
    {
        "level": 2936,
        "experience": 420948853000
    },
    {
        "level": 2937,
        "experience": 421379417600
    },
    {
        "level": 2938,
        "experience": 421810275700
    },
    {
        "level": 2939,
        "experience": 422241427400
    },
    {
        "level": 2940,
        "experience": 422672872800
    },
    {
        "level": 2941,
        "experience": 423104612000
    },
    {
        "level": 2942,
        "experience": 423536645100
    },
    {
        "level": 2943,
        "experience": 423968972200
    },
    {
        "level": 2944,
        "experience": 424401593400
    },
    {
        "level": 2945,
        "experience": 424834508800
    },
    {
        "level": 2946,
        "experience": 425267718500
    },
    {
        "level": 2947,
        "experience": 425701222600
    },
    {
        "level": 2948,
        "experience": 426135021200
    },
    {
        "level": 2949,
        "experience": 426569114400
    },
    {
        "level": 2950,
        "experience": 427003502300
    },
    {
        "level": 2951,
        "experience": 427438185000
    },
    {
        "level": 2952,
        "experience": 427873162600
    },
    {
        "level": 2953,
        "experience": 428308435200
    },
    {
        "level": 2954,
        "experience": 428744002900
    },
    {
        "level": 2955,
        "experience": 429179865800
    },
    {
        "level": 2956,
        "experience": 429616024000
    },
    {
        "level": 2957,
        "experience": 430052477600
    },
    {
        "level": 2958,
        "experience": 430489226700
    },
    {
        "level": 2959,
        "experience": 430926271400
    },
    {
        "level": 2960,
        "experience": 431363611800
    },
    {
        "level": 2961,
        "experience": 431801248000
    },
    {
        "level": 2962,
        "experience": 432239180100
    },
    {
        "level": 2963,
        "experience": 432677408200
    },
    {
        "level": 2964,
        "experience": 433115932400
    },
    {
        "level": 2965,
        "experience": 433554752800
    },
    {
        "level": 2966,
        "experience": 433993869500
    },
    {
        "level": 2967,
        "experience": 434433282600
    },
    {
        "level": 2968,
        "experience": 434872992200
    },
    {
        "level": 2969,
        "experience": 435312998400
    },
    {
        "level": 2970,
        "experience": 435753301300
    },
    {
        "level": 2971,
        "experience": 436193901000
    },
    {
        "level": 2972,
        "experience": 436634797600
    },
    {
        "level": 2973,
        "experience": 437075991200
    },
    {
        "level": 2974,
        "experience": 437517481900
    },
    {
        "level": 2975,
        "experience": 437959269800
    },
    {
        "level": 2976,
        "experience": 438401355000
    },
    {
        "level": 2977,
        "experience": 438843737600
    },
    {
        "level": 2978,
        "experience": 439286417700
    },
    {
        "level": 2979,
        "experience": 439729395400
    },
    {
        "level": 2980,
        "experience": 440172670800
    },
    {
        "level": 2981,
        "experience": 440616244000
    },
    {
        "level": 2982,
        "experience": 441060115100
    },
    {
        "level": 2983,
        "experience": 441504284200
    },
    {
        "level": 2984,
        "experience": 441948751400
    },
    {
        "level": 2985,
        "experience": 442393516800
    },
    {
        "level": 2986,
        "experience": 442838580500
    },
    {
        "level": 2987,
        "experience": 443283942600
    },
    {
        "level": 2988,
        "experience": 443729603200
    },
    {
        "level": 2989,
        "experience": 444175562400
    },
    {
        "level": 2990,
        "experience": 444621820300
    },
    {
        "level": 2991,
        "experience": 445068377000
    },
    {
        "level": 2992,
        "experience": 445515232600
    },
    {
        "level": 2993,
        "experience": 445962387200
    },
    {
        "level": 2994,
        "experience": 446409840900
    },
    {
        "level": 2995,
        "experience": 446857593800
    },
    {
        "level": 2996,
        "experience": 447305646000
    },
    {
        "level": 2997,
        "experience": 447753997600
    },
    {
        "level": 2998,
        "experience": 448202648700
    },
    {
        "level": 2999,
        "experience": 448651599400
    },
    {
        "level": 3000,
        "experience": 449100849800
    }
    ];

