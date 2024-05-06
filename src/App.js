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
  const [grid, setGrid] = useState(createGrid(plaintext, k, n, start));
  const [gridHighlight, setGridHighlight] = useState(createGridHighlight(plaintext, k, n, start));  

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
  function selectKaczynski1() {
    setPlaintext("KACZYNSKI");
    setK(10);
    setN(7);
    setStart(-30);
    setGrid(createGrid("KACZYNSKI", 10, 7, -30));
  }
  function selectKaczynski2() {
    setPlaintext("THEODOREJKACZYNSKI");
    setK(10);
    setN(9);
    setStart(-30);
    setGrid(createGrid("THEODOREJKACZYNSKI", 10, 9, -30));
  }
  function selectTrees() {
    setPlaintext("TREESTOBLOOMINWEEKS");
    setK(10);
    setN(6);
    setStart(-40);
    setGrid(createGrid("TREESTOBLOOMINWEEKS", 10, 6, -40));
  }
  function cl(row, col, highlight) {
    // let cl = highlight ? "col highlight" : "col";
    let shift = (n-1-row)*k + start;
    if (shift == 0) return "plaintext col";
    return "col";
  }
  
    
  return (
    <>
      <center>
        <form onSubmit={handleSubmit}>
          <table>
            <tbody>
              <tr>
                <td>
                  <a href="#" onClick={selectKaczynski1}>Kaczynski1</a> |&nbsp;
                  <a href="#" onClick={selectKaczynski2}>Kaczynski2</a> |&nbsp;
                  <a href="#" onClick={selectTrees}>Trees</a>
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
                        <div style={style(rowIndex, colIndex, 0)} className={cl(rowIndex, colIndex, grid[rowIndex][colIndex])} key={`${rowIndex}-${colIndex}`}>{grid[rowIndex][colIndex]}</div>
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
    for (let j = 0; j < cols; j++) {
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
