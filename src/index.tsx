/*
  This carefully crafted index.js is a non-standard React app wrapper.
  The intention is that this app is inkected into any other website 
  as an overlay so that we can use the React app as a content.js
  script for the purposes of our Chrome extension.
*/

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// inject our code that runs inside the main world
let inject = document.createElement('script');
inject.src = chrome.runtime.getURL('inject.js');
inject.onload = function() {
    inject.remove();  // TODO: check this. Original was this.remove()
};
(document.head || document.documentElement).appendChild(inject);

const rootElement = document.createElement("div");
rootElement.id = "tana-extension";

const globalStyles = document.createElement("style");

/* 
  style the injection in the way we want for the
  purpose of being an "overlay" to the current website
*/

globalStyles.innerHTML = `
  #${rootElement.id} {
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 99999999;
    }

  #tana-extend {
    background: #ffffff;
    padding: 10px;
    border-radius: 10px;
  }

  #tana-extend input {
    background: #ffffff;
  }

  #tana-extend input, select, textarea {
    color: #000000;
  }

  #tana-extend .config-warning {
    color: #000000;
  }

  #tana-extend .progress-msg {
    color: #000000;
  }
`;

// inject ourselves
document.body.appendChild(rootElement);
document.body.appendChild(globalStyles);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);