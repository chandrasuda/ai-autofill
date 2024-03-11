chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'getAnswer') {
      const documentFiles = await chrome.storage.local.get('documentFiles');
      const documentContents = documentFiles.documentFiles.map((file) => file.contents).join('\n');
      const answer = await callAIModel(request.question, documentContents);
      sendResponse({ answer });
    }
   });
   
   async function callAIModel(question, documentContents) {
    const modelPath = chrome.runtime.getURL('model/model.bin');
    const model = await loadModel(modelPath);
    const answer = await getAnswerFromModel(model, question, documentContents);
    return answer;
   }
   
   async function loadModel(modelPath) {
    const modelData = await fetch(modelPath).then((response) => response.arrayBuffer());
    const modelLoader = new ModelLoader();
    const model = await modelLoader.loadModel(modelData);
    return model;
   }
   
   async function getAnswerFromModel(model, question, documentContents) {
    const retriever = new DocumentRetriever(documentContents);
    const relevantDocuments = await retriever.retrieveRelevantDocuments(question);
   
    const generator = new AnswerGenerator(model);
    const answer = await generator.generateAnswer(question, relevantDocuments);
   
    return answer;
   }
   
   class ModelLoader {
    async loadModel(modelData) {
      const vocab = await this.loadVocabulary(modelData);
      const weights = await this.loadWeights(modelData);
      const model = new LLMModel(vocab, weights);
      return model;
    }
   
    async loadVocabulary(modelData) {
      const vocabStart = modelData.indexOf('__vocabulary__');
      const vocabEnd = modelData.indexOf('__vocabulary_end__');
      const vocabData = modelData.slice(vocabStart + '__vocabulary__'.length, vocabEnd);
      const vocab = new Map();
      vocabData.split('\n').forEach((entry, index) => {
        vocab.set(index, entry);
      });
      return vocab;
    }
   
    async loadWeights(modelData) {
      const weightsStart = modelData.indexOf('__weights__');
      const weightsEnd = modelData.indexOf('__weights_end__');
      const weightsData = modelData.slice(weightsStart + '__weights__'.length, weightsEnd);
      const weights = new Float32Array(weightsData.split(',').map(parseFloat));
      return weights;
    }
   }
   
   class DocumentRetriever {
    constructor(documentContents) {
      this.documents = this.parseDocuments(documentContents);
    }
   
    parseDocuments(documentContents) {
      const documents = documentContents.split('\n\n').map((doc) => ({
        text: doc,
        tokens: doc.split(' '),
      }));
      return documents;
    }
   
    async retrieveRelevantDocuments(query) {
      const queryTokens = query.split(' ');
      const relevantDocuments = this.documents.filter((doc) =>
        queryTokens.some((token) => doc.tokens.includes(token))
      );
      return relevantDocuments;
    }
   }
   
   class AnswerGenerator {
    constructor(model) {
      this.model = model;
    }
   
    async generateAnswer(question, relevantDocuments) {
      const inputData = this.prepareInput(question, relevantDocuments);
      const outputData = await this.model.predict(inputData);
      const answer = this.decodeOutput(outputData);
      return answer;
    }
   
    prepareInput(question, relevantDocuments) {
      const input = `Question: ${question}\nContext:\n${relevantDocuments
        .map((doc) => doc.text)
        .join('\n')}\n`;
      return input;
    }
   
    decodeOutput(outputData) {
      const answer = outputData.join(' ');
      return answer;
    }
   }
   
   class LLMModel {
    constructor(vocab, weights) {
      this.vocab = vocab;
      this.weights = weights;
    }
   
    async predict(inputData) {
      const tokens = inputData.split(' ').map((token) => this.vocab.get(token));
      const inputTensor = new Float32Array(tokens);
      const outputTensor = new Float32Array(tokens.length);
   
      // need to load local LLM model
      for (let i = 0; i < tokens.length; i++) {
        outputTensor[i] = inputTensor[i] * this.weights[i % this.weights.length];
      }
   
      const outputTokens = outputTensor.map((value) =>
        this.vocab.get(value.toString())
      );
      return outputTokens;
    }
   }