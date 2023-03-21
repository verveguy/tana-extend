import React, { useContext, useState } from "react";
import { AppContext } from "./AppContext";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(sender.tab ?
    "from a content script:" + sender.tab.url :
    "from the worker");
  if (request.command === "tana-extend") {
    //const { isLoading, setIsLoading } = useContext(AppContext);
    // TODO: ask the user what command to run
    // for now assume it is 'summarize'
    //setIsLoading(true);
    // ask our web worker to do the actual work
    chrome.runtime.sendMessage({ command: "chatgpt" })
      .then(() => {
        //setIsLoading(false);
        console.log("Summarize DONE");
        sendResponse({ result: "tana-extend-result"});
      });
    return true; // signal we will send async responses
  }
  // helper messages for getting/setting clipboard
  else if (request.command === "get-clipboard") {
    navigator.clipboard.readText()
      .then((result) => {
        console.log("SENDING RESPONSE" + result);
        sendResponse({ result: "get-clipboard-result", clipboard: result });
      });
    return true; // signal we will send async responses
  }
  else if (request.command === "set-clipboard") {
    let data = request.clipboard;
    navigator.clipboard.writeText(data)
      .then(() => {
        console.log("SENDING RESPONSE");
        sendResponse({ result: "set-clipboard-result" });
      });
    return true; // signal we will send async responses
  }

});


const App = () => {
  const { isLoading, setIsLoading } = useContext(AppContext);

  return (
    <div>
      <header>
        {isLoading ?
          <h2>LOADING...</h2> :
          <h2>Hello From React App 👋</h2>
        }
      </header>
    </div>
  );
}

export default App;
