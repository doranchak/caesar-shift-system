import React, {useState} from 'react';
import FindWords from './FindWords.js';
import LengthSelector from './LengthSelector.js';
// import ServerMessage from './ServerMessage.js';
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
  let gh = createGridHighlight(plaintext, k, n, start);
  // gh[1][13] = 1;
  // gh[3][2] = 1;
  // gh[5][9] = 1;
  const [gridHighlight, setGridHighlight] = useState(gh);  
  let gtmp = createGrid(plaintext, k, n, start);
  const [grid, setGrid] = useState(gtmp);
  // string versions of grid columns for more convenient searching
  const [columns, setColumns] = useState(columnsFrom(gtmp));
  // search keyword
  const [keyword, setKeyword] = useState('');
  // search results
  const [searchResults, setSearchResults] = useState([]);
  const [searchResult, setSearchResult] = useState(null);

  const plaintextChange = (event) => {
    let val = event.target.value.toUpperCase();
    setPlaintext(val);
    setGrid(createGrid(val, k, n, start));
  };
  const kChange = (event) => {
    let val = parseInt(event.target.value);
    if (isNaN(val)) return;
    setK(val);
    setGrid(createGrid(plaintext, val, n, start));
  };
  const nChange = (event) => {
    let val = Math.min(20, Math.max(1, event.target.value));
    if (isNaN(val)) return;
    setN(val);
    setGrid(createGrid(plaintext, k, val, start));
  };
  const startChange = (event) => {
    let val = parseInt(event.target.value);
    if (isNaN(val)) return;
    setStart(val);
    setGrid(createGrid(plaintext, k, n, val));
  };
  const updateKeyword = (event) => {
    let val = event.target.value.toUpperCase();
    setKeyword(val);
  };
  const doSearch = () => {
    let matches = doSearchKeyword(keyword);
    doSearchUpdate(matches);
  };

  const doSearchKeyword = (word) => {
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
      if (gridHighlight[row][colIndex]) return grid[row][colIndex];
    }
    return '';
  }


  function updateGrid(plaintext, k, n, start, highlights) {
    // let gh = createGridHighlight(plaintext, k, n, start);
    let gh = createGridHighlight(plaintext, k, n, start);
    if (highlights) {
      highlights.map((h, index) => {
        gh[h[0]][h[1]+1] = 1;
      });
    }
    setGridHighlight(gh);
    setPlaintext(plaintext);
    setK(k);
    setN(n);
    setStart(start);
    let gtmp = createGrid(plaintext, k, n, start);
    setGrid(gtmp);
    setColumns(columnsFrom(gtmp));
  }

  function selectKaczynski1() {
    updateGrid("KACZYNSKI", 10, 7, -30);
  }
  function selectKaczynski2() {
    updateGrid("KACZYNSKI", 10, 7, -30, [[6,0],[1,1],[5,2],[0,3],[2,4],[3,5],[4,6]]);
  }
  function selectKaczynski3() {
    updateGrid("KACZYNSKI", 10, 7, -30, [[3,3],[4,4],[4,5],[4,6],[4,7],[1,8]]);
  }
  function selectKaczynski4() {
    updateGrid("KACZYNSKI", 10, 7, -30, [[3,3],[4,4],[4,5],[4,6],[2,7],[2,8]]);
  }
  function selectTheodoreKaczynski1() {
    updateGrid("THEODOREJKACZYNSKI", 10, 9, -30);
  }
  function selectTheodoreKaczynski2() {
    updateGrid("THEODOREJKACZYNSKI", 10, 9, -30, [[4,1],[4,2],[6,3],[0,4],[6,5],[5,6],[4,8],[5,12],[6,13],[6,14],[6,15],[6,16],[3,17]]);
  }
  function selectTrees1() {
    updateGrid("TREESTOBLOOMINWEEKS", 10, 6, -40);
  }
  function selectTrees2() {
    updateGrid("TREESTOBLOOMINWEEKS", 10, 6, -40, [[1,0],[2,1],[1,2],[0,3],[0,5],[1,6],[2,7],[2,9],[4,10],[5,10],[2,11],[2,12],[1,13],[4,14],[1,17],[2,18]]);
  }
  function incrementStart() {
    updateGrid(plaintext, k, n, start+k);
  }
  function decrementStart() {
    updateGrid(plaintext, k, n, start-k);
  }
  function incrementK() {
    updateGrid(plaintext, k+1, n, start);
  }
  function decrementK() {
    updateGrid(plaintext, k-1, n, start);
  }
  function incrementN() {
    updateGrid(plaintext, k, n+1, start);
  }
  function decrementN() {
    updateGrid(plaintext, k, n-1, start);
  }
  function selectSearchResult(index) {
    updateGrid(plaintext, k, n, start, searchResults[index]);
  }

  // function lengthsSelector() {
  //   return (
  //   <select value={wordListLengthFilter} onChange={selectWordListLengthFilter}>
  //     <option></option>
  //     {wordListResultsLengths.map((len, index) => (
  //       <option key={index} value={len}>{len}</option>
  //     ))}
  //   </select>
  //   );
  // }

  function cl(row, col, highlight) {
    let shift = (n-1-row)*k + start;
    let c = "col";
    if (shift == 0) c += " plaintext";
    if (highlight) 
      if (shift == 0) c += " highlight1";
      else c += " highlight2"
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
                <a href="#" onClick={selectTrees2}>[2]</a>
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
                <FindWords doSearchKeyword={doSearchKeyword} doSearchUpdate={doSearchUpdate}/>
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
                        <div style={style(rowIndex, colIndex, 0)} className={cl(rowIndex, colIndex, gridHighlight[rowIndex][colIndex])} key={`${rowIndex}-${colIndex}`}>{grid[rowIndex][colIndex]}</div>
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
        {/* <ServerMessage/> */}
      </center>
    </>
  );
}



function style(row, col, val) {
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
}

function createGridHighlight(plaintext, k, n, start) {
  const gridHighlight = [];
  let rows = n;
  let cols = plaintext.length + 1;  
  for (let i = rows-1; i >= 0; i--) {
    const row = [];
    for (let j = 0; j <= cols; j++) {
      row.push(0);
    }
    gridHighlight.push(row);
  }
  return gridHighlight;
}

function caesarShift(ch, num) {
  let val = ch.charCodeAt(0) - 65 + num;
  while (val < 0) val += 26;
  val %= 26;
  return String.fromCharCode(val + 65);
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

export default App;
