import React, { useState, useEffect } from 'react';
import './App.css';

let base_text = "TREESTOBLOOMINWEEKS";
let k = 10; // shift increments
let n = 6; // number of shifts
let start = -40; // starting shift value

function App() {
  const [grid, setGrid] = useState(createGrid());
  const [gridHighlight, setGridHighlight] = useState(createGridHighlight());
  let [currentRow, setCurrentRow] = useState(0);
  let [currentCol, setCurrentCol] = useState(0);

  return (
    <>
      <center>
        <table>
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
        </table>
      </center>
    </>
  );
}

function style(row, col, val) {
}

function cl(row, col, highlight) {
  return highlight ? "col highlight" : "col";
}

function createGrid() {
  const grid = [];
  let rows = n;
  let cols = base_text.length + 1;  
  for (let i = rows-1; i >= 0; i--) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      let shift = start + k*i;
      if (j == 0) {
        let prefix = "";
        if (shift > 0) prefix = "+";
        row.push(prefix + shift); // shift value
      }
      else row.push(caesarShift(base_text[j-1], shift)); 
    }
    grid.push(row);
  }
  return grid;
}

function createGridHighlight() {
  const gridHighlight = [];
  let rows = n;
  let cols = base_text.length + 1;  
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
