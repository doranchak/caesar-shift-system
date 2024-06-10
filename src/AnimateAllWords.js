import React, {useState} from 'react';
let MS = 100;
function AnimateAllWords({rows, cols, wordLength, setGridHighlight, setWordVizCounter}) {
  const gh = () => {
    const gridHighlight = [];
    for (let i = 0; i<rows; i++) {
      const row = [];
      for (let j = 0; j <= cols; j++) {
        row.push(0);
      }
      gridHighlight.push(row);
    }
    return gridHighlight;
  }
  const doAnimate = () => {
    let gridHighlight = gh();
    console.log("Starting...");
    let arr = [];
    permutations(arr);

    doAnimateFrame(arr, 0);
    console.log(arr.length + " frames.");
    // for (let i=100; i<200; i++)
    //   console.log(arr[i].toString());
    // arr[100].map((item, index) => {
    //   gridHighlight[item[0]][item[1]+1] = 1;
    // });
    // setGridHighlight(gridHighlight);

    // let state = {};
    // state.gridHighlight = gridHighlight;
    // state.counter = 0;
    // console.log("Starting...");
    // for (let colstart=0; colstart<cols-wordLength+1; colstart++) {
    //   state.word = [];
    //   state.pos = 0;
    //   for (let col=colstart; col<colstart+wordLength; col++) state.word.push([0, col]);
    //   doAnimateFrame(state);
    // }
    // console.log("Count:", state.counter);

    // setTimeout(() => {
    //   doAnimateFrame(state);
    // }, MS);
  }

  const doAnimateFrame = (arr, pos) => {
    if (pos >= arr.length) return;
    let gridHighlight = gh();
    arr[pos].map((item, index) => {
      gridHighlight[item[0]][item[1]+1] = 1;
    });
    setGridHighlight(gridHighlight);
    setWordVizCounter((pos+1) + " words.");
    if (MS > 0) MS -= 0.2;
    setTimeout(() => {
      doAnimateFrame(arr, pos+1);
    }, MS);
  }

  const permutations = (arr) => {
    let state = {};
    for (let colstart=0; colstart<cols-wordLength+1; colstart++) {
      state.word = [];
      state.pos = 0;
      for (let col=colstart; col<colstart+wordLength; col++) state.word.push([0, col]);
      permutationsSub(arr, state);
    }
  }
  const permutationsSub = (arr, state) => {
    if (state.pos == wordLength) {
      let item = [];
      for (let i=0; i<state.word.length; i++) {
        item[i] = [];
        item[i][0] = state.word[i][0];
        item[i][1] = state.word[i][1];
      }
      arr.push(item);
      return;
    }
    for (let row=0; row<rows; row++) {
      state.word[state.pos][0] = row;
      state.pos++;
      permutationsSub(arr, state);
      state.pos--;
    }
  }
  return (
    <>
      <button onClick={doAnimate}>Word Viz</button>
    </>
  );
}
  
export default AnimateAllWords;