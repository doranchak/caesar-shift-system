import React, {useState, useEffect} from 'react';
import axios from 'axios';

const ZKC_API_URL = process.env.REACT_APP_ZKC_API_URL
console.log("API: ", ZKC_API_URL);
// const URL_PREFIX = "http://localhost:8888";
function ServerMessage({}) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(ZKC_API_URL + '/api/hello')
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        setMessage("Error: " + error);
        console.error('Error fetching data:', error);
      });
  }, []);
  return (
    <>
      <h4>Message:</h4>
      {message}
    </>
  );
}

export default ServerMessage;
