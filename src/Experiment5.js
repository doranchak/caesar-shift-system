import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {createGrid, columnsFrom, doSearchKeyword, doSearchKeywordFuzzy, MAX_SKIPPED_LETTERS} from './GridSearch.js';
const URL_PREFIX = "http://localhost:8888";
// const MIN_LENGTH = 1;
const MIN_SEARCH_LENGTH = 9;
const MAX_SEARCH_LENGTH = 16;
const MIN_SEARCH_LENGTH_NAMES = 1;
function Experiment5({keyword, columns, wordList, k, n, start, setGridHighlights, setGridHighlightsOverride}) {  
  const go = () => {
    search(columns, keyword, doSearchKeywordFuzzy, setGridHighlights, setGridHighlightsOverride, true, true);
  }
  const go2 = () => {
    console.log("-- START fuzzy search against list");
    let count = 0;
    wordList.map((val, index) => {
      if (val[0].length >= MIN_SEARCH_LENGTH_NAMES) {
        let result = 0;
        // let grid = createGrid(val[0], k, n, start);
        // let cols = columnsFrom(grid);
        search(columns, val[0], doSearchKeywordFuzzy, setGridHighlights, setGridHighlightsOverride, false, true);
      }
      count++;
      if (count % 10000 == 0) console.log(count);

    });
    console.log("-- DONE");
  }
  const go3_1 = (mode) => {
    axios.get(URL_PREFIX + '/api/names_last')
    .then(response => {
      let names_last = response.data;
      go3_2(mode, names_last);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }
  const go3_2 = (mode, names_last) => {
    axios.get(URL_PREFIX + '/api/names_first_male')
    .then(response => {
      let names_first_male = response.data;
      go3_3(mode, names_last, names_first_male);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }
  const go3_3 = (mode, names_last, names_first_male) => {
    axios.get(URL_PREFIX + '/api/names_first_female')
    .then(response => {
      let names_first_female = response.data;
      if (mode == 0) go3_4(names_last, names_first_male, names_first_female);
      else if (mode == 1) nameAssembler(names_last, names_first_male, names_first_female);
      else if (mode == 2) go7(names_last, names_first_male, names_first_female);
      else go13(names_last, names_first_male, names_first_female);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }
  const go3_4 = (names_last, names_first_male, names_first_female) => {
    let count = 0;
    while (true) {
      let name = makeName(names_last, names_first_male, names_first_female);
      if (name[0].length >= MIN_SEARCH_LENGTH && name[0].length <= MAX_SEARCH_LENGTH) {
        for (let currentColumn=0; currentColumn<columns.length; currentColumn++) {
          let keyword = name[0];
          let state = {keyword, columns, currentColumn};
          if (doSearchKeywordFuzzy(state)) {
            console.log(keyword.length, name[2], name[1], state.penaltySkippedColumns, state.penaltySameColumn, state.penaltySkippedLetters);
            break;
          }
        }    
        count++;
        // if (count % 10000 == 0) console.log(count);
      }
    }
  }
  const go4 = () => {
    axios.get(URL_PREFIX + '/api/corpus?name=zodiac')
    .then(response => {
      console.log("Loaded corpus.");
      let words =response.data.corpus.split(" ");
      let seen = [];
      for (let i=0; i<words.length; i++) {
        // if (i>0 && i%100000 == 0) console.log(i+"...");
        let go = true;
        let wordsSpaces = "";
        let wordsNoSpaces = "";
        let j=i;
        while (true) {
          let word = words[j];
          if (wordsSpaces.length > 0) wordsSpaces += " ";
          wordsSpaces += word;
          wordsNoSpaces += word;
          if (wordsNoSpaces.length >= MAX_SEARCH_LENGTH)
            break;
          if (wordsNoSpaces.length >= MIN_SEARCH_LENGTH) {
            let keyword = wordsNoSpaces;
            for (let currentColumn=0; currentColumn<columns.length; currentColumn++) {
              let state = {keyword, columns, currentColumn};
              if (doSearchKeywordFuzzy(state)) {
                console.log(wordsNoSpaces.length, wordsSpaces, state.penaltySkippedColumns, state.penaltySameColumn, state.penaltySkippedLetters);
                break;
              }
            }
          }
          j++;
        }
      }
      console.log("-- DONE");
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }
  const nameAssembler = (names_last, names_first_male, names_first_female) => {
    console.log("process last names...");
    names_last.splice(10000);
    let [index_names_last, score_names_last] = processNames(names_last, columns);
    console.log("process first names male...");
    let [index_names_first_male, score_names_first_male] = processNames(names_first_male, columns);
    console.log("process first names female...");
    let [index_names_first_female, score_names_first_female] = processNames(names_first_female, columns);
    let hits = 0;
    while(hits < 100000) {
      let col = 0;
      let searchname = "";
      let searchname_spaces = "";
      let scoresum = 0;
      let wordcount = 0;
      while (col < columns.length - 1) {
        let item = null;
        let score = 0;
        while (item == null) {
          let which = randItem[0, 1, 2];
          if (which == 0) [item, score] = randItem2(index_names_first_male[col], score_names_first_male);
          else if (which == 1) [item, score] = randItem2(index_names_first_female[col], score_names_first_female);
          else [item, score] = randItem2(index_names_last[col], score_names_last);
        }
        wordcount++;
        searchname += item[0];
        if (searchname_spaces.length > 0) searchname_spaces+=" ";
        searchname_spaces += item[0];
        scoresum += parseFloat(score);
        col = item[1];
        if (Math.random() < 0.5) col++;
      }
      let result = search(columns, searchname, doSearchKeywordFuzzy, setGridHighlights, setGridHighlightsOverride, false, false);
      if (result && searchname.length > 15) {
        console.log(searchname.length, scoresum, wordcount, searchname_spaces, result.penaltySkippedColumns, result.penaltySameColumn, result.penaltySkippedLetters);
        hits++;
      }
    }
  }
  const processNames = (names, columns) => {
    let index = [];
    let scores = {};
    names.map((name, i) => {
      let keyword = name[0];
      for (let currentColumn=0; currentColumn<columns.length; currentColumn++) {
        let state = {keyword, columns, currentColumn};
        if (doSearchKeywordFuzzy(state, true)) {
          if (state.penaltySkippedLetters == 0) {
            let val = index[currentColumn];
            if (!val) index[currentColumn] = [];
            let firstCol = state.currentPositions[0][1];
            let lastCol = state.currentPositions[state.currentPositions.length-1][1];
            index[firstCol].push([keyword, lastCol]);
            scores[keyword] = name[1];
          }
        }
      }
    });
    return [index, scores];
  }
  const go5 = () => {
    axios.get(URL_PREFIX + '/api/corpus?name=big')
    .then(response => {
      console.log("Loaded corpus.");
      let words =response.data.corpus.split(" ");
      let seen = [];
      for (let i=0; i<words.length; i++) {
        // if (i>0 && i%100000 == 0) console.log(i+"...");
        let go = true;
        let wordsSpaces = "";
        let wordsNoSpaces = "";
        let j=i;
        while (true) {
          let word = words[j];
          if (wordsSpaces.length > 0) wordsSpaces += " ";
          wordsSpaces += word;
          wordsNoSpaces += word;
          if (wordsNoSpaces.length >= 14)
            break;
          if (wordsNoSpaces.length >= 5) {
            let keyword = "UNABOMBER";
            let grid = createGrid(wordsNoSpaces, k, n, start);
            let columns = columnsFrom(grid);    
  
            for (let currentColumn=0; currentColumn<columns.length; currentColumn++) {
              let state = {keyword, columns, currentColumn};
              if (doSearchKeywordFuzzy(state) && state.penaltySkippedLetters == 0) {
                console.log(wordsNoSpaces.length, wordsSpaces, state.penaltySkippedColumns, state.penaltySameColumn, state.penaltySkippedLetters);
                break;
              }
            }
          }
          j++;
        }
      }
      console.log("-- DONE");
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }
  const go6 = (mode) => {
    console.log("loading names...");
    axios.get(URL_PREFIX + '/api/ten_million_names')
    .then(response => {
      let names = response.data;
      console.log("done loading " + names.length + " names");
      names.map((name_arr, index) => {
        let name = name_arr[0];
        let grid = createGrid(name, k, n, start);
        let columns = columnsFrom(grid);    
        for (let currentColumn=0; currentColumn<columns.length; currentColumn++) {
          let state1 = {keyword: "ROEBERT", columns, currentColumn};
          let state2 = {keyword: "ZODIAC", columns, currentColumn};
          let state3 = {keyword: "ZODIUS", columns, currentColumn};
          if (doSearchKeywordFuzzy(state1) && doSearchKeywordFuzzy(state2) && doSearchKeywordFuzzy(state3)) {
            console.log(name.length, (state1.penaltySkippedColumns, state2.penaltySkippedColumns, state3.penaltySkippedColumns), name, state1.penaltySkippedColumns, state2.penaltySkippedColumns, state3.penaltySkippedColumns);
            break;
          }
        }
      });
      console.log("Done!");
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }
  const go7 = (names_last, names_first_male, names_first_female) => {
    console.log("Random name experiment...");
    let count = 0;
    while (true) {
      let name = makeName(names_last, names_first_male, names_first_female);
      if (name[0].length >= 7 && name[0].length <= 20) {
        for (let currentColumn=0; currentColumn<columns.length; currentColumn++) {
          let grid = createGrid(name[0], k, n, start);
          let columns = columnsFrom(grid);    
          let state1 = {keyword: "ROEBERT", columns, currentColumn};
          let state2 = {keyword: "ZODIAC", columns, currentColumn};
          let state3 = {keyword: "ZODIUS", columns, currentColumn};
          if (doSearchKeywordFuzzy(state1) && doSearchKeywordFuzzy(state2) && doSearchKeywordFuzzy(state3)) {
            console.log(name[0].length, name[2], (state1.penaltySkippedColumns + state2.penaltySkippedColumns + state3.penaltySkippedColumns), name[1], state1.penaltySkippedColumns, state2.penaltySkippedColumns, state3.penaltySkippedColumns);
            count++;
            break;
          }
        }    
        if (count == 250000) return;
      }
    }
  }
  const go8 = (mode) => {
    console.log("loading suspects...");
    axios.get(URL_PREFIX + '/api/suspects')
    .then(response => {
      let names = response.data;
      console.log("done loading " + names.length + " suspects");
      names.map((name_arr, index) => {
        let name = name_arr[0];
        let grid = createGrid(name, k, n, start);
        let columns = columnsFrom(grid);    
        for (let currentColumn=0; currentColumn<columns.length; currentColumn++) {
          let state1 = {keyword: "ROEBERT", columns, currentColumn};
          let state2 = {keyword: "ZODIAC", columns, currentColumn};
          let state3 = {keyword: "ZODIUS", columns, currentColumn};
          if (doSearchKeywordFuzzy(state1) && doSearchKeywordFuzzy(state2) && doSearchKeywordFuzzy(state3)) {
            console.log(name.length, (state1.penaltySkippedColumns, state2.penaltySkippedColumns, state3.penaltySkippedColumns), name, state1.penaltySkippedColumns, state2.penaltySkippedColumns, state3.penaltySkippedColumns);
            break;
          }
        }
      });
      console.log("Done!");
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }
  const go9 = (mode) => {
    console.log("loading zwords...");
    axios.get(URL_PREFIX + '/api/zodiac_words')
    .then(response => {
      let names = response.data;
      console.log("done loading " + names.length + " words");
      names.map((name_arr, index) => {
        let name = name_arr[0];
        let grid = createGrid(name, k, n, start);
        let columns = columnsFrom(grid);    
        for (let currentColumn=0; currentColumn<columns.length; currentColumn++) {
          let state1 = {keyword: "ROEBERT", columns, currentColumn};
          let state2 = {keyword: "ZODIAC", columns, currentColumn};
          let state3 = {keyword: "ZODIUS", columns, currentColumn};
          if (doSearchKeywordFuzzy(state1) && doSearchKeywordFuzzy(state2) && doSearchKeywordFuzzy(state3)) {
            console.log(name.length, (state1.penaltySkippedColumns, state2.penaltySkippedColumns, state3.penaltySkippedColumns), name, state1.penaltySkippedColumns, state2.penaltySkippedColumns, state3.penaltySkippedColumns);
            break;
          }
        }
      });
      console.log("Done!");
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }
  const go10 = (mode) => {
    console.log("loading words...");
    axios.get(URL_PREFIX + '/api/words')
    .then(response => {
      let names = response.data;
      console.log("done loading " + names.length + " words");
      names.map((name_arr, index) => {
        let name = name_arr[0];
        let grid = createGrid(name, k, n, start);
        let columns = columnsFrom(grid);    
        for (let currentColumn=0; currentColumn<columns.length; currentColumn++) {
          let state1 = {keyword: "ROEBERT", columns, currentColumn};
          let state2 = {keyword: "ZODIAC", columns, currentColumn};
          let state3 = {keyword: "ZODIUS", columns, currentColumn};
          if (doSearchKeywordFuzzy(state1) && doSearchKeywordFuzzy(state2) && doSearchKeywordFuzzy(state3)) {
            console.log(name.length, (state1.penaltySkippedColumns, state2.penaltySkippedColumns, state3.penaltySkippedColumns), name, state1.penaltySkippedColumns, state2.penaltySkippedColumns, state3.penaltySkippedColumns);
            break;
          }
        }
      });
      console.log("Done!");
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }
  const go11 = (mode) => {
    console.log("loading first...");
    axios.get(URL_PREFIX + '/api/names_first_female')
    .then(response => {
      let names = response.data;
      console.log("done loading " + names.length + " names");
      names.map((name_arr, index) => {
        let name = name_arr[0];
        let grid = createGrid(name, k, n, start);
        let columns = columnsFrom(grid);    
        for (let currentColumn=0; currentColumn<columns.length; currentColumn++) {
          let state1 = {keyword: "ROEBERT", columns, currentColumn};
          if (doSearchKeywordFuzzy(state1)) {
            console.log(name.length, name, state1.penaltySkippedColumns);
            break;
          }
        }
      });
      console.log("Done!");
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }
  const go12 = (mode) => {
    console.log("loading last...");
    axios.get(URL_PREFIX + '/api/names_last')
    .then(response => {
      let names = response.data;
      console.log("done loading " + names.length + " names");
      names.map((name_arr, index) => {
        let name = name_arr[0];
        let grid = createGrid(name, k, n, start);
        let columns = columnsFrom(grid);    
        for (let currentColumn=0; currentColumn<columns.length; currentColumn++) {
          let state1 = {keyword: "ZODIAC", columns, currentColumn};
          let state2 = {keyword: "ZODIUS", columns, currentColumn};
          if (doSearchKeywordFuzzy(state1) && doSearchKeywordFuzzy(state2)) {
            console.log(name.length, name, state1.penaltySkippedColumns, state2.penaltySkippedColumns);
            break;
          }
        }
      });
      console.log("Done!");
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }
  const go13 = (names_last, names_first_male, names_first_female) => {
    let count = 0;
    let victims = ['JENSEN', 'FERRIN', 'SHEPARD'];
    while (true) {
      let name = makeName(names_last, names_first_male, names_first_female);
      if (name[0].length >= 7 && name[0].length <= 17) {
        let grid = createGrid(name[0], k, n, start);
        let columns = columnsFrom(grid);    
        let matches = 0;
        for (let i=0; i<victims.length; i++) {
          let victim = victims[i];
          if (doSearchKeyword(victim, columns).length > 0) {
            matches++;
          } else break;
        }
        if (matches == 3) {
          console.log(name[0].length, name[2], name[1]);
          count++;
        }
      }
    }
  }

  return (
    <>
      <button onClick={go}>Fuzzy search</button>
      <button onClick={go2}>Search against list</button>
      <button onClick={() => go3_1(0)}>Name experiment</button>
      <button onClick={go4}>Corpus experiment</button>
      <button onClick={() => go3_1(1)}>Name assembler</button>
      <button onClick={go5}>Corpus experiment2</button>
      <button onClick={go6}>Roebert in 10M names</button>
      <button onClick={() => go3_1(2)}>Roebert in random names</button>
      <button onClick={go8}>Roebert in suspects</button>
      <button onClick={go9}>Roebert in zwords</button>
      <button onClick={go10}>Roebert in words</button>
      <button onClick={go11}>Roebert in first</button>
      <button onClick={go12}>Zodiacus in last</button>
      <button onClick={() => go3_1(3)}>Jensen Ferrin Shepard</button>
    </>
  );
}
function make_gh(columns) {
  let gh = [];
  let gho = [];
  for (var row=0; row<columns[0].length; row++) {
    gh[row] = [];
    for (var col=0; col<columns.length; col++) {
      gh[row][col] = 0;
    }
  }
  return [gh, gho];
}
function search(columns, keyword, doSearchKeywordFuzzy, setGridHighlights, setGridHighlightsOverride, doHighlight, doPrint) {
  let result = null;
  let best_gh = [];
  let best_gho = [];

  for (let maxskip=0; maxskip<=MAX_SKIPPED_LETTERS; maxskip++) {
    for (let currentColumn=0; currentColumn<columns.length; currentColumn++) {
      let [gh, gho] = make_gh(columns);
      let current_result = searchSub(keyword, columns, currentColumn, doSearchKeywordFuzzy, gh, gho, maxskip);
      if (current_result) {
        console.log(" - intermediate result", keyword.length, keyword, current_result.penaltySkippedColumns, current_result.penaltySameColumn, current_result.penaltySkippedLetters);        
        if (!result) {
          result = current_result;
          best_gh = gh;
          best_gho = gho;
        } else {
          // keep only if current result is better
          if (current_result.penaltySkippedLetters > result.penaltySkippedLetters) {
            
          } else if (score(current_result) < score(result)) {
            result = current_result;
            best_gh = gh;
            best_gho = gho;
          }
        }
      }
    }
    if (doPrint && result) console.log(keyword.length, keyword, result.penaltySkippedColumns, result.penaltySameColumn, result.penaltySkippedLetters);
    if (doHighlight) {
      setGridHighlights([best_gh]);
      setGridHighlightsOverride([best_gho]);
    }
    if (result) return result; // exit early if we have a result.  otherwise, continue if we allow greater numbers of letter skips.
  }
  // if we got this far, no result.
  console.log("NO RESULT");
}
function score(result) {
  return result.penaltySkippedColumns + result.penaltySameColumn;
}
function searchSub(keyword, columns, currentColumn, doSearchKeywordFuzzy, gh, gho, noskip) {
  let state = {keyword, columns, currentColumn};
  let result = doSearchKeywordFuzzy(state, noskip);
  if (result) { 
    for (let i=0; i<state.currentPositions.length; i++) {
      let row = state.currentPositions[i][0];
      let col = state.currentPositions[i][1];
      gh[row][col+1] = 1;
    }
    // special case: more than one letter in a column
    // console.log(state.currentPositions);
    state.currentPositions.map((val, index) => {
      let row = val[0];
      let col = val[1]+1;
      let letter = columns[col-1][row];
      // console.log(row, col, letter);
      if (!gho[col]) gho[col] = letter;
      else gho[col] += letter;
    });
    return state;
  }
  return null;
}

function makeName(names_last, names_first_male, names_first_female) {
  let last = randItem(names_last);
  let first = randItem(Math.random() < 0.5 ? names_first_male : names_first_female);
  let middle = Math.random() < 0.5 ? ["",0] : randItem(Math.random() < 0.5 ? names_first_male : names_first_female);
  let withSpaces = first[0];
  if (middle[0].length > 0) withSpaces += "_" + middle[0];
  withSpaces += "_" + last[0];
  return [first[0] + middle[0] + last[0], withSpaces, parseFloat(first[1]) + parseFloat(middle[1]) + parseFloat(last[1])];
}

function randItem(arr) {
  return arr[Math.floor(Math.random()*arr.length)];  
}
function randItem2(arr, scores) {
  let pick = arr[Math.floor(Math.random()*arr.length)];  
  return [pick, scores[pick[0]]];
}

export default Experiment5;