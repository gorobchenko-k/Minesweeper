"use strict";
const numberColor = {
    '1': '#0000ff',
    '2': '#00ff00',
    '3': '#ff0000',
    '4': '#7100a5',
    '5': '#880020',
    '6': '#00b3aa',
    '7': '#000000',
    '8': '#4a4a4a',
};

const emojiCode = {
    'emojiBasic': 128578,
    'emojiMousedown': 128562,
    'emojiWinner': 128526,
    'emojiLoser': 128542,
    'emojiBomb': 128163,
    'emojiFlag': 128681,
    'emojiQuestionMark': 10068,
};

const width = 16;
const height = 16;
const bombsCount = 40;

const field = document.querySelector('.game__field');
const bombCounter = document.querySelector(".game__counter");
const currentTimeCounter = document.querySelector(".game__current-time");
const emoji = document.querySelector('.game__emoji');
const cellsCount = width * height;
let timerID;
let cells;
let closedCellsCount;
let bombs;
let selectedBombs;

function initializeGame() {
    field.addEventListener("click", clickFirstTime);
    field.innerHTML = '<button class="game__cell game-button"></button>'.repeat(cellsCount);
    cells = [...field.children];
    bombCounter.textContent = bombsCount.toString().padStart(3, "0");
    emoji.addEventListener("click", restartGame);
    emoji.innerHTML = '&#128578;';
    currentTimeCounter.innerHTML = '000';
    closedCellsCount = cellsCount;
    selectedBombs = [];
    fieldClickHandlers();
}

function clickFirstTime(e) {
    startGame(e.target);
    field.removeEventListener("click", clickFirstTime);
}

function restartGame() {
    stopGame();
    initializeGame();
}

function startGame(firstClickedCell) {
    function setCurrentTime() {
        currentTime += 1;
        currentTimeCounter.innerHTML = currentTime.toString().padStart(3, "0");
        timerID = setTimeout(setCurrentTime, 1000);
    }

    const cellIndex = cells.indexOf(firstClickedCell);
    let currentTime = 0;
    setBombs(cellIndex);
    setCurrentTime();
}

function fieldClickHandlers() {
    field.addEventListener("click", fieldClickHandler);
    field.addEventListener("mousedown", fieldMousedownHandler);
    field.addEventListener("mouseup", fieldMouseupHandler);
    field.addEventListener("contextmenu", fieldContextMenuHandler);
}

function removeFieldClickHandlers() {
    field.removeEventListener("click", fieldClickHandler);
    field.removeEventListener("mousedown", fieldMousedownHandler);
    field.removeEventListener("mouseup", fieldMouseupHandler);
    field.removeEventListener("contextmenu", fieldContextMenuHandler);
}

function fieldClickHandler(e) {
    const cell = e.target;
    if (cell.classList.contains('game__cell')) {
        const cellIndex = cells.indexOf(cell);
        const [row, column] = getRowAndColumn(cellIndex);
        openCell(row, column);
    }
}

function fieldMousedownHandler(e) {
    setEmoji(e, emojiCode.emojiMousedown);
}

function fieldMouseupHandler(e) {
    setEmoji(e, emojiCode.emojiBasic);
}

function fieldContextMenuHandler(e) {
    if (e.button !== 2) return;
    e.preventDefault();
    const cell = e.target;
    if (cell.classList.contains('game__cell')) {
        if (cell.innerHTML.codePointAt(0) === emojiCode.emojiQuestionMark) {
            cell.innerHTML = '';
            return;
        }

        if (cell.innerHTML.codePointAt(0) === emojiCode.emojiFlag) {
            const cellIndex = cells.indexOf(cell);
            selectedBombs.splice(selectedBombs.indexOf(cellIndex), 1);
            cell.innerHTML = `&#${emojiCode.emojiQuestionMark};`;
        }

        if (cell.innerHTML === '' && selectedBombs.length < bombsCount) {
            const cellIndex = cells.indexOf(cell);
            selectedBombs.push(cellIndex);
            cell.innerHTML = `&#${emojiCode.emojiFlag};`;
        }

        bombCounter.innerHTML = (bombsCount - selectedBombs.length).toString().padStart(3, "0");
    }
}

function setEmoji(e, emojiCode) {
    const cell = e.target;
    if (cell.classList.contains('game__cell')) {
        emoji.innerHTML = `&#${emojiCode};`;
    }
}

function setBombs(cellIndex) {
    bombs = [...Array(cellsCount).keys()].sort(() => Math.random() - 0.5);
    bombs.splice(bombs.indexOf(cellIndex), 1);
    bombs = bombs.slice(0, bombsCount);
}

function openCell(row, column) {
    if (!isValid(row, column)) return;

    const cellIndex = row * width + column;
    const cell = cells[cellIndex];

    if (cell.disabled === true) return;

    cell.disabled = true;

    closedCellsCount--;

    if (isWin(cellIndex)) return;

    if (isLoss(cellIndex)) return;

    showCountBombsAroundCell(cellIndex);
}

function isWin(cellIndex) {
    if (closedCellsCount <= bombsCount) {
        showCountBombsAroundCell(cellIndex);
        emoji.innerHTML = `&#${emojiCode.emojiWinner};`;
        stopGame();
        return true;
    }
}

function isLoss(cellIndex) {
    const [row, column] = getRowAndColumn(cellIndex);
    const cell = cells[cellIndex];
    if (isBomb(row, column)) {
        cell.innerHTML = `&#${emojiCode.emojiBomb};`;
        cell.style.background = 'red';
        emoji.innerHTML = `&#${emojiCode.emojiLoser};`;
        showMapBombs();
        stopGame();
        return true;
    }
}

function isBomb(row, column) {
    if (!isValid(row, column)) return false;
    const cellIndex = row * width + column;
    return bombs.includes(cellIndex);
}

function showCountBombsAroundCell(cellIndex) {
    const [row, column] = getRowAndColumn(cellIndex);
    const cell = cells[cellIndex];
    const countBombs = getCountBombsAroundCell(row, column);
    if (countBombs !== 0) {
        cell.style.color = numberColor[countBombs];
        cell.innerHTML = countBombs;
        return;
    }
    for (let x = -1; x < 2; x++) {
        for (let y = -1; y < 2; y++) {
            openCell(row + y, column + x);
        }
    }
}

function getCountBombsAroundCell(row, column) {
    let countBombs = 0;
    for (let x = -1; x < 2; x++) {
        for (let y = -1; y < 2; y++) {
            if (isBomb(row + y, column + x)) {
                countBombs++;
            }
        }
    }
    return countBombs;
}

function isValid(row, column) {
    return row >= 0 && row < height && column >= 0 && column < width;
}

function showMapBombs() {
    bombs.forEach(cellIndex => cells[cellIndex].innerHTML = `&#${emojiCode.emojiBomb};`);
    selectedBombs.forEach(cellIndex => {
        const [row, column] = getRowAndColumn(cellIndex);
        if (isBomb(row, column)) {
            cells[cellIndex].innerHTML = `&#${emojiCode.emojiFlag};`
        } else {
            cells[cellIndex].innerHTML = `&#${emojiCode.emojiBomb};`
            cells[cellIndex].classList.add('notBomb');
        }
    });
}

function getRowAndColumn(cellIndex) {
    const row = Math.floor(cellIndex / width);
    const column = cellIndex % width;
    return [row, column];
}

function stopGame() {
    clearTimeout(timerID);
    removeFieldClickHandlers();
}

initializeGame();