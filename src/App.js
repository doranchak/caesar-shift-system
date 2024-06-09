import React, {useState} from 'react';
import FindWords from './FindWords.js';
import LengthSelector from './LengthSelector.js';
import Experiment5 from './Experiment5.js';
import {doSearchKeyword, doSearchKeywordFuzzy, undoStep, columnsFrom, createGrid, createGridStatic, caesarShift} from './GridSearch.js';
import './App.css';

function App() {
  // plaintext
  const [plaintext, setPlaintext] = useState('TREESTOBLOOMINWEEKS');
  // k
  const [k, setK] = useState(10);
  // n
  const [n, setN] = useState(6);
  // start
  const [start, setStart] = useState(-40);
  // grid
  // let gh = createGridHighlight(plaintext, k, n, start);
  // gh[1][13] = 1;
  // gh[3][2] = 1;
  // gh[5][9] = 1;
  let gtmp = createGrid(plaintext, k, n, start);
  const [grid, setGrid] = useState(gtmp);
  const [gridHighlight, setGridHighlight] = useState(createGridHighlightWithGrid(gtmp));  
  const [gridHighlightOverride, setGridHighlightOverride] = useState([]);
  // string versions of grid columns for more convenient searching
  const [columns, setColumns] = useState(columnsFrom(gtmp));
  // search keyword
  const [keyword, setKeyword] = useState('');
  // search results
  const [searchResults, setSearchResults] = useState([]);
  const [searchResult, setSearchResult] = useState(null);

  const [irregular, setIrregular] = useState(false);
  const [irregularShifts, setIrregularShifts] = useState([]);

  const plaintextChange = (event) => {
    let val = event.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    setPlaintext(val);
    updateGrid(val, k, n, start);
  };
  const kChange = (event) => {
    let val = parseInt(event.target.value);
    if (isNaN(val)) return;
    setK(val);
    updateGrid(plaintext, val, n, start);
  };
  const nChange = (event) => {
    let val = Math.min(20, Math.max(1, event.target.value));
    if (isNaN(val)) return;
    setN(val);
    updateGrid(plaintext, k, val, start);
  };
  const startChange = (event) => {
    let val = parseInt(event.target.value);
    if (isNaN(val)) return;
    setStart(val);
    updateGrid(plaintext, k, n, val);
  };
  const updateKeyword = (event) => {
    let val = event.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    setKeyword(val);
  };
  const doSearch = () => {
    init();
    let matches = doSearchKeyword(keyword, columns);
    doSearchUpdate(matches);
  };

  const doSearchUpdate = (matches) => {
    if (matches.length == 0) {
      setSearchResult("No results.");
      updateGrid(plaintext, k, n, start, []);
    }
    else {
      setSearchResult(matches.length + " matches.");
      updateGrid(plaintext, k, n, start, matches[0]);
    }
    setSearchResults(matches);
  }
  const doClear = (event) => {
    setSearchResult("");
    setKeyword("");
  }

  const valueForHighlight = (colIndex) => {
    for (let row=0; row<gridHighlight.length; row++) {
      if (gridHighlight[row][colIndex]) {
        if (gridHighlightOverride[colIndex]) return gridHighlightOverride[colIndex];
        else return grid[row][colIndex];
      }
    }
    return '';
  }

  // reset grid stuff to avoid side effects
  function init() {
    setIrregular(false); setIrregularShifts([]);
    setGridHighlightOverride([]);
  }
  function updateGridPlaintext(plaintext) {
    updateGrid(plaintext, k, n, start);
  }

  function updateGrid(plaintext, k, n, start, highlights) {
    // let gh = createGridHighlight(plaintext, k, n, start);
    // if (highlights) {
    //   highlights.map((h, index) => {
    //     gh[h[0]][h[1]+1] = 1;
    //   });
    // }
    // setGridHighlight(gh);
    if (irregular) {
      let grid = createGridStatic(plaintext, irregularShifts);
      setStart(0);
      updateGridWithGrid(grid, highlights);
      return;
    } 

    setPlaintext(plaintext);
    setK(k);
    setN(n);
    setStart(start);
    let gtmp = createGrid(plaintext, k, n, start);
    updateGridWithGrid(gtmp, highlights);
    // setGrid(gtmp);
    // let cols = columnsFrom(gtmp);
    // setColumns(cols);
  }

  function updateGridWithGrid(grid, highlights) {
    setGrid(grid);
    let gh = createGridHighlightWithGrid(grid);
    if (highlights) {
      highlights.map((h, index) => {
        gh[h[0]][h[1]+1] = 1;
      });
    }
    setGridHighlight(gh);

    let cols = columnsFrom(grid);
    setColumns(cols);
  }

  function selectKaczynski1() {
    init();
    updateGrid("KACZYNSKI", 10, 7, -30);
  }
  function selectKaczynski2() {
    init();
    updateGrid("KACZYNSKI", 10, 7, -30, [[6,0],[1,1],[5,2],[0,3],[2,4],[3,5],[4,6]]);
  }
  function selectKaczynski3() {
    init();
    updateGrid("KACZYNSKI", 10, 7, -30, [[3,3],[4,4],[4,5],[4,6],[4,7],[1,8]]);
  }
  function selectKaczynski4() {
    init();
    updateGrid("KACZYNSKI", 10, 7, -30, [[3,3],[4,4],[4,5],[4,6],[2,7],[2,8]]);
  }
  function selectTheodoreKaczynski1() {
    init();
    updateGrid("THEODOREJKACZYNSKI", 10, 9, -30);
  }
  function selectTheodoreKaczynski2() {
    init();
    updateGrid("THEODOREJKACZYNSKI", 10, 9, -30, [[4,1],[4,2],[6,3],[0,4],[6,5],[5,6],[4,8],[5,12],[6,13],[6,14],[6,15],[6,16],[3,17]]);
  }
  function selectTrees1() {
    init();
    updateGrid("TREESTOBLOOMINWEEKS", 10, 6, -40);
  }
  function selectTrees2() {
    init();
    updateGrid("TREESTOBLOOMINWEEKS", 10, 6, -40, [[1,0],[2,1],[1,2],[0,3],[0,5],[1,6],[2,7],[2,9],[4,10],[5,10],[2,11],[2,12],[1,13],[4,14],[1,17],[2,18]]);
  }
  function selectDatesGrid() {
    init();
    let sh = [20, 12, 7, 4, 0, -4, -7, -12, -20];
    setIrregular(true);
    setIrregularShifts(sh);
    let grid = createGridStatic(plaintext, sh);
    setStart(0);
    setGrid(grid);

    const gridHighlight = [];
    let rows = grid.length;
    let cols = plaintext.length + 1;  
    for (let i = 0; i<rows; i++) {
      const row = [];
      for (let j = 0; j <= cols; j++) {
        row.push(0);
      }
      gridHighlight.push(row);
    }
    setGridHighlight(gridHighlight);

    let columns = columnsFrom(grid);
    setColumns(columns);    
  }
  function incrementStart() {
    init();
    updateGrid(plaintext, k, n, start+k);
  }
  function decrementStart() {
    init();
    updateGrid(plaintext, k, n, start-k);
  }
  function incrementK() {
    init();
    updateGrid(plaintext, k+1, n, start);
  }
  function decrementK() {
    init();
    updateGrid(plaintext, k-1, n, start);
  }
  function incrementN() {
    init();
    updateGrid(plaintext, k, n+1, start);
  }
  function decrementN() {
    init();
    updateGrid(plaintext, k, n-1, start);
  }
  function selectSearchResult(index) {
    init();
    updateGrid(plaintext, k, n, start, searchResults[index]);
  }

  function cl(row, col) {
    let shift = irregular ? irregularShifts[row] : (n-1-row)*k + start;
    let c = "col";
    if (shift == 0) c += " plaintext";

    let highlight = 0;
    if (gridHighlight && gridHighlight.length >= (row+1) && gridHighlight[row].length >= (col+1))
      highlight = gridHighlight[row][col];
    if (highlight) {
      if (shift == 0) c += " highlight1";
      else c += " highlight2"

    }
    return c;
  }
  function clEnd(colIndex) {
    let val = valueForHighlight(colIndex);
    if (val == '') return 'col_end';
    return 'col_end_highlight';
  }
   
  return (
    <>
      <center>
        <table>
          <tbody>
            <tr>
              <td>
                Kaczynski <a href="#" onClick={selectKaczynski1}>[1]</a>
                <a href="#" onClick={selectKaczynski2}>[2]</a>
                <a href="#" onClick={selectKaczynski3}>[3]</a>
                <a href="#" onClick={selectKaczynski4}>[4]</a><br></br>
                TheodoreKaczynski <a href="#" onClick={selectTheodoreKaczynski1}>[1]</a>
                <a href="#" onClick={selectTheodoreKaczynski2}>[2]</a><br></br>
                Trees <a href="#" onClick={selectTrees1}>[1]</a>
                <a href="#" onClick={selectTrees2}>[2]</a><br></br>
                Dates Grid<a href="#" onClick={selectDatesGrid}>[1]</a>
              </td>
              <td>
                <table>
                  <tbody>
                    <tr>
                      <td className="l"><label>Plaintext</label></td>
                      <td>
                        <input
                          type="text"
                          size="30"
                          value={plaintext}
                          onChange={plaintextChange}
                        />
                      </td>
                    </tr>              
                    <tr>
                      <td className="l"><label>Increment</label></td>                
                      <td>
                        <input
                          type="text"
                          size="6"
                          value={k}
                          onChange={kChange}
                        />
                        &nbsp;<a className="nou" href="#" style={{textDecoration: 'none'}} onClick={incrementK}>+</a> <a className="nou" href="#" style={{textDecoration: 'none'}} onClick={decrementK}>-</a>
                      </td>
                    </tr>
                    <tr>
                      <td className="l"><label>Rows</label></td>                
                      <td>
                        <input
                          type="text"
                          size="6"
                          value={n}
                          onChange={nChange}
                        />
                        &nbsp;<a className="nou" href="#" style={{textDecoration: 'none'}} onClick={incrementN}>+</a> <a className="nou" href="#" style={{textDecoration: 'none'}} onClick={decrementN}>-</a>
                      </td>
                    </tr>
                    <tr>
                      <td className="l"><label>Starting Shift</label></td>                
                      <td>
                        <input
                          type="text"
                          size="6"
                          value={start}
                          onChange={startChange}
                        />
                        &nbsp;<a className="nou" href="#" style={{textDecoration: 'none'}} onClick={incrementStart}>+</a> <a className="nou" href="#" style={{textDecoration: 'none'}} onClick={decrementStart}>-</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td>
                <table>
                    <tbody>
                      <tr>
                        <td className="l"><label>Search for</label></td>
                        <td>
                          <input
                            type="keyword"
                            size="20"
                            value={keyword}
                            onChange={updateKeyword}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td><button onClick={doSearch}>Search</button><button onClick={doClear}>Clear</button>
                          <div>{searchResult}</div>                        
                          <div>
                          {searchResults.map((result, index) => (
                            <span key={index}>[<a href="#" className="nou" onClick={() => selectSearchResult(index)}>{index+1}</a>]</span>
                          ))}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
              </td>
              <td>
                <FindWords columns={columns} doSearchKeyword={doSearchKeyword} doSearchUpdate={doSearchUpdate} createGrid={createGrid} columnsFrom={columnsFrom} setGridHighlight={setGridHighlight} setGridHighlightOverride={setGridHighlightOverride} k={k} n={n} start={start} keyword={keyword}/>
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <td>
                <div className="App">
                  {grid.map((row, rowIndex) => (
                    <div className="row" key={rowIndex}>
                      {row.map((col, colIndex) => (
                        <div style={style(rowIndex, colIndex, 0)} className={cl(rowIndex, colIndex)} key={`${rowIndex}-${colIndex}`}>{grid[rowIndex][colIndex]}</div>
                      ))}
                    </div>
                  ))}
                    <div className="row_end">
                      {grid[0].map((col, colIndex) => (
                        <div className={clEnd(colIndex)} key={colIndex}>{valueForHighlight(colIndex)}</div>
                      ))}
                    </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </center>
    </>
  );
}



function style(row, col, val) {
}

// function createGridHighlight(plaintext, k, n, start) {
//   const gridHighlight = [];
//   let rows = n;
//   let cols = plaintext.length + 1;  
//   for (let i = rows-1; i >= 0; i--) {
//     const row = [];
//     for (let j = 0; j <= cols; j++) {
//       row.push(0);
//     }
//     gridHighlight.push(row);
//   }
//   return gridHighlight;
// }
function createGridHighlightWithGrid(grid) {
  const gridHighlight = [];
  let rows = grid.length;
  let cols = grid[0].length + 1;  
  for (let i = 0; i<rows; i++) {
    const row = [];
    for (let j = 0; j <= cols; j++) {
      row.push(0);
    }
    gridHighlight.push(row);
  }
  return gridHighlight;
}

export default App;
