/*
  This is a React based app which is the Configuration page
  for our Chrome Extension
*/

import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";

const configuration  = { openAIAPIKey: ""};

const Configuration = () => {
  const [openAIAPIKey, setOpenAIAPIKey] = useState<string|null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const saveAPIKey = (newKey:string|null) => {
    setOpenAIAPIKey(newKey);
    configuration.openAIAPIKey = newKey ? newKey : "";
    chrome.storage.sync.set({configuration}).then(() => {setIsSaved(true);});
  }

  useEffect(() => {
    chrome.storage.sync.get("configuration").then((data) => {
      Object.assign(configuration, data.configuration);
      setOpenAIAPIKey(configuration.openAIAPIKey);
    });
  });

  // super simple React UI at this point
  return (
    <div>
      <h2>Configuration for Tana Extend</h2>
      <TextField style = {{width: '100%'}} 
        autoFocus
        value={openAIAPIKey}
        onChange={e => saveAPIKey(e.target.value)}
        variant="outlined"
        label="OpenAI API Key"
      />
      <h3>{isSaved ? "Saved..." : "" }</h3>
    </div>
  );
}


export default Configuration;
