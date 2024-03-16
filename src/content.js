chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autofillFields') {
    const inputFields = Array.from(document.querySelectorAll('input, textarea'));
    inputFields.forEach((field) => {
      const question = field.placeholder || field.title || '';
      if (question) {
        chrome.runtime.sendMessage({ action: 'getAnswer', question }, (response) => {
          field.value = response.answer;
        });
      }
    });

    const radioButtons = Array.from(document.querySelectorAll('input[type="radio"]'));
    radioButtons.forEach((button) => {
      const question = button.value || button.title || '';
      if (question) {
        chrome.runtime.sendMessage({ action: 'getRadioAnswer', question }, (response) => {
          if (response.answer.toLowerCase() === 'yes') {
            button.checked = true;
          }
        });
      }
    });
  }
});
