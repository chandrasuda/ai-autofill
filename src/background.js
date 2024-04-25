async function callLLMModel(text) {
  try {
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are an intelligent assistant. You always provide well-reasoned answers that are both correct and helpful.' },
          { role: 'user', content: text },
        ],
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get answer');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error:', error);
    return 'Failed to get answer from the local LLM.';
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'uploadText') {
    const { text } = request;
    console.log('Uploaded Text:', text);
    chrome.storage.local.set({ fileContent: text }, () => {
      sendResponse({ success: true });
    });
    return true;
  } else if (request.action === 'autofillFields') {
    chrome.storage.local.get('fileContent', async (data) => {
      const uploadedText = data.fileContent || '';
      chrome.tabs.executeScript({
        code: `
          const inputFields = Array.from(document.querySelectorAll('input[type="text"], textarea'));
          inputFields.forEach(input => {
            input.value = '${uploadedText}';
          });
          console.log("Input fields autofilled with uploaded text.");
        `,
      });
      sendResponse({ success: true });
    });
    return true;
  }
});