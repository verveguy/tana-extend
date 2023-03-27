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
import { Configuration, CommandDeclaration } from "./ConfigurationTypes";

import chatGPTConfig from './ChatGPT';
import clip2tanaConfig from "./Clip2Tana";



const App = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [command, setCommand] = useState<CommandDeclaration | undefined>(undefined);
  const [myOptions, setMyOptions] = useState<any[]>([])
  const [configuration, setConfiguration] = useState<Configuration | undefined>(undefined);
  const [isConfigured, setIsConfigured] = useState(false);


  //TODO: make the options loadable via importing commands packaged/
  // as modules.

  const loadOptions = () => {
    let options: CommandDeclaration[] = [];
    options.push(...chatGPTConfig.commands);
    options.push(...clip2tanaConfig.commands);
    // TODO: roll clip2tana and tabs2Tana in properly
    //options.push({ label: "Save all tabs to Tana", command: "tabs2tana" });
    setMyOptions(options);
  }

  function listenForMessages(request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    const config = request?.configuration;
    const command = request?.command;

    // tell our inject code in main world
    window.postMessage({ command: command }, "*");

    // initial invocation message handler
    if (command === "tana-extend") {
      setIsPrompting(true);
      // save the configuration passed in
      setConfiguration(config);
      const configNotEmpty = (config !== undefined) && (Object.entries(config).length !== 0);
      setIsConfigured(configNotEmpty);
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

  // when isRunning toggles state...
  useEffect(() => {
    if (isRunning) {
      // ask our web worker to do the actual work
      invokeCommand(command, setIsRunning);
    }
  }, [isRunning]);


  // execute the selected command locally within this tab
  // since it needs acccess to tab-scoped functions / data
  const doContentCommand = (command: CommandDeclaration) => {
    return navigator.clipboard.readText()
      .then((clipboard) => {
        // munge the clipboard data
        let data = command.doCommand(clipboard, configuration)
          .then((data) => {
            data = "%%tana%%\n" + data;

            navigator.clipboard.writeText(data);
          })
      });
  };


  const invokeCommand = (command: CommandDeclaration | undefined, setIsRunning: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (command?.isContentScript) {
      doContentCommand(command).then(() => {
        setIsRunning(false);
      });
    }
    else {
      // get background.js to do the work
      chrome.runtime.sendMessage({ command: "invoke-command", option: command }).then(() => {
        setIsRunning(false);
      });
    }
  };

  function handleCommandChange(option: any | null) {
    setIsPrompting(false);

    if (option === null) {
      setCommand(undefined);
    }
    else {
      setIsRunning(true);
      setCommand(option);
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key == "Escape") {
      setCommand(undefined);
      setIsRunning(false);
      setIsPrompting(false);
    }
  };

  const clearWarning = (event: React.MouseEvent) => {
    setIsPrompting(false);
    setIsRunning(false);
  }

  // super simple React UI at this point
  if (!isConfigured && isPrompting) {
    return (
      <div id='tana-extend' onClick={clearWarning}>
        <header>
          <div className="config-warning">
            <p style={{userSelect: 'none'}}>
              Please configure extension first using extension button
            </p>
          </div>
        </header>
      </div>
    );
  }
  else if (isPrompting && !isRunning) {
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
              onChange={(event: any, newValue: any | null) => { handleCommandChange(newValue); }}
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
      <div id='tana-extend' onClick={clearWarning}>
       <header>
          <div className="progress-msg">
            <p style={{userSelect: 'none'}}>
              Running {command?.command} ...</p>
          </div>
        </header>
      </div>
    );
  }
  else return (<div></div>);
}

export default App;

