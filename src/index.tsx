import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppContextProvider } from "./AppContext";

const rootElement = document.createElement("div");
rootElement.id = "react-chrome-app";

const globalStyles = document.createElement("style");
// globalStyles.innerHTML = `
//   #${rootElement.id} {
//   position: fixed;
//   left: 0;
//   top: 0;
//   width: 300px;
//   height: 100vh;
//   background: #ffffff;
//   border-right: 1px solid #c2c2c2;
//   z-index: 999999999;
//   }
// `;

globalStyles.innerHTML = `
   #${rootElement.id} {
  position: fixed;
  bottom: 0;
  right: 15px;
  background: #ffffff;
  border-right: 1px solid #c2c2c2;
  z-index: 9;
  }
`;

document.body.appendChild(rootElement);
document.body.appendChild(globalStyles);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </React.StrictMode>
);