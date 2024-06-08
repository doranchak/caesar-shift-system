import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {doSearchKeyword} from './GridSearch.js';

const URL_PREFIX = "http://localhost:8888";

function Experiment2({columns}) {  
  const go = () => {
    console.log("-- START");
    axios.get(URL_PREFIX + '/api/corpus?name=big')
    .then(response => {
      let words =response.data.corpus.split(" ");
      let seen = [];
      for (let i=0; i<words.length; i++) {
        let go = true;
        let j=i;
        let result = "";
        while (true) {
          let word = words[j];
          if (doSearchKeyword(word, columns).length > 0) {
            j++;
            result += word + " ";
          } else {
            if (result.length > 0 && !seen[result]) {
              console.log(result);
              seen[result] = 1;
            }
            break;
          }
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
      <button onClick={go}>Corpus samples where each word is found</button>
    </>
  );
}


export default Experiment2;