document.getElementById('uploadButton').addEventListener('click', () => {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = reader.result;
      chrome.storage.local.set({ fileContent }, () => {
        document.getElementById('status').textContent = 'Document uploaded successfully';
        document.getElementById('autofillButton').disabled = false;
      });
    };
    reader.readAsText(file);
  }
});

document.getElementById('autofillButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'autofillFields' });
  });
});
