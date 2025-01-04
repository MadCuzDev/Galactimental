import { gameData } from "./data.js";

const cooldowns = {
    mine: 0,
    satellite: 0,
    probe: 0,
    colony: 0
};

const intervals = {
    mine: null,
    satellite: null,
    probe: null,
    colony: null
};

const upgrades = {
    // Cost, Delay
    mine: [0, 3],
    satellite: [30, 2],
    probe: [500, 20],
    colony: [5000, 30],
};

const ships = {
    // Research value, land value
    satellite: [1, 0],
    probe: [10, 0],
    colony: [10, 1],
}

const tickInterval = 100;
let currentTick = 0;

let averageOrePerSec = 0;
let displayOrePerSec = 0;

let doNotSave = false;
let hasHadPopup = false;

let statDisplay = null;
let conquestDisplay = null;
let conquestDisplayText = null;
let missionLog = null;

function update() {
    let statDisplayText = `${formatNumber(gameData["ore"])} Ore\r\n`;
    statDisplayText += `${formatNumber(displayOrePerSec)} Ore per second\r\n\r\n`;
    statDisplayText += `${formatNumber(gameData["mine"])} Mines\r\n\r\n`;
    statDisplayText += `${formatNumber(gameData["land"])} Land\r\n\r\n`;
    statDisplayText += `${formatNumber(gameData["satellite"])} Satellites\r\n`;
    statDisplayText += `${formatNumber(gameData["probe"])} Probes\r\n`;
    statDisplayText += `${formatNumber(gameData["colony"])} Colony Ships\r\n\r\n`;
    statDisplayText += `${formatNumber(gameData["research"])} Research`;
    statDisplay.textContent = statDisplayText;

    let conquestProgress = gameData["land"] / 10;
    conquestDisplay.value = conquestProgress;
    conquestDisplayText.textContent = `${Math.min(conquestProgress, 100)}%`;

    if (!hasHadPopup && conquestDisplay.value >= 100) {
        hasHadPopup = true;
        // hopefully add better ending because this isn't great
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
    if (cooldowns[upgradeName] === 0 && gameData["ore"] >= upgrades[upgradeName][0]) {
        gameData[upgradeName]++;
        gameData["ore"] -= upgrades[upgradeName][0];
        intervals[upgradeName] = setInterval(function () {
            cooldownInterval(upgradeName)
        }, 1000);
        cooldowns[upgradeName] = upgrades[upgradeName][1];
        formatButton(upgradeName);
    }
}

function launchShip(shipName) {
    if (gameData[shipName] > 0) {
        const tempCount = gameData[shipName];
        const researchCount = gameData[shipName] * ships[shipName][0];
        const landCount = gameData[shipName] * ships[shipName][1];
        setTimeout(function () {
            gameData["research"] += researchCount;
            gameData["land"] += landCount;
            missionLog.textContent += `${tempCount} ${shipName === "colony" ? "colony ship" : shipName}s returned with ${researchCount} research`;
            if (landCount > 0) missionLog.textContent += ` and ${landCount} land\r\n`;
            else missionLog.textContent += `\r\n`;
        }, 20000);
        gameData[shipName] = 0;
    }
}

function formatButton(name) {
    switch (name) {
        case "mine":
            document.getElementById("mine-button").textContent = `build mine\r\n1 ore per second\r\nCooldown: ${cooldowns[name]}s`;
            break;
        case "satellite":
            document.getElementById("satellite-button").textContent = `build satellite - cost: ${upgrades[name][0]} ore\r\ncollects research around planet\r\nCooldown: ${cooldowns[name]}s`;
            break;
        case "probe":
            document.getElementById("probe-button").textContent = `build probe - cost: ${upgrades[name][0]} ore\r\ncollects more research in nearby outer space\r\nCooldown: ${cooldowns[name]}s`;
            break
        case "colony":
            document.getElementById("colony-button").textContent = `build colony ship - cost: ${upgrades[name][0]} ore\r\ncolonizes land and much more research in nearby outer space\r\nCooldown: ${cooldowns[name]}s`;
            break
    }
}

function cooldownInterval(name) {
    cooldowns[name]--;
    formatButton(name);
    if (cooldowns[name] === 0) clearInterval(intervals[name]);
}

function resetAll() {
    doNotSave = true;
    localStorage.clear();
    location.reload();
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

    gameData["ore"] += 0.1 * gameData["mine"];

    currentTick++;

    // Calculate average ore gains
    averageOrePerSec += gameData["ore"] - currentOre;

    if (currentTick === 10) {
        currentTick = 0;
        displayOrePerSec = averageOrePerSec;

        averageOrePerSec = 0;
    }
}

function scriptLoader(path, callback)
{
    let script = document.createElement('script');
    script.type = "text/javascript";
    script.async = true;
    script.src = path;
    script.onload = function(){
        if(typeof(callback) == "function")
        {
            callback();
        }
    }
    try
    {
        let scriptOne = document.getElementsByTagName('script')[0];
        scriptOne.parentNode.insertBefore(script, scriptOne);
    }
    catch(e)
    {
        document.getElementsByTagName("head")[0].appendChild(script);
    }
}

function load() {
    // Load JS files
    scriptLoader("data.js")

    //idk
    window.changeTab = changeTab;
    window.purchaseUpgrade = purchaseUpgrade;
    window.launchShip = launchShip;

    // Load displays
    statDisplay = document.getElementById("stat-display");
    conquestDisplay = document.getElementById("conquest-display");
    conquestDisplayText = document.getElementById("conquest-display-text");
    missionLog = document.getElementById("mission-log");

    // Load data from local storage
    Object.keys(gameData).forEach(key => {
        gameData[key] = +localStorage.getItem(key);
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
        const time_elapsed = Date.now() - localStorage.getItem('last_save');
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