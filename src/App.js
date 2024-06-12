import React, {useState} from 'react';
import FindWords from './FindWords.js';
import AnimateAllWords from './AnimateAllWords.js';
import AnimatePaint from './AnimatePaint.js';
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
  let gtmp = createGrid(plaintext, k, n, start);
  const [grid, setGrid] = useState(gtmp);
  const [gridHighlights, setGridHighlights] = useState([]);  
  const [gridHighlightsOverride, setGridHighlightsOverride] = useState([]);
  // string versions of grid columns for more convenient searching
  const [columns, setColumns] = useState(columnsFrom(gtmp));
  // search keyword
  const [keyword, setKeyword] = useState('');
  // search results
  const [searchResults, setSearchResults] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  // no pattern to the shift values
  const [irregular, setIrregular] = useState(false);
  const [irregularShifts, setIrregularShifts] = useState([]);

  const [wordVizCounter, setWordVizCounter] = useState("");

  // if true, stack the search results with each search instead of replacing them
  const [stack, setStack] = useState(false);
  // if true, most recent search result gets extra highlight
  const [topHighlight, setTopHighlight] = useState(true);

  const updateGridHighlights = (gh) => {
    if (stack) {
      let arr = [];
      gridHighlights.map((item, index) => arr.push(item));
      gridHighlights.push(gh);
    }
    else setGridHighlights([gh]);
    updateGrid(plaintext, k, n, start);
  }
  const updateGridHighlightsOverride = (gho) => {
    if (stack) gridHighlightsOverride.push(gho);
    else setGridHighlightsOverride([gho]);
  }
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
  const updateStack = (event) => {
    let val = event.target.checked;
    setStack(val);
  };
  const updateTopHighlight = (event) => {
    let val = event.target.checked;
    setTopHighlight(val);
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
    init();
    setGridHighlights([]);
    setGridHighlightsOverride([]);
    updateGrid(plaintext, k, n, start);
  }

  const valueForHighlight = (colIndex, gridHighlightsIndex) => {
    for (let row=0; row<gridHighlights[gridHighlightsIndex].length; row++) {
      if (gridHighlights[gridHighlightsIndex][row][colIndex]) {
        if (gridHighlightsOverride && gridHighlightsOverride.length > gridHighlightsIndex && gridHighlightsOverride[gridHighlightsIndex][colIndex]) return gridHighlightsOverride[gridHighlightsIndex][colIndex];
        else {
          return grid[row][colIndex];
        }
      }
    }
    return '';
  }

  // reset grid stuff to avoid side effects
  function init() {
    setIrregular(false); setIrregularShifts([]);
    // setGridHighlights([]);
    // setGridHighlightsOverride([]);
    // console.log("ghs len", gridHighlights.length);
  }
  function updateGridPlaintext(plaintext) {
    updateGrid(plaintext, k, n, start);
  }

  function updateGrid(plaintext, k, n, start, highlights) {
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
    let doAdd = false;
    if (highlights) {
      highlights.map((h, index) => {
        gh[h[0]][h[1]+1] = 1;
        doAdd = true;
      });
    }
    if (doAdd) { // only add if we marked at least one to highlight
      let ghs = gridHighlights;
      if (stack) {
        ghs.push(gh);
      }
      else ghs = [gh];
      setGridHighlights(ghs);
    }
    let cols = columnsFrom(grid);
    setColumns(cols);
  }

  function selectInit() {
    init(); setStack(false);
  }
  function selectKaczynski1() {
    selectInit();
    updateGrid("KACZYNSKI", 10, 7, -30);
  }
  function selectKaczynski2() {
    selectInit();
    updateGrid("KACZYNSKI", 10, 7, -30, [[6,0],[1,1],[5,2],[0,3],[2,4],[3,5],[4,6]]);
  }
  function selectKaczynski3() {
    selectInit();
    updateGrid("KACZYNSKI", 10, 7, -30, [[3,3],[4,4],[4,5],[4,6],[4,7],[1,8]]);
  }
  function selectKaczynski4() {
    selectInit();
    updateGrid("KACZYNSKI", 10, 7, -30, [[3,3],[4,4],[4,5],[4,6],[2,7],[2,8]]);
  }
  function selectTheodoreKaczynski1() {
    selectInit();
    updateGrid("THEODOREJKACZYNSKI", 10, 9, -30);
  }
  function selectTheodoreKaczynski2() {
    selectInit();
    updateGrid("THEODOREJKACZYNSKI", 10, 9, -30, [[4,1],[4,2],[6,3],[0,4],[6,5],[5,6],[4,8],[5,12],[6,13],[6,14],[6,15],[6,16],[3,17]]);
  }
  function selectTrees1() {
    selectInit();
    updateGrid("TREESTOBLOOMINWEEKS", 10, 6, -40);
  }
  function selectTrees2() {
    selectInit();
    updateGrid("TREESTOBLOOMINWEEKS", 10, 6, -40, [[1,0],[2,1],[1,2],[0,3],[0,5],[1,6],[2,7],[2,9],[4,10],[5,10],[2,11],[2,12],[1,13],[4,14],[1,17],[2,18]]);
  }
  function selectDatesGrid() {
    selectInit();
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
    setGridHighlights([gridHighlight]);

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

    let highlight = isCellHighlighted(row, col);

    if (highlight) {
      if (!topHighlight) highlight = 1;
      if (shift == 0) c += " highlight_base_" + highlight;
      else c += " highlight_offset_" + highlight;
    }
    if (col > 0) c += " letter_" + columns[col-1][row];
    return c;
  }

  // is this cell part of a search result?
  // returns 2 if most recent result
  // returns 1 if not most recent result
  // returns 0 if not part of any result
  function isCellHighlighted(row, col) {
    if (!gridHighlights || gridHighlights.length == 0) return false;
    for (let i=gridHighlights.length-1; i>=0; i--) {
      let gh = gridHighlights[i];
      if (gh.length >= (row+1) && gh[row].length >= (col+1) && gh[row][col]) {
        return i == gridHighlights.length - 1 ? 2 : 1;
      }
    }
  }

  function clEnd(colIndex, gridHighlightsIndex) {
    let val = valueForHighlight(colIndex, gridHighlightsIndex);
    let top = topHighlight && gridHighlightsIndex == gridHighlights.length - 1 ? "_top" : "";
    if (val == '') return 'col_end';
    return 'col_end_highlight' + top;
  }
  function lettersFromColumns() {
    let letters = "";
    columns.map((item, idx) => {
      for (let i=0; i<item.length; i++)
        if (letters.indexOf(item[i]) == -1)
          letters += item[i];
    });
    return letters;
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
                          <div><input onChange={updateStack} type="checkbox" checked={stack}></input>Stack</div>
                          <div><input onChange={updateTopHighlight} type="checkbox" checked={topHighlight}></input>TopHighlight</div>
                          <div>{searchResult}</div>                        
                          <div>
                          {searchResults.map((result, index) => (
                            <span key={index}>[<a href="#" className="nou" onClick={() => selectSearchResult(index)}>{index+1}</a>]</span>
                          ))}
                          </div>
                          <AnimateAllWords rows={columns[0].length} cols={columns.length} wordLength={5} setGridHighlights={setGridHighlights} setWordVizCounter={setWordVizCounter}></AnimateAllWords>
                          <AnimatePaint styleSheet={document.styleSheets[2]} letters={lettersFromColumns()}></AnimatePaint>
                        </td>
                      </tr>
                    </tbody>
                  </table>
              </td>
              <td>
                <FindWords columns={columns} doSearchKeyword={doSearchKeyword} doSearchUpdate={doSearchUpdate} createGrid={createGrid} columnsFrom={columnsFrom} updateGridHighlights={updateGridHighlights} updateGridHighlightsOverride={updateGridHighlightsOverride} k={k} n={n} start={start} keyword={keyword}/>
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
                  {gridHighlights.map((gh, i) => (
                    <div className="row_end" key={i}>
                      {grid[0].map((col, colIndex) => (
                        <div className={clEnd(colIndex, i)} key={colIndex}>{valueForHighlight(colIndex, i)}</div>
                      ))}
                    </div>
                  ))}
                  {wordVizCounter && 
                    <div className="counter">
                      {wordVizCounter}
                    </div>
                  }
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
