/*
  This is a React based app, injected into the host DOM so that it also acts 
  as a "content script" for the purpose of our Chrome Extension.

  This script is injected into _all_ websites for which the extension has 
  been configured and for which permission has been granted.

  As such, it does double duty: firstly, as the UI widget to capture the
  user's desired "extension command" to invoke, and also as the code that
  can actually make requests to read and write the clipboard - which our
  background.js script cannot do, since it runs as a faceless service worker.

  It's this double-duty that explain some of the weirdness of why this code
  listens for messages from the background script.

  Basic approach is that the background.js script captures the extension
  invocation by the user - either keyboard shortcut or clicking on the 
  extension icon in the toolbar. 

  The background script then passes a message to this script prompting it
  to ask the user for the desired command to run. 

  Once selected, the command request is passed via message to the background.js
  script again, where the actual "work" is undertaken. The work may involve
  sending further messages to this script to read/write the clipboard or
  other actions that can only be done by code running within a browser tab.

*/

import React, { useEffect, useState } from "react";
import { TextField, Autocomplete } from "@mui/material";


const App = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [commandString, setCommandString] = useState("");
  const [myOptions, setMyOptions] = useState<any[]>([])


  //TODO: make the options loadable via importing commands packaged/
  // as modules.

  const loadOptions = () => {
    let options: any[] = [];
    options.push({ label: "Invoke Chat GPT with prompt", command: "chatgpt" });
    options.push({ label: "Summarize using ChatGPT", command: "summarize" });
    // TODO: roll clip2tana and tabs2Tana in properly
    //options.push({ label: "Clip current website to Tana", command: "clip2tana" });
    //options.push({ label: "Save all tabs to Tana", command: "tabs2tana" });
    setMyOptions(options);
  }

  function listenForMessages(request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {

    // tell our inject code in main world
    window.postMessage({ command: request.command }, "*");
    console.log("posted message to window");
    // initial invocation message handler
    if (request.command === "tana-extend") {
      // TODO: ask the user what command to run
      // for now assume it is 'chatgpt'
      setIsPrompting(true);
    }
    // helper messages for getting/setting clipboard
    else if (request.command === "get-clipboard") {

      navigator.clipboard.readText()
        .then((result) => {
          sendResponse({ result: "get-clipboard-result", clipboard: result });
        });
      return true; // signal that we will send async responses
    }
    else if (request.command === "set-clipboard") {
      let data = request.clipboard;
      navigator.clipboard.writeText(data)
        .then(() => {
          sendResponse({ result: "set-clipboard-result" });
        });
      return true; // signal that we will send async responses
    }
  }

  // we need to install our message listener on component startup (mount)
  // TODO: see if this can be made one-time. I think it's being called
  // after every render. Trying to fence on isListening doesn't work
  // (it goes deaf)
  useEffect(() => {
    if (!isListening) {
      chrome.runtime.onMessage.addListener(listenForMessages);
    }

    setIsListening(true);

    // and remove it again on component tear-down (unmount)
    return () => {
      // component cleanup 
      if (isListening) {
        chrome.runtime.onMessage.removeListener(listenForMessages);
      }
    }
  });

  useEffect(() => {
    // ask our web worker to do the actual work
    chrome.runtime.sendMessage({ command: commandString })
      .then(() => {
        setIsRunning(false);
      });
  }, [isRunning]);

  function handleCommandChange(option: any | null) {
    setIsPrompting(false);

    if (option === null) {
      setCommandString("");
    }
    else {
      setIsRunning(true);
      setCommandString(option.command);
      // // ask our web worker to do the actual work
      // chrome.runtime.sendMessage({ command: option.command })
      //   .then(() => {
      //     setIsRunning(false);
      //   });
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key == "Escape") {
      setCommandString("");
      setIsRunning(false);
      setIsPrompting(false);
    }
  };

  // super simple React UI at this point
  if (isPrompting && !isRunning) {
    return (
      <div id='tana-extend'>
        <header>
          <div>
            <Autocomplete
              style={{ width: 500 }}
              freeSolo
              autoComplete
              autoHighlight
              options={myOptions}
              getOptionLabel={(option: any) => option.label}
              onChange={(event: any, newValue: string | null) => { handleCommandChange(newValue); }}
              renderInput={(params) => (
                <TextField {...params}
                  autoFocus
                  onKeyDown={handleKeyDown}
                  onChange={loadOptions}
                  variant="outlined"
                  label="Run command"
                />
              )}
            />
          </div>
        </header>
      </div>
    );
  }
  else if (isRunning) {
    return (
      <div id='tana-extend'>
        <header>
          <div>
            <h2>Running {commandString} ...</h2>
          </div>
        </header>
      </div>
    );
  }
  else return (<div></div>);
}

export default App;
