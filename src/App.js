import { useState, useEffect } from 'react';
import './App.css';

// let plaintext = "TREESTOBLOOMINWEEKS";
// let k = 10; // shift increments
// let n = 6; // number of shifts
// let start = -40; // starting shift value

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
  const [grid, setGrid] = useState(createGrid(plaintext, k, n, start));

  const plaintextChange = (event) => {
    let val = event.target.value;
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
  function handleSubmit() {
  }

  function updateGrid(plaintext, k, n, start, highlights) {
    // let gh = createGridHighlight(plaintext, k, n, start);
    let gh = createGridHighlight(plaintext, k, n, start);
    console.log(gh);
    if (highlights) {
      highlights.map((h, index) => {
        console.log(h);
        gh[h[0]][h[1]+1] = 1;
      });
    }
    setGridHighlight(gh);
    setPlaintext(plaintext);
    setK(k);
    setN(n);
    setStart(start);
    setGrid(createGrid(plaintext, k, n, start));
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

  function cl(row, col, highlight) {
    let shift = (n-1-row)*k + start;
    let c = "col";
    if (shift == 0) c += " plaintext";
    if (highlight) 
      if (shift == 0) c += " highlight1";
      else c += " highlight2"
    return c;
  }
   
  return (
    <>
      <center>
        <form onSubmit={handleSubmit}>
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
                    size="64"
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
                </td>
              </tr>
            </tbody>
          </table>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
          {/* <button type="submit">Submit</button> */}
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

export default App;
