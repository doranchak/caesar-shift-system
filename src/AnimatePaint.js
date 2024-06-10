import React, {useState} from 'react';
let MS = 1000;
function AnimatePaint({styleSheet, letters}) {
  const doAnimate = () => {
    letters = scrambleString(letters);
    doAnimateFrame(letters, 0);
  }
  const doAnimateFrame = (letters, pos) => {
    if (pos >= letters.length) return;
    const className = `.letter_${letters[pos]}`;
    const rules = `background-color: ${getRandomRgbColor()}`
    addCSSRule(styleSheet, className, rules, styleSheet.cssRules.length);
    setTimeout(() => {
      doAnimateFrame(letters, pos+1);
    }, MS);

  }
  return (
    <>
      <button onClick={doAnimate}>Paint Viz</button>
    </>
  );
}
function addCSSRule(sheet, selector, rules, index) {
  if ('insertRule' in sheet) {
    sheet.insertRule(`${selector} { ${rules} }`, index);
  } else if ('addRule' in sheet) {
    sheet.addRule(selector, rules, index);
  }
}

function getRandomRgbColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function scrambleString(str) {
  // Convert the string to an array of characters
  let arr = str.split('');
  
  // Iterate over the array from the end to the beginning
  for (let i = arr.length - 1; i > 0; i--) {
      // Generate a random index
      let j = Math.floor(Math.random() * (i + 1));
      
      // Swap the elements at i and j
      [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  // Convert the array back to a string and return it
  return arr.join('');
}
  
export default AnimatePaint;