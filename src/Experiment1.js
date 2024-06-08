import React, {useState, useEffect} from 'react';
import {createGrid, columnsFrom, doSearchKeyword} from './GridSearch.js';

function Experiment1({wordList, k, n, start}) {  
  const [searchTerms, setSearchTerms] = useState("zodiac zodius guidini");
  const updateSearchTerms = (event) => setSearchTerms(event.target.value);
  const go = () => {
    console.log("-- START search for " + searchTerms);
    let terms = searchTerms.toUpperCase().split(" ");
    let out = "";
    wordList.map((val, index) => {
      let result = 0;
      let grid = createGrid(val[0], k, n, start);
      let columns = columnsFrom(grid);
      terms.map((term, i) => {
        if (doSearchKeyword(term, columns).length > 0) result++;
      });
      if (result == terms.length) {
        console.log(val);
      }
  
    });
    console.log("-- DONE");
  }
  return (
    <>
      <button onClick={go}>Find matches that produce all words</button>
      <input
        value={searchTerms}
        onChange={updateSearchTerms}
      />
    </>
  );
}


export default Experiment1;