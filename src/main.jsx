import React from "react";

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
        "Samsung Tizen Detected"
      );

      registerRemoteKeys();

      // SCREEN SAVER
      try {

        if (
          window.webapis
          &&
          window.webapis.appcommon
        ) {

          window.webapis
            .appcommon
            .setScreenSaver(

              window.webapis
                .appcommon
                .AppCommonScreenSaverState
                .SCREEN_SAVER_OFF
            );
        }

      } catch (error) {

        console.log(error);
      }
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

  <React.StrictMode>

    <ErrorBoundary>

      <NetworkBanner />

      <App />

    </ErrorBoundary>

  </React.StrictMode>
);