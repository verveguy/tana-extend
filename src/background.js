/* 
  background.js is the web worker code, which is basically "faceless" from a
  browser tab perspective.

  From here we execute the content.js script against the active tab when the 
  extension is invoked.

  The code is built via webpack, allowing us to include external modules

  See App.tsx for an overview of how this code interacts with the browser
  tab and the injected content.js script generated from the React app.
*/

import { OpenAIClient } from 'openai-fetch';

// anything needed at extension startup time, add it here
chrome.runtime.onInstalled.addListener(() => {
  console.log("Installed tana_extend");
  // mark our extension to say we're alive
  // chrome.action.setBadgeText({
  //   text: "AWAKE",
  // });
});

// Add our main listener for extension activation via the icon
chrome.action.onClicked.addListener(async (tab) => {
  // invoke the main code within the context of the foreground 
  // chrome tab process. Note we do not expect a response from
  // this message
  sendInvokeMessage({ command: "tana-extend" })
    .then(() => { console.log("Click action complete"); });
});

// and one for keyboard activation of the extension
chrome.commands.onCommand.addListener((command) => {
  // invoke the main code within the context of the foreground 
  // chrome tab process. Note we do not expect a response from
  // this message
  sendInvokeMessage({ command: "tana-extend" })
    .then(() => { console.log("Command action complete"); });
});


/* 
  helper functions related to our use of content.js to do various operations
  and the required messaging back and forth to the React app contained within
  content.js
*/

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

// send a message to the React app in content.js in the browser tab
async function sendInvokeMessage(message, tab = undefined) {
  if (tab === undefined) {
    tab = await getCurrentTab();
  }
  const response = await chrome.tabs.sendMessage(tab.id, message);
  return {response, tab};
}

// listen for commands back from the content.js script running in the page
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  let cmdfunc = undefined;

  // TODO: make this easily extensible for different command functions
  if (request.command === "chatgpt") {
    cmdfunc = doChatGPT;
  }
  else if (request.command === "summarize") {
    cmdfunc = doChatGPTSummarize;
  }

  if (cmdfunc !== undefined) {
    // invoke the actual function
    doCommand(cmdfunc)
      .then(() => {
        sendResponse({ response: "happily ever after" });
      });
    return true; // signal we will send async responses
  }
});


// We wrap the command invocation with get/set clipboard
// since that the only way to get data in/out of the Tana
// app at the moment. Note that we wrap the result 
// with the tana paste `%%tana%%` sentinel. So make sure
// your commands generate tana-paste format output

async function doCommand(commandFunction) {
  let {response, tab} = await sendInvokeMessage({ command: "get-clipboard" });
  let clipboard = response.clipboard;

  // munge the clipboard data
  let data = await commandFunction(clipboard);
  data = "%%tana%%\n" + data;

  await sendInvokeMessage({ command: "set-clipboard", clipboard: data }, tab);
}

//import openaiapikey from './openai.apikey.config.js';

let configuration  = {};

let openai = undefined;

// Watch for changes to the user's configuration & apply them
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.configuration) {
    configuration = changes.configuration.newValue;
    const apiKey = configuration.chatGPT.properties.openAIAPIKey.value;
    openai = apiKey ? new OpenAIClient({ apiKey: apiKey }) : undefined;
  }
});

// read our stored configuration, if any
chrome.storage.sync.get("configuration").then((data) => {
  Object.assign(configuration, data.configuration);
  if (configuration) {
    const apiKey = configuration.chatGPT.properties.openAIAPIKey.value;
    openai = apiKey ? new OpenAIClient({ apiKey: apiKey }) : undefined;
  }
});

// call ChatGPT to prcess an arbitrary prompt
async function doChatGPT(notes) {
  const request = {
    model: configuration.chatGPT.properties.chatGPTModel.value,
    messages: [
      { role: "system", content: "You are a diligent note taker" },
      { role: "user", content: notes },
    ]
  };
  return callChatGPT(request);
};

// call ChatGPT to summarie the notes
async function doChatGPTSummarize(notes) {
  const request = {
    model: configuration.chatGPT.properties.chatGPTModel.value,
    messages: [
      { role: "system", content: "You are a diligent note taker" },
      { role: "user", content: "Please summarize the following notes in bullet point form.\n"+notes },
    ]
  };
  return callChatGPT(request);
};


async function callChatGPT(request) {
  let response;

  if (openai === undefined)
    return "Please set OpenAI API Key in configuration";

  try {
    response = await openai.createChatCompletion(request);
  }
  catch (err) {
    console.error("OpenAI error: " + err);
    return "OpenAI error: " + err;
  }

  const result = response ? response.message.content : "(error)";
  return result ? result : "no result";
};


