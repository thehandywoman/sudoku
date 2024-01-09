var numSelected = null;
var tileSelected = null;
var errors = 0;
var difficultyLevel = "easy"; // Domyślny poziom trudności

var board = generateRandomSudoku();
var solution = [...board.map(row => [...row])];
var playerBoard = createPlayerBoard(board, difficultyLevel);

window.onload = function () {
  addDifficultyButtons(); // Dodaj przyciski poziomów trudności
  setGame();
};

function addDifficultyButtons() {
  let difficultyContainer = document.getElementById("difficulty");

  let easyButton = document.createElement("button");
  easyButton.innerText = "Łatwy";
  easyButton.addEventListener("click", function () {
    changeDifficulty("easy");
  });
  difficultyContainer.appendChild(easyButton);

  let mediumButton = document.createElement("button");
  mediumButton.innerText = "Średni";
  mediumButton.addEventListener("click", function () {
    changeDifficulty("medium");
  });
  difficultyContainer.appendChild(mediumButton);

  let hardButton = document.createElement("button");
  hardButton.innerText = "Trudny";
  hardButton.addEventListener("click", function () {
    changeDifficulty("hard");
  });
  difficultyContainer.appendChild(hardButton);
}

function changeDifficulty(difficulty) {
  difficultyLevel = difficulty;
  resetGame(); // Zresetuj grę po zmianie poziomu trudności
}

function resetGame() {
  clearBoard();
  board = generateRandomSudoku();
  solution = [...board.map(row => [...row])];
  playerBoard = createPlayerBoard(board, difficultyLevel);
  setGame();
}

function clearBoard() {
  let boardContainer = document.getElementById("board");
  while (boardContainer.firstChild) {
    boardContainer.removeChild(boardContainer.firstChild);
  }

  let checkButtonContainer = document.getElementById("check-button-container");
  if (checkButtonContainer) {
    checkButtonContainer.remove();
  }
}

function setGame() {
  // Board 9x9
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      let tile = document.createElement("div");
      tile.id = r.toString() + "-" + c.toString();
      tile.contentEditable = playerBoard[r][c] === 0; // Ustaw wartość na edytowalną tylko dla pustych pól
      tile.innerText = playerBoard[r][c] !== 0 ? playerBoard[r][c] : ""; // Puste kratki zamiast zer
      if (playerBoard[r][c] !== 0) {
        tile.classList.add("tile-start");
      }
      if (r == 2 || r == 5) {
        tile.classList.add("horizontal-line");
      }
      if (c == 2 || c == 5) {
        tile.classList.add("vertical-line");
      }
      tile.addEventListener("click", selectTile);
      tile.addEventListener("input", inputNumber);
      tile.classList.add("tile");
      document.getElementById("board").appendChild(tile);
    }
  }

  // Dodaj kontener dla przycisku "Sprawdź"
  let checkButtonContainer = document.createElement("div");
  checkButtonContainer.id = "check-button-container";
  document.getElementById("but").appendChild(checkButtonContainer);

  // Dodaj przycisk "Sprawdź" do kontenera
  let checkButton = document.createElement("button");
  checkButton.innerText = "Sprawdź";
  checkButton.addEventListener("click", checkSolution);
  checkButton.classList.add("buttonc");
  checkButtonContainer.appendChild(checkButton);
}

function getRandomDigit() {
  return Math.floor(Math.random() * 9) + 1;
}

function generateRandomSudoku() {
  const base = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let puzzle = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));

  const shuffle = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const isUniqueSolution = grid => {
    let counter = 0;

    const solveGrid = () => {
      for (let i = 0; i < 81; i++) {
        const row = Math.floor(i / 9);
        const col = i % 9;
        if (grid[row][col] === 0) {
          shuffle(base);
          for (let b = 0; b < 9; b++) {
            const value = base[b];
            if (
              !grid[row].includes(value) &&
              ![grid[0][col], grid[1][col], grid[2][col], grid[3][col], grid[4][col], grid[5][col], grid[6][col], grid[7][col], grid[8][col]].includes(value) &&
              ![...grid.slice(row - (row % 3), row - (row % 3) + 3).map(row => row.slice(col - (col % 3), col - (col % 3) + 3))].flat().includes(value)
            ) {
              grid[row][col] = value;
              if (checkGrid(grid)) {
                counter += 1;
                if (counter > 1) return false;
                break;
              } else {
                if (!solveGrid()) return false;
                grid[row][col] = 0;
              }
            }
          }
          break;
        }
      }
      return true;
    };

    shuffle([...Array(81).keys()]);

    for (let i = 0; i < 81; i++) {
      const row = Math.floor(i / 9);
      const col = i % 9;
      const temp = grid[row][col];
      grid[row][col] = 0;
      if (!solveGrid()) {
        grid[row][col] = temp;
      }
    }

    return grid;
  };

  while (!isUniqueSolution(puzzle)) {
    puzzle = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
  }

  return puzzle;
}

