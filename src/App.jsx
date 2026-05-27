import {
  HashRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { useState, useEffect } from "react";

// PAGES
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import LiveTVPage from "./pages/LiveTVPage";
import MoviesPage from "./pages/MoviesPage";
import MovieInfoPage from "./pages/MovieInfoPage";
import SeriesPage from "./pages/SeriesPage";
import SeriesInfoPage from "./pages/SeriesInfoPage";
import PlayerPage from "./pages/PlayerPage";
import SearchPage from "./pages/SearchPage";
import FavoritesPage from "./pages/FavoritesPage";
import SettingsPage from "./pages/SettingsPage";

/**
 * A wrapper for routes that require authentication.
 * Checks localStorage on every render to ensure auth state is current.
 */
function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function checkAuth() {
      try {
        const data = localStorage.getItem("iptv");
        setAuth(data ? JSON.parse(data) : null);
      } catch (e) {
        setAuth(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
    // Also listen for storage changes (e.g. from handleLogin)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  if (loading) return null;

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live"
          element={
            <ProtectedRoute>
              <LiveTVPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies"
          element={
            <ProtectedRoute>
              <MoviesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movie-info"
          element={
            <ProtectedRoute>
              <MovieInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/series"
          element={
            <ProtectedRoute>
              <SeriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/series-info"
          element={
            <ProtectedRoute>
              <SeriesInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/player"
          element={
            <ProtectedRoute>
              <PlayerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
}
