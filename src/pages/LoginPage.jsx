import { useEffect, useState, useRef } from "react";
import { navigateTo } from "../utils/navigation";
import { normalizeXtreamHost, testXtreamLogin } from "../services/xtreamApi";
import focusManager from "../core/FocusManager";
import { useFocus } from "../hooks/useFocus";

export default function LoginPage() {
  const [mode, setMode] = useState(0); // 0: Xtream, 1: M3U
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zone, setZone] = useState(focusManager.getZone());

  const [form, setForm] = useState({
    host: "",
    username: "",
    password: "",
    m3u: ""
  });

  const formRef = useRef(null);
  const tabRef = useRef(null);
  const hostRef = useRef(null);
  const userRef = useRef(null);
  const passRef = useRef(null);

  useEffect(() => {
    return focusManager.subscribe(newZone => {
      setZone(newZone);
    });
  }, []);

  useEffect(() => {
    focusManager.setZone("content");
  }, []);

  const itemCount = mode === 0 ? 4 : 2; // Inputs + Submit

  const { focusIndex: tabIdx } = useFocus({
    containerRef: tabRef,
    columnCount: 2,
    itemCount: 2,
    isActive: zone === "content" && localZone === "tabs",
    onEnter: (index) => {
      setMode(index);
      setLocalZone("form");
    },
    onBottomEdge: () => setLocalZone("form")
  });

  const { focusIndex: formIdx, setFocusIndex: setFormIdx } = useFocus({
    containerRef: formRef,
    columnCount: 1,
    itemCount: itemCount,
    isActive: zone === "content" && localZone === "form",
    onEnter: (index) => {
      if (index === itemCount - 1) handleLogin();
      else {
        // Focus the input
        const inputs = formRef.current.querySelectorAll('input');
        inputs[index]?.focus();
      }
    },
    onTopEdge: () => setLocalZone("tabs")
  });

  const [localZone, setLocalZone] = useState("form");

  async function handleLogin() {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      if (mode === 0) {
        const host = normalizeXtreamHost(form.host);
        const { username, password } = form;

        if (!host || !username || !password) {
          throw new Error("Please fill in all fields");
        }

        const result = await testXtreamLogin(host, username, password);
        if (!result.ok) throw new Error(result.message || "Invalid credentials");

        localStorage.setItem("iptv", JSON.stringify({ host, username, password, type: "xtream" }));
      } else {
        if (!form.m3u) throw new Error("Please enter M3U URL");
        if (!form.m3u.startsWith("http")) throw new Error("Invalid URL");
        localStorage.setItem("iptv", JSON.stringify({ url: form.m3u, type: "m3u" }));
      }
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
        <h1 className="sidebar-logo" style={{ marginBottom: "20px", textAlign: "center" }}>STREAMVAULT</h1>
        <h2>Sign In</h2>
        
        <div className="mode-tabs" ref={tabRef}>
          <div 
            data-focusable="true"
            className={`mode-tab ${mode === 0 ? "active" : ""} ${localZone === "tabs" && tabIdx === 0 ? "focused" : ""}`} 
            onClick={() => setMode(0)}
          >
            Xtream Codes
          </div>
          <div 
            data-focusable="true"
            className={`mode-tab ${mode === 1 ? "active" : ""} ${localZone === "tabs" && tabIdx === 1 ? "focused" : ""}`} 
            onClick={() => setMode(1)}
          >
            M3U Playlist
          </div>
        </div>

        <div className="form-panel" ref={formRef}>
          {mode === 0 ? (
            <>
              <div className={`field-row ${localZone === "form" && formIdx === 0 ? "focused" : ""}`}>
                <span>SERVER URL</span>
                <input 
                  data-focusable="true"
                  ref={hostRef}
                  type="text" 
                  placeholder="http://your-provider.com:8080" 
                  value={form.host}
                  onChange={e => setForm({...form, host: e.target.value})}
                  onFocus={() => setFormIdx(0)}
                />
              </div>

              <div className={`field-row ${localZone === "form" && formIdx === 1 ? "focused" : ""}`}>
                <span>USERNAME</span>
                <input 
                  data-focusable="true"
                  ref={userRef}
                  type="text" 
                  placeholder="Username" 
                  value={form.username}
                  onChange={e => setForm({...form, username: e.target.value})}
                  onFocus={() => setFormIdx(1)}
                />
              </div>

              <div className={`field-row ${localZone === "form" && formIdx === 2 ? "focused" : ""}`}>
                <span>PASSWORD</span>
                <input 
                  data-focusable="true"
                  ref={passRef}
                  type="password" 
                  placeholder="Password" 
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  onFocus={() => setFormIdx(2)}
                />
              </div>

              {error && <div style={{ color: "var(--primary)", fontWeight: "bold", margin: "10px 0" }}>{error}</div>}

              <button 
                data-focusable="true"
                className={`login-submit ${localZone === "form" && formIdx === 3 ? "focused" : ""}`} 
                onClick={handleLogin}
              >
                {loading ? "Connecting..." : "Connect"}
              </button>
            </>
          ) : (
            <>
              <div className={`field-row ${localZone === "form" && formIdx === 0 ? "focused" : ""}`}>
                <span>M3U PLAYLIST URL</span>
                <input 
                  data-focusable="true"
                  ref={hostRef}
                  type="text" 
                  placeholder="http://server.com/playlist.m3u" 
                  value={form.m3u}
                  onChange={e => setForm({...form, m3u: e.target.value})}
                  onFocus={() => setFormIdx(0)}
                />
              </div>

              {error && <div style={{ color: "var(--primary)", fontWeight: "bold", margin: "10px 0" }}>{error}</div>}

              <button 
                data-focusable="true"
                className={`login-submit ${localZone === "form" && formIdx === 1 ? "focused" : ""}`} 
                onClick={handleLogin}
              >
                {loading ? "Loading M3U..." : "Load Playlist"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
