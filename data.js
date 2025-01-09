export const gameData = {
    ore: 0,
    mine: 0,
    land: 0,
    satellite: 0,
    research: 0,
    probe: 0,
    colony: 0,
    research_ore_increase: 0
};

export const cooldowns = {
    mine: 0,
    satellite: 0,
    probe: 0,
    colony: 0
};

export const intervals = {
    mine: null,
    satellite: null,
    probe: null,
    colony: null
};

export const upgrades = {
    // Delay, Ore Cost, Research Cost
    mine: [3, 0, 0],
    satellite: [2, 30, 0],
    probe: [20, 500, 0],
    colony: [30, 5000, 0],
    research_ore_increase: [0, 0, 10]
};

export const ships = {
    // Research value, land value
    satellite: [1, 0],
    probe: [10, 0],
    colony: [10, 1]
}

export let factories = {
    // Level, Quantity
    mine: [],
    satellite: [],
    probe: [],
    colony: []
}

let doNotSave = false;

export function resetAll() {
    doNotSave = true;
    localStorage.clear();
    location.reload();
}

export function loadData() {
    // Load data from local storage
    factories = JSON.parse(localStorage.getItem("factories"));

    Object.keys(gameData).forEach(key => {
        gameData[key] = +localStorage.getItem(key);
    });
}

function saveData() {
    if (doNotSave) return;

    localStorage.setItem("factories", JSON.stringify(factories));

    Object.keys(gameData).forEach(key => {
        localStorage.setItem(key, gameData[key]);
    });
    localStorage.setItem("last_save", Date.now());
}

window.onbeforeunload = function() {
    saveData();
}