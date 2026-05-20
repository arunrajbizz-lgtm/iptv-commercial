import {
  HashRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// PAGES
import LoginPage
from "./pages/LoginPage";

import Dashboard
from "./pages/Dashboard";

import LiveTVPage
from "./pages/LiveTVPage";

import MoviesPage
from "./pages/MoviesPage";

import SeriesPage
from "./pages/SeriesPage";

import SeriesInfoPage
from "./pages/SeriesInfoPage";

import PlayerPage
from "./pages/PlayerPage";

import SearchPage
from "./pages/SearchPage";

import FavoritesPage
from "./pages/FavoritesPage";

import SettingsPage
from "./pages/SettingsPage";

// APP
export default function App() {

  // LOGIN
  let iptv = null;

  try {
    iptv = JSON.parse(
      localStorage.getItem(
        "iptv"
      )
    );
  } catch {
    localStorage.removeItem(
      "iptv"
    );
  }

  return (

    <HashRouter>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/"
          element={
            iptv
              ? <Navigate to="/dashboard" />
              : <LoginPage />
          }
        />

        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            iptv
              ? <Dashboard />
              : <Navigate to="/login" />
          }
        />

        {/* LIVE TV */}

        <Route
          path="/live"
          element={
            iptv
              ? <LiveTVPage />
              : <Navigate to="/login" />
          }
        />

        {/* MOVIES */}

        <Route
          path="/movies"
          element={
            iptv
              ? <MoviesPage />
              : <Navigate to="/login" />
          }
        />

        {/* SERIES */}

        <Route
          path="/series"
          element={
            iptv
              ? <SeriesPage />
              : <Navigate to="/login" />
          }
        />

        {/* SERIES INFO */}

        <Route
          path="/series-info"
          element={
            iptv
              ? <SeriesInfoPage />
              : <Navigate to="/login" />
          }
        />

        {/* PLAYER */}

        <Route
          path="/player"
          element={
            iptv
              ? <PlayerPage />
              : <Navigate to="/login" />
          }
        />

        {/* SEARCH */}

        <Route
          path="/search"
          element={
            iptv
              ? <SearchPage />
              : <Navigate to="/login" />
          }
        />

        {/* FAVORITES */}

        <Route
          path="/favorites"
          element={
            iptv
              ? <FavoritesPage />
              : <Navigate to="/login" />
          }
        />

        {/* SETTINGS */}

        <Route
          path="/settings"
          element={
            iptv
              ? <SettingsPage />
              : <Navigate to="/login" />
          }
        />

      </Routes>

    </HashRouter>
  );
}
