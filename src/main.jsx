import React, { StrictMode } from "react";

import ReactDOM
from "react-dom/client";

import App
from "./App";

import { enableTizenInputFix } from "./utils/tizenInputFix";

import ErrorBoundary
from "./components/ErrorBoundary";

import NetworkBanner
from "./components/NetworkBanner";

import performanceManager
from "./utils/PerformanceManager";

import {
  registerRemoteKeys
} from "./utils/tizenRemote";

import "./index.css";

// PERFORMANCE
performanceManager.initialize();

// TIZEN
function initializeTV() {

  try {

    if (
      window.tizen
    ) {

      console.log(
        "Samsung Tizen Detected - Initializing 4K Optimization"
      );

      registerRemoteKeys();

      // SCREEN SAVER & POWER
      try {

        if (
          window.webapis
          &&
          window.webapis.appcommon
        ) {
          
          const common = window.webapis.appcommon;

          common.setScreenSaver(
            common.AppCommonScreenSaverState.SCREEN_SAVER_OFF
          );
          
          console.log("Screen Saver Disabled");
        }

      } catch (error) {
        console.log("Power Management Error", error);
      }
      
      // PREVENT FOCUS LOSS
      window.addEventListener("blur", () => {
         console.log("App Lost Focus - Restoring...");
         window.focus();
      });
    }

  } catch (error) {

    console.log(
      "TV Init Error",
      error
    );
  }
}

// START
initializeTV();

// ROOT
enableTizenInputFix();
const root =
  ReactDOM.createRoot(

    document.getElementById(
      "root"
    )
  );

// RENDER
root.render(

  <StrictMode>

    <ErrorBoundary>

      <NetworkBanner />

      <App />

    </ErrorBoundary>

  </StrictMode>
);
