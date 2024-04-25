document.addEventListener('DOMContentLoaded', function() {
  const uploadButton = document.getElementById('uploadButton');
  const autoFillButton = document.getElementById('autoFillButton');
  const textArea = document.getElementById('textArea');
  const status = document.getElementById('status');

  if (uploadButton && autoFillButton && textArea && status) {
    uploadButton.addEventListener('click', async function() {
      const text = textArea.value.trim();
      if (text === '') {
        status.textContent = 'Please enter some text before uploading.';
        return;
      }

      try {
        const answer = await callLLMModel(text);
        status.textContent = `Text successfully sent to the local LLM. Response: ${answer}`;
      } catch (error) {
        status.textContent = 'Failed to send text to the local LLM.';
        console.error('Error:', error);
      }
    });

    autoFillButton.addEventListener('click', function() {
      chrome.runtime.sendMessage({ action: 'autofillTextFields' });
      status.textContent = 'Auto-Fill triggered.';
    });
  } else {
    console.error('One or more elements not found.');
  }
});