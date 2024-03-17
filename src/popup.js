document.addEventListener('DOMContentLoaded', function() {
  const uploadButton = document.getElementById('uploadButton');
  const autoFillButton = document.getElementById('autoFillButton');
  const textArea = document.getElementById('textArea');
  const status = document.getElementById('status');

  if (uploadButton && autoFillButton && textArea && status) {
    uploadButton.addEventListener('click', function() {
      const text = textArea.value.trim();
      if (text === '') {
        status.textContent = 'Please enter some text before uploading.';
        return;
      }

      // Send the inputted text to the background script
      chrome.runtime.sendMessage({ action: 'uploadText', text }, function(response) {
        // Display the confirmation message
        if (response && response.success) {
          status.textContent = 'Text successfully uploaded!';
        } else {
          status.textContent = 'Failed to upload text.';
        }
      });
    });

    autoFillButton.addEventListener('click', function() {
      // Send message to background script to trigger autofill
      chrome.runtime.sendMessage({ action: 'autofillTextFields' });
      status.textContent = 'Auto-Fill triggered.';
    });
  } else {
    console.error('One or more elements not found.');
  }
});
