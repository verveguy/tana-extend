/*
  This is a React based app which is the Configuration page
  for our Chrome Extension
*/

import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";

type ConfigEntry = { key: string, label: string, value: any, options?: string[] };
type ConfigElements = { [index: string]: ConfigEntry };
type ConfigurationEntry = { key: string, label: string, properties: ConfigElements };
type Configuration = { [index: string]: ConfigurationEntry };

const initial_config: Configuration = {
  chatGPT: {
    key: "chatGPT",
    label: "Configuration for Chat GPT",
    properties: {
      openAIAPIKey: {
        key: "openAIAPIKey",
        label: "OpenAI API Key", value: " ",
      },
      chatGPTModel: {
        key: "chatGPTModel", label: "ChatGPTModel", value: "gpt-3.5-turbo",
        options: ["gpt-3.5-turbo", "gpt4.0"]
      }
    },
  },
  clip2tana: {
    key: "clip2tana",
    label: "Configuration for Clip2Tana",
    properties: {
      webtag: {
        key: "webtag",
        label: "Tana tag for websites", value: "#website",
      },
    },
  }
};

const Configuration = () => {
  const [configuration, setConfiguration] = useState(initial_config);
  const [savedState, setSavedState] = useState("Initial");
  const [shouldLoadConfig, setShouldLoadConfig] = useState(true);

  const saveConfiguration = (configkey: string, propertykey: string, newValue: any) => {
    configuration[configkey].properties[propertykey].value = newValue;
    // update local react state
    setConfiguration(configuration);
    setSavedState("saving");
    chrome.storage.sync.set({configuration}).then(() => {setSavedState("saved");});
  }

  useEffect(() => {
    chrome.storage.sync.get("configuration").then((data) => {
      Object.assign(configuration, data.configuration);
      setConfiguration(configuration);
      setShouldLoadConfig(false);
    });
  }, [shouldLoadConfig]);

  // super simple React UI at this point
  let count = 0;
  return (
    <div>
      {Object.entries(configuration).map(([configkey, config]) => {
        return (
          <div>
            <h3>{config.label}</h3>
            {Object.entries(config.properties).map(([propertykey, property]) => {
              return (
                <div>
                  <TextField style={{ width: '100%' }}
                    autoFocus={count != 0}
                    value={property.value}
                    onChange={e => saveConfiguration(configkey, propertykey, e.target.value)}
                    variant="outlined"
                    label={property.label}
                  />
                  <div style={{ height: '12px' }} />
                </div>
              )
            })}
          </div>
        )
      })}
      <h3>{savedState}</h3>
    </div>
  );
}


export default Configuration;
