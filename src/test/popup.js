document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const logButton = document.getElementById('logButton');
  
    logButton.addEventListener('click', function() {
      const enteredText = inputText.value;
      chrome.extension.getBackgroundPage().console.log('Entered text:', enteredText);
    });
  });