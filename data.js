export const gameData = {
    ore: 0,
    mine: 0,
    land: 0,
    satellite: 0,
    research: 0,
    probe: 0,
    colony: 0
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
    // Cost, Delay
    mine: [0, 3],
    satellite: [30, 2],
    probe: [500, 20],
    colony: [5000, 30]
};

export const ships = {
    // Research value, land value
    satellite: [1, 0],
    probe: [10, 0],
    colony: [10, 1]
}

let doNotSave = false;

export function resetAll() {
    doNotSave = true;
    localStorage.clear();
    location.reload();
}

export function loadData() {
    // Load data from local storage
    Object.keys(gameData).forEach(key => {
        gameData[key] = +localStorage.getItem(key);
    });
}

function saveData() {
    if (doNotSave) return;

    Object.keys(gameData).forEach(key => {
        localStorage.setItem(key, gameData[key]);
    });
    localStorage.setItem('last_save', Date.now());
}

window.onbeforeunload = function() {
    saveData();
}