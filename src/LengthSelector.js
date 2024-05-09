import React, {useState} from 'react';


function LengthSelector({wordListResultsLengths, onChange}) {
    const [wordListLengthFilter, setWordListLengthFilter] = useState(0);

    return (
        <select value={wordListLengthFilter} onChange={onChange}>
        <option></option>
        {wordListResultsLengths.map((len, index) => (
          <option key={index} value={len}>{len}</option>
        ))}
      </select>
      );
  }
  
export default LengthSelector;