import OpenAI from 'openai';

async function callLLMModel(question, documentContent) {
  const client = new OpenAI('http://localhost:1234/v1', 'not-needed');

  const messages = [
    { role: 'system', content: 'You are a helpful assistant that provides concise and relevant answers based on the given context.' },
    { role: 'user', content: question },
    { role: 'context', content: documentContent },
  ];

  const completion = await client.chat.completions.create(
    {
      model: 'local-model',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1, // Limit to one-word answers
      stop: ['\n'], // Stop generation at new lines to ensure only one word
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const answer = completion.choices[0].message.content.trim(); // Trim any leading/trailing spaces
  return answer;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAnswer') {
    chrome.storage.local.get('fileContent', (data) => {
      const documentContent = data.fileContent || '';
      const answer = callLLMModel(request.question, documentContent);
      sendResponse({ answer });
    });
  }
  return true;
});
