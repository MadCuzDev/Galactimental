const gameData = {
    ore: 0,
    mines: 0,
    satellites: 0,
    research: 0
};

const tickInterval = 100;
let currentTick = 0;

let mineIncreaseCooldown = 0;
let mineInterval = null;

let satelliteIncreaseCooldown = 0;
let satelliteInterval = null;

let averageOrePerSec = 0;
let displayOrePerSec = 0;

let doNotSave = false;
let hasHadPopup = false;

function update() {
    const statDisplay = document.getElementById("stat-display");
    let statDisplayText = `${formatNumber(gameData["ore"])} Ore\r\n`;
    statDisplayText += `${formatNumber(displayOrePerSec)} Ore per second\r\n\r\n`;
    statDisplayText += `${formatNumber(gameData["mines"])} Mines\r\n\r\n`;
    statDisplayText += `${formatNumber(gameData["satellites"])} Satellites`;
    statDisplay.textContent = statDisplayText;

    const conquestDisplay = document.getElementById("conquest-display");
    let conquestProgress = gameData["ore"]/100;
    conquestDisplay.value = conquestProgress;
    const conquestDisplayText = document.getElementById("conquest-display-text");
    conquestDisplayText.textContent = `${Math.min(conquestProgress, 100)}%`;

    if (!hasHadPopup && conquestDisplay.value >= 100) {
        hasHadPopup = true;
        alert("It wasn’t until we captured one of them alive that we realized the truth. Underneath the armor and the strange language, they spoke our words, our history—humans, displaced, survivors of something we couldn't even imagine. The technology, the ships, the weapons—those were all just tools for survival, nothing more.");
        alert("I’ve been fighting them for so long, convinced they were aliens, but the truth is they were just people—people like us. Their strange appearance, their unfamiliar ways, they were just different, not dangerous. All this time, I was the real threat, and now it’s too late to take it back.");
    }


    requestAnimationFrame(update);
}

// Controls the navigation tabs
function changeTab(event, tabName) {
    let i, tabs, buttons;
    tabs = document.getElementsByClassName("tab");
    for (i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none";
    }
    buttons = document.getElementsByClassName("tab-button");
    for (i = 0; i < buttons.length; i++) {
        buttons[i].className = buttons[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}

function purchaseUpgrade(upgradeName) {
    switch (upgradeName) {
        case "mine":
            if (mineIncreaseCooldown === 0) {
                gameData["mines"]++;
                mineInterval = setInterval(mineCooldown, 1000);
                mineIncreaseCooldown = 3;
                document.getElementById("mine-button").textContent = `build mine\r\n1 ore per second\r\nCooldown: ${mineIncreaseCooldown}s`;
            }
            break;
        case "satellite":
            if (satelliteIncreaseCooldown === 0) {
                gameData["satellites"]++;
                satelliteInterval = setInterval(satelliteCooldown, 1000);
                satelliteIncreaseCooldown = 2;
                document.getElementById("satellite-button").textContent = `build satellite - cost: 30 ore\r\ncollects research around planet\r\nCooldown: ${satelliteIncreaseCooldown}s`;
            }
            break;
    }
}

function launchShip(shipName) {
    switch (shipName) {
        case "satellite":
            if (gameData["satellites"] > 0) {
                setTimeout(function () {
                    gameData["research"]+=gameData["satellites"];
                    document.getElementById("mission-log").textContent += `Satellites returned with ${gameData["satellites"]} research`;
                }, 20000);
                gameData["satellites"] = 0;
            }
            break;
    }
}

function mineCooldown() {
    mineIncreaseCooldown--;
    document.getElementById("mine-button").textContent = `build mine\r\n1 ore per second\r\nCooldown: ${mineIncreaseCooldown}s`;
    if (mineIncreaseCooldown === 0) clearInterval(mineInterval);
}

function satelliteCooldown() {
    satelliteIncreaseCooldown--;
    document.getElementById("satellite-button").textContent = `build satellite - cost: 30 ore\r\ncollects research around planet\r\nCooldown: ${satelliteIncreaseCooldown}s`;
    if (satelliteIncreaseCooldown === 0) clearInterval(satelliteInterval);
}

function resetAll() {
    gameData["ore"] = 0;
    gameData["mines"] = 0;
    gameData["satellites"] = 0;
    gameData["research"] = 0;
    localStorage.clear();
}

function backgroundLoop() {
    setInterval(function () {
        calcPerTick();
    }, tickInterval);
}

function formatNumber(number, decimal = 2) {
    if (number.toFixed(0).toString().length > 9) {
        return number.toExponential(decimal);
    } else {
        return new Intl.NumberFormat().format(number.toFixed(0));
    }
}

function calcPerTick() {
    const currentOre = gameData["ore"];

    gameData["ore"]+=0.1*gameData["mines"];

    averageOrePerSec += gameData["ore"] - currentOre;

    currentTick++;

    if (currentTick === 10) {
        currentTick = 0;
        displayOrePerSec = averageOrePerSec;

        averageOrePerSec = 0;
    }
}

function load() {
    Object.keys(gameData).forEach(key => {
        gameData[key] = +localStorage.getItem(key) || 0; // Default to 0 if no data exists
    });
    calculateOfflineGain();
}

function save() {
    if (doNotSave) return;

    Object.keys(gameData).forEach(key => {
        localStorage.setItem(key, gameData[key]);
    });
    localStorage.setItem('last_save', Date.now());
}

function calculateOfflineGain() {
    if (localStorage.getItem('last_save')) {
        let last_save = localStorage.getItem('last_save');
        let time_elapsed = Date.now() - last_save;
        let currentOre = gameData["ore"];
        for (let i = time_elapsed; i > 0; i -= 100) {
            calcPerTick();
        }

        let gain = gameData["ore"] - currentOre;
        alert("You have made " + gain.toFixed(2) + " ore offline");


    }
}

// Save/Load system for ore
window.onbeforeunload = function (event) {
    save();
}

document.addEventListener("DOMContentLoaded", function () {
    load();
    backgroundLoop();
    update();
    document.getElementById("defaultTab").click();
});