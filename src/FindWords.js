import React, {useState} from 'react';
import LengthSelector from './LengthSelector';
import words from './words.js';

function FindWords({doSearchKeyword, doSearchUpdate}) {
  // word list
  const [wordList, setWordList] = useState([]);
  // word list search results
  const [wordListResults, setWordListResults] = useState([]);
  const [wordListResultsAll, setWordListResultsAll] = useState([]);
  const [wordListResultsLengths, setWordListResultsLengths] = useState([]);
  const [selectedWordListResult, setSelectedWordListResult] = useState(-1);  
  const [wordListLengthFilter, setWordListLengthFilter] = useState(0);  

  const doFindWords = (limitPerLength, minLength) => {
    let wordFreqPairs = wordList;
    if (wordFreqPairs.length == 0) {
      wordFreqPairs = parseTextContent(words);
      setWordList(wordFreqPairs);
    }
    let hits = [];
    let maxlengths = [];
    wordFreqPairs.map((pair, index) => {
      let [word, freq] = pair;
      let len = word.length;
      if (len >= minLength) {
        let matches = doSearchKeyword(word);
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
  };
  const selectWordListResultValue = (event) => {
    let index = event.target.value;
    setSelectedWordListResult(index);
    let matches = doSearchKeyword(wordListResults[index]);
    doSearchUpdate(matches);    
  }
  
  const randomWordListResult = () => {
    let index = Math.floor(Math.random() * wordListResults.length);
    setSelectedWordListResult(index);
    let matches = doSearchKeyword(wordListResults[index]);
    doSearchUpdate(matches);    
  }
  
  function selectWordListLengthFilter(event) {
    let selected = event.target.value;
    console.log(selected);
    if (selected == '') {
      setWordListResults(wordListResultsAll);
      return;
    }
    setWordListLengthFilter(selected);
    let wordListResultsNew = [];
    wordListResultsAll.map((word,index) => {if (word.length == selected) wordListResultsNew.push(word);});
    setWordListResults(wordListResultsNew);
  }  
  
  return (
    <>
      <button onClick={() => doFindWords(100, 4)}>Find words</button>
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