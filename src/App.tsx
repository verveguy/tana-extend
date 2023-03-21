import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./AppContext";

const App = () => {
  const { isLoading, setIsLoading } = useContext(AppContext);
  const [isListening, setIsListening] = useState(false);

  function listenForMessages(request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the worker");
    if (request.command === "tana-extend") {
      // TODO: ask the user what command to run
      // for now assume it is 'summarize'
      setIsLoading(true);
      // ask our web worker to do the actual work
      chrome.runtime.sendMessage({ command: "chatgpt" })
        .then(() => {
          setIsLoading(false);
          console.log("Summarize DONE");
        });
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
  }

  useEffect(() => {
    if (!isListening) {
      chrome.runtime.onMessage.addListener(listenForMessages);
    }

    setIsListening(true);

    return () => {
      // component cleanup 
      if (isListening) {
        chrome.runtime.onMessage.removeListener(listenForMessages);
      }
    }
  });


  return (
    <div>
      <header>
        {isLoading ?
          <h2>Talking to ChatGPT</h2> :
          <h2>Ready to go 👋</h2>
        }
      </header>
    </div>
  );
}

export default App;
