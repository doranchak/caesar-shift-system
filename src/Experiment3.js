import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {createGrid, columnsFrom, doSearchKeyword} from './GridSearch.js';
const URL_PREFIX = "http://localhost:8888";

function Experiment3({wordList, k, n, start}) {  
  const [searchTerms, setSearchTerms] = useState("zodiac zodius guidini");
  const updateSearchTerms = (event) => setSearchTerms(event.target.value);
  const go = () => {
    console.log("-- START search for " + searchTerms);
    let terms = searchTerms.toUpperCase().split(" ");
    let out = "";

    axios.get(URL_PREFIX + '/api/corpus?name=big')
    .then(response => {
      let words =response.data.corpus.split(" ");
      let seen = [];
      for (let i=0; i<words.length; i++) {
        // if (i>0 && i%100000 == 0) console.log(i+"...");
        let go = true;
        let wordsSpaces = "";
        let wordsNoSpaces = "";
        let j=i;
        while (true) {
          let word = words[j];
          if (wordsSpaces.length > 0) wordsSpaces += " ";
          wordsSpaces += word;
          wordsNoSpaces += word;
          let grid = createGrid(wordsNoSpaces, k, n, start);
          let columns = columnsFrom(grid);    
          let result = 0;
          terms.map((term, i) => {
            if (doSearchKeyword(term, columns).length > 0) result++;
          });
          if (result == terms.length && !seen[wordsSpaces]) {
            console.log(wordsSpaces);
            seen[wordsSpaces] = 1;
            break;
          }
          if (wordsNoSpaces.length > 25)
            break;
          j++;
        }
      }
      console.log("-- DONE");
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }
  return (
    <>
      <button onClick={go}>Find corpus matches that produce all words</button>
      <input
        value={searchTerms}
        onChange={updateSearchTerms}
      />
    </>
  );
}


export default Experiment3;