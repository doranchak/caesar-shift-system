import React, {useState} from 'react';
let MS = 100;
function AnimateScan({updateScanVizGrid, rows, cols}) {
  const doAnimate = () => {
    let diagonals = [];
    for (let startCol = 0; startCol < cols; startCol++) {
      let r = 0, c = startCol;
      let diagonal = [];
      while (r < rows && c >= 0) {
        diagonal.push([r,c]);
        r++;
        c--;
      }
      diagonals.push(diagonal);
    }

    // Diagonals starting from the last column, skipping the first row (to avoid duplicates)
    for (let startRow = 1; startRow < rows; startRow++) {
      let r = startRow, c = cols - 1;
      let diagonal = [];
      while (r < rows && c >= 0) {
        diagonal.push([r,c]);
        r++;
        c--;
      }
      diagonals.push(diagonal);
    }    // doAnimateFrame(0, 0);
    console.log(diagonals);
    doAnimateFrame(diagonals, 0);
  }
  const doAnimateFrame = (diagonals, pos) => {
    if (pos == diagonals.length) {
      updateScanVizGrid([]);
      return;
    }
    updateScanVizGrid(diagonals[pos]);
    setTimeout(() => {
      doAnimateFrame(diagonals, pos+1)
    }, MS);
  }
  return (
    <>
      <button onClick={doAnimate}>Scan Viz</button>
    </>
  );
}

export default AnimateScan;