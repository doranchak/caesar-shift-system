const MAX_SKIPPED_COLUMNS = 10;
const MAX_SAME_COLUMN = 10;
const MAX_SKIPPED_LETTERS = 1;
const WEIGHT_SKIPPED_COLUMNS = 1;
const WEIGHT_SAME_COLUMN = 1;
const SHOW_INTERMEDIATE = false;

const doSearchKeyword = (word, columns) => {
  let matches = [];
  for (let startcol = 0; startcol < columns.length - word.length + 1; startcol++) {
    let match = [];
    for (let i=0; i<word.length; i++) {
      let col = startcol+i;
      let ind = columns[col].indexOf(word[i]);
      if (ind == -1) {
        match = [];
        break;
      }
      match.push([ind, col]);
    }
    if (match.length > 0) {
      matches.push(match);
    }
  }
  return matches;
}

// returns true once a match is found
const doSearchKeywordFuzzy = (state, maxskip) => {
  let rows = state.columns[0].length;
  let cols = state.columns.length;
  if (!('visited' in state)) {
    // init
    state.penaltySkippedColumns = 0; // goes up if we skip columns
    state.penaltySameColumn = 0; // goes up if we had to match a letter in the same column
    state.penaltySkippedLetters = 0; // goes up if we had to skip letters in the search term
    // state.currentColumn = 0; // current column position in the grid
    state.startColumn = state.currentColumn; // preserve the initial column invoked by the caller
    state.currentLetter = 0; // current position in the search term
    state.currentMatch = ""; // partial match so far
    state.matchCount = 0;  // number of letter matches
    state.currentPositions = []; // current positions found so far
    state.visited = []; // to mark visited positions in the grid
    // if (!('bestScore' in state)) state.bestScore = Number.MAX_SAFE_INTEGER;
    for (let row=0; row<rows; row++) {
      state.visited[row] = [];
      for (let col=0; col<cols; col++) {
        state.visited[row][col] = 0;
      }
    }
  }
  // check termination conditions
  if (state.penaltySkippedColumns > MAX_SKIPPED_COLUMNS) return false; // too many skipped columns
  if (state.penaltySameColumn > MAX_SAME_COLUMN) return false; // too many shared columns
  if (state.penaltySkippedLetters > maxskip) return false; // too many skipped letters
  if (SHOW_INTERMEDIATE && (state.currentMatch == state.keyword || state.currentMatch.length == state.keyword.length - state.penaltySkippedLetters))
    console.log(" - intermediate hit:", state.keyword.length, state.keyword, score(state), state.penaltySkippedColumns, state.penaltySameColumn, state.penaltySkippedLetters);
    
  if (score(state) >= state.bestScore) return false; // we already exceeded the best score seen
  
  if (state.currentMatch == state.keyword || state.currentMatch.length == state.keyword.length - state.penaltySkippedLetters) {
    state.bestScore = score(state);
    state.bestState = null;
    state.bestState = JSON.parse(JSON.stringify(state));
  }
  if (state.currentColumn >= state.columns.length) return false;
  if (state.currentLetter >= state.keyword.length) return false;

  // look for current letter in current column.
  for (let row=0; row<rows; row++) {
    if (state.columns[state.currentColumn][row] == state.keyword[state.currentLetter]) {
      // found match, so continue to next column and next letter.
      state.currentMatch += state.keyword[state.currentLetter];
      state.matchCount++;
      state.currentPositions.push([row, state.currentColumn]);
      state.visited[row][state.currentColumn] = 1;
      state.currentColumn++;
      state.currentLetter++;
      doSearchKeywordFuzzy(state, maxskip);
      undoStep(state, row);
    }
  }
  // not found, so skip to next column and add to penalty.
  // (but not if we are on the very first column of the search)
  if (state.startColumn != state.currentColumn) {
    state.penaltySkippedColumns++;
    state.currentColumn++;
    doSearchKeywordFuzzy(state, maxskip);
    state.penaltySkippedColumns--;
    state.currentColumn--;
  }

  // not found, so return to last matched column and look for letter in unvisited spot
  if (state.currentColumn > 0 && state.currentColumn > state.startColumn) {
    state.currentColumn--;
    for (let row=0; row<rows; row++) {
      if (state.visited[row][state.currentColumn]) continue;
      if (state.columns[state.currentColumn][row] == state.keyword[state.currentLetter]) {
        state.currentMatch += state.keyword[state.currentLetter];
        state.matchCount++;
        state.currentPositions.push([row, state.currentColumn]);
        state.visited[row][state.currentColumn] = 1;
        state.currentColumn++;
        state.currentLetter++;
        state.penaltySameColumn++;
        doSearchKeywordFuzzy(state, maxskip);
        undoStep(state, row);
        state.penaltySameColumn--;
      }
    }
    state.currentColumn++;
  }

  // still not found, so try skipping a letter of the search term
  state.penaltySkippedLetters++;
  state.currentLetter++;
  doSearchKeywordFuzzy(state, maxskip);
  state.penaltySkippedLetters--;
  state.currentLetter--;
  // updateGrid(plaintext, k, n, start, []);
  return false;
}

function score(result) {
  return WEIGHT_SKIPPED_COLUMNS*result.penaltySkippedColumns + WEIGHT_SAME_COLUMN*result.penaltySameColumn;
}

const undoStep = (state, row) => {
  state.currentColumn--;
  state.currentLetter--;
  state.currentMatch = state.currentMatch.substring(0, state.currentMatch.length - 1);
  state.currentPositions.pop();
  state.visited[row][state.currentColumn] = 0;
  state.matchCount--;
}

function columnsFrom(theGrid) {
  let arr = [];
  for (let col=1; col<theGrid[0].length; col++) {
    let str = "";
    for (let row=0; row<theGrid.length; row++) {
      str += theGrid[row][col];
    }
    arr.push(str);
  }
  return arr;
}

function createGrid(plaintext, k, n, start) {
  const grid = [];
  let rows = n;
  let cols = plaintext.length + 1;  
  for (let i = rows-1; i >= 0; i--) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      let shift = start + k*i;
      if (j == 0) {
        let prefix = "";
        if (shift > 0) prefix = "+";
        row.push(prefix + shift); // shift value
      }
      else row.push(caesarShift(plaintext[j-1], shift)); 
    }
    grid.push(row);
  }
  return grid;
};

/* shift values don't use a fixed interval.  include 0 for the home/reference (unshifted) line */
function createGridStatic(plaintext, shifts) {
  const grid = [];
  let cols = plaintext.length + 1;  
  for (let i = 0; i<shifts.length; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      let shift = shifts[i];
      if (j == 0) {
        let prefix = "";
        if (shift > 0) prefix = "+";
        row.push(prefix + shift); // shift value
      }
      else row.push(caesarShift(plaintext[j-1], shift)); 
    }
    grid.push(row);
  }
  return grid;
};

function caesarShift(ch, num) {
  let val = ch.charCodeAt(0) - 65 + num;
  while (val < 0) val += 26;
  val %= 26;
  return String.fromCharCode(val + 65);
}

export {doSearchKeyword, doSearchKeywordFuzzy, undoStep, columnsFrom, createGrid, createGridStatic, caesarShift, MAX_SKIPPED_LETTERS};
