// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const express = require('express')
const NewsAPI = require('newsapi');
var request = require('request');
// To query /v2/top-headlines
// All options passed to topHeadlines are optional, but you need to include at least one of them

const app = express()
const port = 3000
const newsApiKey = "05db1a6d780647adaab3b046537c6180"
const apiEndPointHdr = 'https://newsapi.org/v2/everything?q=';
const newsapi = new NewsAPI(newsApiKey);


app.get('/', (req, res) => {
  res.send('Hello World!')
'use strict';
})
app.get('/getsentiments', (req, res) => {
  // Get headlines array
  var topic = req.query.text;
  console.log("Topic=" + topic);
  headlines = getHeadlinesArray(topic, res);

  // Sync headlines array to sheet using single setValues call 
    //analyzeSentimentOfText(headlines);
  //res.send(headlines);
  'use strict';
})

/**
* Fetch current headlines from the Free News API
*/
function scrub(text) {
  return text.replace(/[\‘\,\“\”\"\'\’\-\n\â\]/g, ' ');
}

async function getHeadlinesArray(topic, res) {
// Fetch headlines for a given topic
let hdlnsResp = [];
let articleMax = 20;
let encodedtopic = encodeURIComponent(topic);


console.log("Getting headlines for: " + topic);
var options = {
  'method': 'GET',
  'url': apiEndPointHdr + encodedtopic + '&apiKey=' + newsApiKey,
  'headers': {
  }
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log("News APi Response received: " + response.body);
  let results = JSON.parse(response.body);
  let articles = results["articles"];
  for (let i = 0; i < articles.length && i < articleMax; i++) {
    let newsStory = articles[i]['title'];
    if (articles[i]['description'] !== null) {
      newsStory += ': ' + articles[i]['description'];
    }
    // Scrub newsStory of invalid characters
    newsStory = scrub(newsStory);
  
    // Construct hdlnsResp as a 2d array. This simplifies syncing to sheet.
    hdlnsResp.push(new Array(newsStory));
  }
  console.log("Number of news items is " +  hdlnsResp.length );
  //res.jsonp(hdlnsResp);
  /*for (let i = 0; i < hdlnsResp.length; i++) {
    let headlineCell = hdlnsResp[i];
    if (headlineCell) {
      let sentimentData = analyzeSentimentOfText(headlineCell);
      console.log(JSON.stringify(sentimentData));
      //let result = sentimentData['documentSentiment']['score'];
      let result = sentimentData['score'];
      avg += result;
      ds.getRange(i + 1, sentimentCol + 1).setBackgroundColor(getColor(result));
      ds.getRange(i + 1, sentimentCol + 1).setValue(getFace(result));
      ds.getRange(i + 1, scoreCol + 1).setValue(result);
    }
  }
  let avgDecimal = (avg / hdlnsResp.length).toFixed(2);
  res.send("Overall Score: " + avg);*/
  analyzeSentimentOfText(hdlnsResp, res);
});
//let response = UrlFetchApp.fetch(apiEndPointHdr + encodedtopic + '&apiKey=' + newsApiKey);
/*newsapi.v2.topHeadlines({
  //  sources: 'bbc-news,the-verge',
    q: encodedtopic,
  //  category: 'business',
    language: 'en'
  //  country: 'in'
  }).then(response => {
    console.log("Response=" + JSON.stringify(response));
    let results = JSON.parse(response);
    let articles = results["articles"];
    for (let i = 0; i < articles.length && i < articleMax; i++) {
      let newsStory = articles[i]['title'];
      if (articles[i]['description'] !== null) {
        newsStory += ': ' + articles[i]['description'];
      }
      // Scrub newsStory of invalid characters
      newsStory = scrub(newsStory);
    
      // Construct hdlnsResp as a 2d array. This simplifies syncing to sheet.
      hdlnsResp.push(new Array(newsStory));
    }
    
    return hdlnsResp;
  });*/
}

// sample-metadata:
//  title: Analyze v1
async function analyzeSentimentOfText(text, res) {
  // [START language_sentiment_text]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following line to run this code.
   */
  // const text = 'Your text to analyze, e.g. Hello, world!';

  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Detects the sentiment of the document
  const [result] = await client.analyzeSentiment({document});

  //console.log("Sentiment Analysis Response is: " + JSON.stringify(result));
  const sentiment = result.documentSentiment;
  console.log('Document sentiment:');
  console.log(`  Score: ${sentiment.score}`);
  console.log(`  Magnitude: ${sentiment.magnitude}`);

  const sentences = result.sentences;
  let avg = 0;
  let respFinal = null;
  let resp2 = null;
  sentences.forEach(sentence => {
    resp2 = `Sentence: ${sentence.text.content}` + 
    `  Score: ${sentence.sentiment.score}` + 
    `  Magnitude: ${sentence.sentiment.magnitude}`;
    console.log(resp2);
    respFinal += resp2;
  });
  for (let i = 0; i < sentences.length; i++) {
    let headLine = sentences[i];
    if (headLine) {
      let score = headLine['score'];
      avg += score;
    }
  }
  console.log("Avg=" + avg);
  let avgDecimal = (avg / sentences.length).toFixed(2);
  respFinal += "Avg Score: " + avgDecimal;
  res.send(respFinal);
  
  return sentiment;
  // [END language_sentiment_text]
}

async function analyzeSentimentInFile(bucketName, fileName) {
  // [START language_sentiment_gcs]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following lines to run this code
   */
  // const bucketName = 'Your bucket name, e.g. my-bucket';
  // const fileName = 'Your file name, e.g. my-file.txt';

  // Prepares a document, representing a text file in Cloud Storage
  const document = {
    gcsContentUri: `gs://${bucketName}/${fileName}`,
    type: 'PLAIN_TEXT',
  };

  // Detects the sentiment of the document
  const [result] = await client.analyzeSentiment({document});

  const sentiment = result.documentSentiment;
  console.log('Document sentiment:');
  console.log(`  Score: ${sentiment.score}`);
  console.log(`  Magnitude: ${sentiment.magnitude}`);

  const sentences = result.sentences;
  sentences.forEach(sentence => {
    console.log(`Sentence: ${sentence.text.content}`);
    console.log(`  Score: ${sentence.sentiment.score}`);
    console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
  });
  // [END language_sentiment_gcs]
}

async function analyzeEntitiesOfText(text) {
  // [START language_entities_text]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following line to run this code.
   */
  // const text = 'Your text to analyze, e.g. Hello, world!';

  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Detects entities in the document
  const [result] = await client.analyzeEntities({document});

  const entities = result.entities;

  console.log('Entities:');
  entities.forEach(entity => {
    console.log(entity.name);
    console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
    if (entity.metadata && entity.metadata.wikipedia_url) {
      console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}`);
    }
  });
  // [END language_entities_text]
}

async function analyzeEntitiesInFile(bucketName, fileName) {
  // [START language_entities_gcs]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following lines to run this code
   */
  // const bucketName = 'Your bucket name, e.g. my-bucket';
  // const fileName = 'Your file name, e.g. my-file.txt';

  // Prepares a document, representing a text file in Cloud Storage
  const document = {
    gcsContentUri: `gs://${bucketName}/${fileName}`,
    type: 'PLAIN_TEXT',
  };

  // Detects entities in the document
  const [result] = await client.analyzeEntities({document});
  const entities = result.entities;

  console.log('Entities:');
  entities.forEach(entity => {
    console.log(entity.name);
    console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
    if (entity.metadata && entity.metadata.wikipedia_url) {
      console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}`);
    }
  });

  // [END language_entities_gcs]
}

async function analyzeSyntaxOfText(text) {
  // [START language_syntax_text]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following line to run this code.
   */
  // const text = 'Your text to analyze, e.g. Hello, world!';

  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Need to specify an encodingType to receive word offsets
  const encodingType = 'UTF8';

  // Detects the sentiment of the document
  const [syntax] = await client.analyzeSyntax({document, encodingType});

  console.log('Tokens:');
  syntax.tokens.forEach(part => {
    console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
    console.log('Morphology:', part.partOfSpeech);
  });
  // [END language_syntax_text]
}

async function analyzeSyntaxInFile(bucketName, fileName) {
  // [START language_syntax_gcs]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following lines to run this code
   */
  // const bucketName = 'Your bucket name, e.g. my-bucket';
  // const fileName = 'Your file name, e.g. my-file.txt';

  // Prepares a document, representing a text file in Cloud Storage
  const document = {
    gcsContentUri: `gs://${bucketName}/${fileName}`,
    type: 'PLAIN_TEXT',
  };

  // Need to specify an encodingType to receive word offsets
  const encodingType = 'UTF8';

  // Detects the sentiment of the document
  const [syntax] = await client.analyzeSyntax({document, encodingType});

  console.log('Parts of speech:');
  syntax.tokens.forEach(part => {
    console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
    console.log('Morphology:', part.partOfSpeech);
  });
  // [END language_syntax_gcs]
}

async function analyzeEntitySentimentOfText(text) {
  // [START language_entity_sentiment_text]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following line to run this code.
   */
  // const text = 'Your text to analyze, e.g. Hello, world!';

  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Detects sentiment of entities in the document
  const [result] = await client.analyzeEntitySentiment({document});
  const entities = result.entities;

  console.log('Entities and sentiments:');
  entities.forEach(entity => {
    console.log(`  Name: ${entity.name}`);
    console.log(`  Type: ${entity.type}`);
    console.log(`  Score: ${entity.sentiment.score}`);
    console.log(`  Magnitude: ${entity.sentiment.magnitude}`);
  });
  // [END language_entity_sentiment_text]
}

async function analyzeEntitySentimentInFile(bucketName, fileName) {
  // [START language_entity_sentiment_gcs]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following lines to run this code
   */
  // const bucketName = 'Your bucket name, e.g. my-bucket';
  // const fileName = 'Your file name, e.g. my-file.txt';

  // Prepares a document, representing a text file in Cloud Storage
  const document = {
    gcsContentUri: `gs://${bucketName}/${fileName}`,
    type: 'PLAIN_TEXT',
  };

  // Detects sentiment of entities in the document
  const [result] = await client.analyzeEntitySentiment({document});
  const entities = result.entities;

  console.log('Entities and sentiments:');
  entities.forEach(entity => {
    console.log(`  Name: ${entity.name}`);
    console.log(`  Type: ${entity.type}`);
    console.log(`  Score: ${entity.sentiment.score}`);
    console.log(`  Magnitude: ${entity.sentiment.magnitude}`);
  });
  // [END language_entity_sentiment_gcs]
}

async function classifyTextOfText(text) {
  // [START language_classify_text]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following line to run this code.
   */
  // const text = 'Your text to analyze, e.g. Hello, world!';

  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Classifies text in the document
  const [classification] = await client.classifyText({document});
  console.log('Categories:');
  classification.categories.forEach(category => {
    console.log(`Name: ${category.name}, Confidence: ${category.confidence}`);
  });
  // [END language_classify_text]
}

async function classifyTextInFile(bucketName, fileName) {
  // [START language_classify_gcs]
  // Imports the Google Cloud client library.
  const language = require('@google-cloud/language');

  // Creates a client.
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following lines to run this code
   */
  // const bucketName = 'Your bucket name, e.g. my-bucket';
  // const fileName = 'Your file name, e.g. my-file.txt';

  // Prepares a document, representing a text file in Cloud Storage
  const document = {
    gcsContentUri: `gs://${bucketName}/${fileName}`,
    type: 'PLAIN_TEXT',
  };

  // Classifies text in the document
  const [classification] = await client.classifyText({document});

  console.log('Categories:');
  classification.categories.forEach(category => {
    console.log(`Name: ${category.name}, Confidence: ${category.confidence}`);
  });
  // [END language_classify_gcs]
}



  app.listen(port, () => {
    console.log("Sentiment Analyser app istening at http://localhost:" + port);
  })
