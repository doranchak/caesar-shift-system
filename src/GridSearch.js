const MAX_SKIPPED_COLUMNS = 10;
const MAX_SAME_COLUMN = 10;
const MAX_SKIPPED_LETTERS = 1;

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

// TODO: bug: JARLVANEYCKE 

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
    for (let row=0; row<rows; row++) {
      state.visited[row] = [];
      for (let col=0; col<cols; col++) {
        state.visited[row][col] = 0;
      }
    }
  }
  // check termination conditions
  if (state.penaltySkippedColumns > MAX_SKIPPED_COLUMNS) return false;
  if (state.penaltySameColumn > MAX_SAME_COLUMN) return false;
  if (state.penaltySkippedLetters > maxskip) return false;
  
  if (state.currentMatch == state.keyword || state.currentMatch.length == state.keyword.length - state.penaltySkippedLetters) {
    // console.log("SUCCESS! ", state);
    // updateGrid(plaintext, k, n, start, state.currentPositions);
    // TODO: calculate penaltySameColumn
    return true;
  }
  if (state.currentColumn >= state.columns.length) return false;
  if (state.currentLetter >= state.keyword.length) return false;

  // look for current letter in current column.
  for (let row=0; row<rows; row++) {
    if (state.columns[state.currentColumn][row] == state.keyword[state.currentLetter]) {
      // found match, so continue to next column and next letter.
      // console.log("matched a letter", state.keyword[state.currentLetter]);
      state.currentMatch += state.keyword[state.currentLetter];
      state.matchCount++;
      state.currentPositions.push([row, state.currentColumn]);
      state.visited[row][state.currentColumn] = 1;
      state.currentColumn++;
      state.currentLetter++;
      if (doSearchKeywordFuzzy(state, maxskip)) {
        return true;
      }
      undoStep(state, row);
    }
  }
  // not found, so skip to next column and add to penalty.
  // (but not if we are on the very first column of the search)
  if (state.startColumn != state.currentColumn) {
    state.penaltySkippedColumns++;
    state.currentColumn++;
    // console.log("skipping a column");
    if (doSearchKeywordFuzzy(state, maxskip)) {
      return true;
    }
    state.penaltySkippedColumns--;
    state.currentColumn--;
  }

  // not found, so return to last matched column and look for letter in unvisited spot
  if (state.currentColumn > 0) {
    // console.log("trying same column again");
    state.currentColumn--;
    for (let row=0; row<rows; row++) {
      if (state.visited[row][state.currentColumn]) continue;
      // TODO: "KACZYNSKI" search breaks at next line
      if (state.columns[state.currentColumn][row] == state.keyword[state.currentLetter]) {
        // console.log("found another letter in same column", state.keyword[state.currentLetter]);
        state.currentMatch += state.keyword[state.currentLetter];
        state.matchCount++;
        state.currentPositions.push([row, state.currentColumn]);
        state.visited[row][state.currentColumn] = 1;
        state.currentColumn++;
        state.currentLetter++;
        state.penaltySameColumn++;
        if (doSearchKeywordFuzzy(state, maxskip)) {
          return true;
        }
        undoStep(state, row);
        state.penaltySameColumn--;
      }
    }
    state.currentColumn++;
  }

  // still not found, so try skipping a letter of the search term
  // if (state.currentMatch == "THEODOREKAC") console.log("gonna skip letter", state.keyword[state.currentLetter], "match", state.currentMatch, "current col", state.currentColumn);
  state.penaltySkippedLetters++;
  state.currentLetter++;
  if (doSearchKeywordFuzzy(state, maxskip)) {
    return true;
  }
  state.penaltySkippedLetters--;
  state.currentLetter--;
  // updateGrid(plaintext, k, n, start, []);
  return false;
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
