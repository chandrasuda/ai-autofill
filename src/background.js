async function callLLMModel(question, documentContent) {
  const endpoint = 'http://localhost:1234/v1/chat/completions';
  const queryParams = new URLSearchParams({
    messages: JSON.stringify([
      { role: 'system', content: 'Provide a relevant answer based on the given context.' },
      { role: 'user', content: question }
    ]),
    temperature: 0.7,
    max_tokens: -1,
    stream: false
  });

  const response = await fetch(`${endpoint}?${queryParams}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error('Failed to get answer');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'uploadText') {
    const { text } = request;
    console.log('Uploaded Text:', text); // Log the uploaded text

    chrome.storage.local.set({ fileContent: text }, () => {
      // Send confirmation after storage update
      sendResponse({ success: true });
    });

    // Return true to indicate that sendResponse will be called asynchronously
    return true;
  } else if (request.action === 'autofillFields') {
    chrome.storage.local.get('fileContent', async (data) => {
      const uploadedText = data.fileContent || ''; // Retrieve uploaded text or use empty string
      
      // Execute script in the active tab to autofill input fields with the uploaded text
      chrome.tabs.executeScript({
        code: `
          const inputFields = Array.from(document.querySelectorAll('input[type="text"], textarea'));
          inputFields.forEach(input => {
            input.value = '${uploadedText}';
          });
          console.log("Input fields autofilled with uploaded text.");
        `
      });

      sendResponse({ success: true });
    });
    return true; // Already using async handling
  }
});
