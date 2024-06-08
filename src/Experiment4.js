import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {createGrid, columnsFrom, doSearchKeyword} from './GridSearch.js';
const URL_PREFIX = "http://localhost:8888";

function Experiment4({wordList, k, n, start}) {  
  const go = () => {
    console.log("-- START search for zodiac words");

    axios.get(URL_PREFIX + '/api/zodiac_words')
    .then(response => {
      wordList.map((word, index) => {
        let grid = createGrid(word[0], k, n, start);
        let columns = columnsFrom(grid);    
        let result = "";
        let count = 0;
        let sizesum = 0;
        response.data.map((val, index) => {
          let zodiacword = val[0];
          if (doSearchKeyword(zodiacword, columns).length > 0) {
            result += zodiacword + " ";
            count++;
            sizesum += zodiacword.length;
          }
        });
        if (count > 0) {
          console.log(word[0] + " " + count + " " + sizesum + " " + result);
        }
        });
    console.log("-- DONE");
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }
  return (
    <>
      <button onClick={go}>Find Zodiac words</button>
    </>
  );
}


export default Experiment4;