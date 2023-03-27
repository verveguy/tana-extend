/*
  This is a React based app which is the Configuration page
  for our Chrome Extension
*/

import React, { useEffect, useState } from "react";
import { Checkbox, FormControlLabel, FormGroup, Switch, TextField } from "@mui/material";
import chatGPTConfig from "./ChatGPT";
import clip2tanaConfig from "./Clip2Tana";
import { Configuration } from "./ConfigurationTypes";

// TODO: break this down so it can be built up in pieces from individual 
// imported modules.

const initial_config: Configuration = {
  ...chatGPTConfig.configuration,
  ...clip2tanaConfig.configuration,
};

const ConfigurationPanel = () => {
  const [configuration, setConfiguration] = useState(initial_config);
  const [savedState, setSavedState] = useState("Initial");
  const [shouldLoadConfig, setShouldLoadConfig] = useState(true);

  const saveConfiguration = (configkey: string, propertykey: string, newValue: any) => {
    configuration[configkey].properties[propertykey].value = newValue;
    // update local react state
    setConfiguration(configuration);
    setSavedState("saving");
    chrome.storage.sync.set({ configuration }).then(() => { setSavedState("saved"); });
  }

  const handleToggle = (configkey: string, propertykey: string,) => {
    let currentValue: boolean = configuration[configkey].properties[propertykey].value;
    saveConfiguration(configkey, propertykey, !currentValue);
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
    <div id="tana-extend">
      <FormGroup>
        {Object.entries(configuration).map(([configkey, config]) => {
          return (
            <div>
              <h2>{config.label}</h2>
              {Object.entries(config.properties).map(([propertykey, property]) => {
                if (property.type == "string") {
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
                }
                else if (property.type == "boolean") {
                  return (
                    <div>
                      <FormControlLabel style={{ width: '100%' }}
                        control={
                          <Switch
                            checked={property.value == true}
                            onChange={ e => handleToggle(configkey, propertykey)}
                          />}
                        label={property.label}
                      />
                      <div style={{ height: '12px' }} />
                    </div>
                  )
                }
              })}
            </div>
          )
        })}
      </FormGroup>
    </div>
  );
}


export default ConfigurationPanel;
