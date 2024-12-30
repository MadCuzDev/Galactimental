var ore = 0;
var tickInterval = 100;
var currentTick = 0;

var averageorePerSec = 0;

var doNotSave = false;

function update() {
    const oreDisplay = document.getElementById("ore-display");
    let oreDisplayText = `${formatNumber(ore)} Ore`;
    oreDisplay.textContent = oreDisplayText;

    const averageoreDisplay = document.getElementById("average-ore-display");
    let averageoreDisplayText = `${formatNumber(averageorePerSec)} Ore per second`;
    averageoreDisplay.textContent = averageoreDisplayText;

    const conquestDisplay = document.getElementById("conquest-display");
    let conquestProgress = ore/100;
    conquestDisplay.value = conquestProgress;
    const conquestDisplayText = document.getElementById("conquest-display-text");
    conquestDisplayText.textContent = `${Math.min(conquestProgress, 100)}%`;

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

function resetAll() {
    ore = 0;
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
        return new Intl.NumberFormat().format(number.toFixed(decimal));
    }
}

function calcPerTick() {
    const currentore = ore;

    ore+=1;

    averageorePerSec = ore - currentore;

    currentTick++;

    if (currentTick === 10) {
        currentTick = 0;
        displayorePerSec = averageorePerSec;
    }
}


const items = ['ore'];

function load() {
    items.forEach(item => {
        const value = localStorage.getItem(item);
        if (value !== null) {
            window[item] = isNaN(value) ? JSON.parse(value) : Number(value);
        }
    });

    calculateOfflineGain();
}

const intData = ['ore'];
const floatData = [];
const genericData = [];

function save() {
    if (doNotSave) return;

    [...intData, ...floatData, ...genericData].forEach(key => {
        localStorage.setItem(key, window[key]);
    });

    localStorage.setItem('last_save', Date.now());
}

function calculateOfflineGain() {
    if (localStorage.getItem('last_save')) {
        let last_save = localStorage.getItem('last_save');
        let time_elapsed = Date.now() - last_save;
        let currentOre = ore;
        for (let i = time_elapsed; i > 0; i -= 100) {
            calcPerTick();
        }

        let gain = ore - currentOre;
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