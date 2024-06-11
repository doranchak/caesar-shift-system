import React, {useState} from 'react';
import LengthSelector from './LengthSelector';
import axios from 'axios';
import './FindWords.css';
import Experiment1 from './Experiment1';
import Experiment2 from './Experiment2';
import Experiment3 from './Experiment3';
import Experiment4 from './Experiment4';
import Experiment5 from './Experiment5';

const URL_PREFIX = "http://localhost:8888";

function FindWords({columns, doSearchKeyword, doSearchUpdate, createGrid, columnsFrom, setGridHighlights, setGridHighlightsOverride, k, n, start, keyword}) {
  // word list
  const [wordList, setWordList] = useState([]);
  const [selectedDictionary, setSelectedDictionary] = useState(0);
  // word list search results
  const [wordListResults, setWordListResults] = useState([]);
  const [wordListResultsAll, setWordListResultsAll] = useState([]);
  const [wordListResultsLengths, setWordListResultsLengths] = useState([]);
  const [selectedWordListResult, setSelectedWordListResult] = useState(-1);  
  const [wordListLengthFilter, setWordListLengthFilter] = useState(0);  
  const [buttonMessage, setButtonMessage] = useState('');

  const doFindWords = (limitPerLength, minLength) => {
    if (wordList.length == 0) {
      setButtonMessage("Fetching words...");
      axios.get(URL_PREFIX + '/api/words')
      .then(response => {
        setWordList(response.data);
        doFindWordsSub(limitPerLength, minLength, response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    } else doFindWordsSub(limitPerLength, minLength, wordList);
  };

  const loadWordList = (which) => {
    setButtonMessage("Fetching...");
    axios.get(URL_PREFIX + endpointFor(which))
    .then(response => {
      setWordList(response.data);
      setButtonMessage("");
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }

  const endpointFor = (which) => {
    if (which == 0) return '/api/words';
    if (which == 1) return '/api/names_last';
    if (which == 2) return '/api/names_first_male';
    if (which == 3) return '/api/names_first_female';
    if (which == 4) return '/api/ten_million_names';
    if (which == 5) return '/api/suspects';
    if (which == 6) return '/api/zodiac_words';
    return 'UNKNOWN';
  }

  const doFindWordsSub = (limitPerLength, minLength, wordList) => {
    let hits = [];
    let maxlengths = [];
    wordList.map((pair, index) => {
      let [word, freq] = pair;
      let len = word.length;
      if (len >= minLength) {
        let matches = doSearchKeyword(word, columns);
        if (matches.length > 0) {
          if (!maxlengths[len]) maxlengths[len] = 0;
          maxlengths[len]++;
          if (maxlengths[len] <= limitPerLength) {
            hits.push(word);
          }
        }
      }
    });
    setWordListResults(hits);
    setWordListResultsAll(hits); // copy for filtering
    setWordListResultsLengths(lengthsFromResults(hits));
    setButtonMessage(hits.length + " matches.");
    console.log(hits);
  };

  const selectWordListResultValue = (event) => {
    let index = event.target.value;
    setSelectedWordListResult(index);
    let matches = doSearchKeyword(wordListResults[index], columns);
    doSearchUpdate(matches);    
  }
  
  const randomWordListResult = () => {
    let index = Math.floor(Math.random() * wordListResults.length);
    setSelectedWordListResult(index);
    let matches = doSearchKeyword(wordListResults[index], columns);
    doSearchUpdate(matches);    
  }
  
  function selectWordListLengthFilter(event) {
    let selected = event.target.value;
    if (selected == '') {
      setWordListResults(wordListResultsAll);
      return;
    }
    setWordListLengthFilter(selected);
    let wordListResultsNew = [];
    wordListResultsAll.map((word,index) => {if (word.length == selected) wordListResultsNew.push(word);});
    setWordListResults(wordListResultsNew);
  }  

  function selectedDictionaryChange(event) {
    setSelectedDictionary(event.target.selectedIndex);
    loadWordList(event.target.selectedIndex);

    setWordListResults([]);
    setWordListResultsAll([]);
    setWordListResultsLengths([]);
    setSelectedWordListResult(-1);
  }

  return (
    <>
      <select value={selectedDictionary} onChange={selectedDictionaryChange}>
        <option value="0">Words</option>
        <option value="1">Names (last)</option>
        <option value="2">Names (first, male)</option>
        <option value="3">Names (first, female)</option>
        <option value="4">10,000,000 full names</option>
        <option value="5">Suspects</option>
        <option value="6">Zodiac words</option>
      </select>
      <br/>
      <button onClick={() => doFindWords(10000, 3)}>Find</button><span className="button-message">{buttonMessage}</span>
      {wordListResults.length > 0 && 
        <>
          <br></br>
          <select value={selectedWordListResult} onChange={selectWordListResultValue}>
            <option/>
            {wordListResults.map((word, index) => (
              <option key={index} value={index}>{word}</option>
            ))}
          </select><br></br>
          <button onClick={randomWordListResult}>Random</button>
          <br></br>
          <LengthSelector wordListResultsLengths={wordListResultsLengths} onChange={selectWordListLengthFilter}/>
        </>
      }
      <p><Experiment1 wordList={wordList} k={k} n={n} start={start}/></p>
      <p><Experiment2 columns={columns}/></p>
      <p><Experiment3 wordList={wordList} k={k} n={n} start={start}/></p>
      <p><Experiment4 wordList={wordList} k={k} n={n} start={start}/></p>
      <p><Experiment5 wordList={wordList} k={k} n={n} start={start} keyword={keyword} columns={columns} setGridHighlights={setGridHighlights} setGridHighlightsOverride={setGridHighlightsOverride}/></p>
    </>
  );
}

// Function to parse the text content and extract word-frequency pairs
function parseTextContent(content) {
  // Split the content into lines
  const lines = content.trim().split('\n');

  // Initialize an empty array to store word-frequency pairs
  const wordFreqPairs = [];

  // Iterate through each line
  lines.forEach(line => {
      // Split each line by whitespace
      const parts = line.trim().split(/\s+/);

      // Extract the word and frequency
      const word = parts[0];
      const frequency = parseInt(parts[1]);

      // Push the word-frequency pair to the array
      wordFreqPairs.push([ word, frequency ]);
  });

  return wordFreqPairs;
}

function lengthsFromResults(results) {
  let lengths = new Set();
  results.map((word, index) => {
    lengths.add(word.length);
  });
  return Array.from(lengths).sort((a,b)=>b-a);
}
  
export default FindWords;