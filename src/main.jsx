import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import NetworkBanner from "./components/NetworkBanner";

import performanceManager from "./utils/PerformanceManager";
import { registerRemoteKeys } from "./utils/tizenRemote";
import { enableTizenInputFix } from "./utils/tizenInputFix";

import "./index.css";
import "./App.css";

// PERFORMANCE
try {
  performanceManager.initialize();
} catch (error) {
  console.log("Performance Init Error", error);
}

// TIZEN INIT
function initializeTV() {
  try {
    if (window.tizen) {
      console.log("Samsung Tizen Detected - Initializing TV");

      registerRemoteKeys();

      // SCREEN SAVER OFF
      try {
        if (window.webapis && window.webapis.appcommon) {
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
        setTimeout(() => {
          try {
            window.focus();
            document.body.focus();
          } catch (e) {
            console.log("Focus Restore Error", e);
          }
        }, 100);
      });
    }
  } catch (error) {
    console.log("TV Init Error", error);
  }
}

// START TIZEN INPUT FIX FIRST
try {
  enableTizenInputFix();
  console.log("Tizen Input Fix Enabled");
} catch (error) {
  console.log("Tizen Input Fix Error", error);
}

// START TV INIT
initializeTV();

// ROOT
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found");
} else {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <ErrorBoundary>
        <NetworkBanner />
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}