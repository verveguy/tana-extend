/* 
  background.js is the web worker code, which is basically "faceless" from a
  browser tab perspective.

  From here we execute the content.js script against the active tab when the 
  extension is invoked.
*/

import { OpenAIClient } from 'openai-fetch';
import openaiapikey from './openai.apikey.config.js';

const openai = new OpenAIClient({ apiKey: openaiapikey });

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function sendInvokeMessage(message, tab = undefined) {
  console.log(message);
  if (tab === undefined) {
    console.log("Getting tab");
    tab = await getCurrentTab();
  }
  const response = await chrome.tabs.sendMessage(tab.id, message);
  // do something with response here, not outside the function
  console.log(response);
  return {response, tab};
}

// listen for commands from the content.js script running in the page
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(sender.tab ?
    "from a content script:" + sender.tab.url :
    "from the extension");
  console.log(request);

  if (request.command === "chatgpt") {
    // invoke the actual function
    doCommand(doChatGPT)
      .then(() => {
        sendResponse({ response: "happily ever after" });
      });
    return true; // signal we will send async responses
  }
});

// the function that does most of the work
async function doCommand(commandFunction) {
  let {response, tab} = await sendInvokeMessage({ command: "get-clipboard" });
  let clipboard = response.clipboard;

  // munge the clipboard data
  let data = await commandFunction(clipboard);
  data = "%%tana%%\n" + data;

  await sendInvokeMessage({ command: "set-clipboard", clipboard: data }, tab);
}

// call ChatGPT to summarize things
async function doChatGPT(notes) {
  console.log("Call ChatGPT");
  let response;

  const request = {
    // model: "text-davinci-003",
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a diligent note taker" },
      { role: "user", content: notes },
    ]
  };

  console.log(request);

  try {
    response = await openai.createChatCompletion(request);
  }
  catch (err) {
    console.error("OpenAI error" + err);
  }

  console.log(response);

  const result = response ? response.message.content : "(error)";
  console.log("ChatGPT returned");
  console.log(result);
  return result ? result : "no result";
};

// Add our main listener for extension activation
chrome.action.onClicked.addListener(async (tab) => {
  console.log("Got click action");
  // invoke the main code within the context of the foreground 
  // chrome tab process. 
  sendInvokeMessage({ command: "tana-extend" })
    .then(() => { console.log("Click action complete"); });
});

chrome.commands.onCommand.addListener((command) => {
  console.log(`Command: ${command}`);
  sendInvokeMessage({ command: "tana-extend" })
    .then(() => { console.log("Command action complete"); });
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Installed tana_extend");
  // mark our extension to say we're alive
  // chrome.action.setBadgeText({
  //   text: "WOKE",
  // });
});

