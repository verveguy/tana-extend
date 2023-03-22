/*
  This is the configuration page for our extension, done
  as a React app.
*/
import React from "react";
import { createRoot } from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import Configuration from "./Configuration";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Configuration />
  </React.StrictMode>
);

reportWebVitals();