function checkGrid(grid) {
  const isValidRow = row => new Set(row).size === 9 && !row.includes(0);

  const isValidColumn = (grid, col) => {
    const column = grid.map(row => row[col]);
    return new Set(column).size === 9 && !column.includes(0);
  };

  const isValidSubgrid = (grid, startRow, startCol) => {
    const values = new Set();
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const value = grid[startRow + row][startCol + col];
        if (values.has(value) || value === 0) {
          return false;
        }
        values.add(value);
      }
    }
    return true;
  };

  for (let i = 0; i < 9; i++) {
    if (!isValidRow(grid[i]) || !isValidColumn(grid, i)) {
      return false;
    }
  }

  for (let startRow = 0; startRow < 9; startRow += 3) {
    for (let startCol = 0; startCol < 9; startCol += 3) {
      if (!isValidSubgrid(grid, startRow, startCol)) {
        return false;
      }
    }
  }

  return true;
}

function selectNumber() {
  if (numSelected !== null) {
    numSelected.classList.remove("number-selected");
  }
  numSelected = this;
  numSelected.classList.add("number-selected");
}

function selectTile() {
  if (numSelected) {
    if (this.innerText !== "") {
      return;
    }

    let coords = this.id.split("-");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    if (playerBoard[r][c] == 0 || playerBoard[r][c] == numSelected.id) {
      this.innerText = numSelected.id;
      playerBoard[r][c] = parseInt(numSelected.id);
    } else {
      errors += 1;
      document.getElementById("errors").innerText = errors;
    }
  }
}

function inputNumber(event) {
  let inputValue = event.target.innerText;
  let coords = event.target.id.split("-");
  let r = parseInt(coords[0]);
  let c = parseInt(coords[1]);

  if (!isValidInput(inputValue)) {
    // Jeśli wartość nie jest cyfrą, zresetuj pole
    event.target.innerText = "";
    playerBoard[r][c] = 0;
  } else {
    playerBoard[r][c] = parseInt(inputValue);
  }
}

function isValidInput(value) {
  // Sprawdź, czy wartość jest cyfrą od 1 do 9
  return /^\d$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 9;
}

function createPlayerBoard(board, difficulty) {
  const playerBoard = board.map(row => row.slice());

  switch (difficulty) {
    case "easy":
      hideNumbers(playerBoard, 25);
      break;
    case "medium":
      hideNumbers(playerBoard, 50);
      break;
    case "hard":
      hideNumbers(playerBoard, 70);
      break;
    default:
      break;
  }

  return playerBoard;
}

function hideNumbers(board, numberOfHiddenNumbers) {
  for (let i = 0; i < numberOfHiddenNumbers; i++) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    board[row][col] = 0;
  }
}

function getUserBoard() {
  const userBoard = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      let tile = document.getElementById(r + "-" + c);
      userBoard[r][c] = tile.innerText !== "" ? parseInt(tile.innerText) : 0;
    }
  }
  return userBoard;
}

function compareBoards(board1, board2) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board1[r][c] !== board2[r][c]) {
        return false;
      }
    }
  }
  return true;
}

function checkSolution() {
  let userBoard = getUserBoard();
  let errors = 0;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (userBoard[r][c] !== solution[r][c]) {
        errors += 1;
      }
    }
  }

  if (errors > 0) {
    // Zwiększ licznik błędów tylko, jeśli istnieją błędy
    document.getElementById("errors").innerText = parseInt(document.getElementById("errors").innerText) + 1;
  }

  if (errors === 0 && compareBoards(userBoard, solution)) {
    alert("Rozwiązanie poprawne!");
  } else {
    alert("Rozwiązanie błędne.");
  }
}


function getUserBoard() {
  const userBoard = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      let tile = document.getElementById(r + "-" + c);
      userBoard[r][c] = tile.innerText !== "" ? parseInt(tile.innerText) : 0;
    }
  }
  return userBoard;
}
function compareBoards(board1, board2) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board1[r][c] !== board2[r][c]) {
        return false;
      }
    }
  }
  return true;
}

function checkSolution() {
  let userBoard = getUserBoard();
  let errors = 0;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (userBoard[r][c] !== solution[r][c]) {
        errors += 1;
      }
    }
  }

  if (errors > 0) {
    // Zwiększ licznik błędów tylko, jeśli istnieją błędy
    document.getElementById("errors").innerText = parseInt(document.getElementById("errors").innerText) + 1;
  }

  if (errors === 0 && compareBoards(userBoard, solution)) {
    alert("Rozwiązanie poprawne!");
  } else {
    alert("Rozwiązanie błędne.");
  }
}
