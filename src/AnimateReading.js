import React, {useState} from 'react';
let MS = 150;
function AnimateReading({setReadingVizRow, setReadingVizCol, rows, cols}) {
  const doAnimate = () => {
    doAnimateFrame(0, 0);
  }
  const doAnimateFrame = (row, col) => {
    if (row == rows) {
      col++;
      row = 0;
    }
    if (col == cols) return;
    setReadingVizRow(row);
    setReadingVizCol(col+1);
    setTimeout(() => {
      doAnimateFrame(row+1, col);
    }, MS);
  }
  return (
    <>
      <button onClick={doAnimate}>Reading Viz</button>
    </>
  );
}

export default AnimateReading;