import { useEffect, useState, useRef } from "react";
import { navigateTo } from "../utils/navigation";
import { KEYS, isEnterKey } from "../utils/tizenRemote";
import { normalizeXtreamHost, testXtreamLogin } from "../services/xtreamApi";
import focusManager from "../core/FocusManager";

export default function LoginPage() {
  const [mode, setMode] = useState(0); // 0: Xtream, 1: M3U
  const [focused, setFocused] = useState(0); // 0: Tabs, 1-3: Inputs, 4: Submit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    host: "",
    username: "",
    password: "",
    m3u: ""
  });

  const hostRef = useRef(null);
  const userRef = useRef(null);
  const passRef = useRef(null);

  useEffect(() => {
    focusManager.setZone("content");
  }, []);

  useEffect(() => {
    function handleKeys(event) {
      if (loading) return;

      const isEnter = isEnterKey(event.keyCode);

      switch (event.keyCode) {
        case KEYS.UP:
          if (focused > 0) {
            setFocused(prev => prev - 1);
            event.preventDefault();
          }
          break;
        case KEYS.DOWN:
          if (focused < 4) {
            setFocused(prev => prev + 1);
            event.preventDefault();
          }
          break;
        case KEYS.LEFT:
          if (focused === 0 && mode > 0) {
            setMode(0);
            event.preventDefault();
          }
          break;
        case KEYS.RIGHT:
          if (focused === 0 && mode < 1) {
            setMode(1);
            event.preventDefault();
          }
          break;
        default:
          if (isEnter) {
            if (focused === 4) {
              handleLogin();
              event.preventDefault();
            } else if (focused === 0) {
              setFocused(1);
              event.preventDefault();
            } else {
              // For inputs (1, 2, 3), let the native event through 
              // so tizenInputFix or the browser can trigger the IME.
              console.log("Enter on input field", focused);
            }
          }
          break;
      }
    }

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [focused, mode, form, loading]);

  useEffect(() => {
    if (focused === 1) hostRef.current?.focus();
    else if (focused === 2) userRef.current?.focus();
    else if (focused === 3) passRef.current?.focus();
    else if (focused === 4 || focused === 0) {
      // Blur any active input when moving to tabs or button
      if (document.activeElement instanceof HTMLInputElement) {
        document.activeElement.blur();
      }
    }
  }, [focused]);

  async function handleLogin() {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const host = normalizeXtreamHost(form.host);
      const { username, password } = form;

      if (!host || !username || !password) {
        throw new Error("Please fill in all fields");
      }

      const result = await testXtreamLogin(host, username, password);
      if (!result.ok) throw new Error("Invalid credentials");

      localStorage.setItem("iptv", JSON.stringify({ host, username, password }));
      navigateTo("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card fade-in">
        <h1 className="sidebar-logo" style={{ marginBottom: "20px", textAlign: "center" }}>STREAMDECK</h1>
        <h2>Sign In</h2>
        
        <div className="mode-tabs">
          <div className={`mode-tab ${mode === 0 ? "active" : ""} ${focused === 0 && mode === 0 ? "focused" : ""}`} onClick={() => { setMode(0); setFocused(0); }}>
            Xtream Codes
          </div>
          <div className={`mode-tab ${mode === 1 ? "active" : ""} ${focused === 0 && mode === 1 ? "focused" : ""}`} onClick={() => { setMode(1); setFocused(0); }}>
            M3U Playlist
          </div>
        </div>

        <div className="form-panel">
          <div className={`field-row ${focused === 1 ? "focused" : ""}`}>
            <span>SERVER URL</span>
            <input 
              ref={hostRef}
              type="text" 
              placeholder="http://your-provider.com:8080" 
              value={form.host}
              onChange={e => setForm({...form, host: e.target.value})}
              onFocus={() => setFocused(1)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              autoComplete="off"
            />
          </div>

          <div className={`field-row ${focused === 2 ? "focused" : ""}`}>
            <span>USERNAME</span>
            <input 
              ref={userRef}
              type="text" 
              placeholder="Username" 
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              onFocus={() => setFocused(2)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              autoComplete="off"
            />
          </div>

          <div className={`field-row ${focused === 3 ? "focused" : ""}`}>
            <span>PASSWORD</span>
            <input 
              ref={passRef}
              type="password" 
              placeholder="Password" 
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              onFocus={() => setFocused(3)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              autoComplete="off"
            />
          </div>

          {error && <div style={{ color: "var(--primary)", fontWeight: "bold" }}>{error}</div>}

          <button className={`login-submit ${focused === 4 ? "focused" : ""}`} onClick={handleLogin}>
            {loading ? "Connecting..." : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}
