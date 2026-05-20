import { useEffect, useMemo, useState, useRef } from "react";
import { navigateTo } from "../utils/navigation";
import { loadM3U } from "../utils/M3UParser";
import { KEYS } from "../utils/tizenRemote";
import {
  normalizeXtreamHost,
  testXtreamLogin
} from "../services/xtreamApi";
import "./LoginPage.css";

const MODES = [
  {
    id: "xtream",
    title: "Xtream Codes",
    subtitle: "Provider server, username, and password"
  },
  {
    id: "m3u",
    title: "M3U Playlist",
    subtitle: "Direct playlist URL"
  }
];

const FIELD_META = {
  host: {
    label: "Server URL",
    placeholder: "http://your-provider.com:8080",
    type: "text",
    inputMode: "url",
    name: "host"
  },
  username: {
    label: "Username",
    placeholder: "Enter username",
    type: "text",
    inputMode: "text",
    name: "username"
  },
  password: {
    label: "Password",
    placeholder: "Enter password",
    type: "password",
    inputMode: "text",
    name: "password"
  },
  m3u: {
    label: "M3U playlist URL",
    placeholder: "https://example.com/playlist.m3u",
    type: "text",
    inputMode: "url",
    name: "m3u"
  }
};

export default function LoginPage() {
  const [mode, setMode] = useState(0);
  const [focused, setFocused] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef([]);
  const submitRef = useRef(null);
  const modeRefs = useRef([]);

  const [form, setForm] = useState({
    host: "",
    username: "",
    password: "",
    m3u: ""
  });

  const fields = useMemo(
    () => (mode === 0 ? ["host", "username", "password"] : ["m3u"]),
    [mode]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (focused === 0) {
        modeRefs.current[mode]?.focus();
      } else if (focused > 0 && focused <= fields.length) {
        const input = inputRefs.current[focused - 1];
        if (input) {
          input.focus();
        }
      } else if (focused === fields.length + 1) {
        submitRef.current?.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [focused, mode, fields.length]);

  useEffect(() => {
    function handleKeys(event) {
      const active = document.activeElement;
      const isInput = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");

      switch (event.keyCode) {
        case KEYS.LEFT:
          if (focused === 0 && mode > 0) {
            event.preventDefault();
            setMode(mode - 1);
            setFocused(0);
          }
          break;

        case KEYS.RIGHT:
          if (focused === 0 && mode < MODES.length - 1) {
            event.preventDefault();
            setMode(mode + 1);
            setFocused(0);
          }
          break;

        case KEYS.UP:
          if (focused > 0) {
            event.preventDefault();
            setFocused(focused - 1);
          }
          break;

        case KEYS.DOWN:
          if (focused < fields.length + 1) {
            event.preventDefault();
            setFocused(focused + 1);
          }
          break;

        case KEYS.ENTER:
          if (focused === fields.length + 1) {
            event.preventDefault();
            handleLogin();
          } else if (focused === 0) {
            event.preventDefault();
            setFocused(1);
          } else if (isInput) {
            if (focused < fields.length) {
               setFocused(focused + 1);
            } else {
               setFocused(fields.length + 1);
            }
          }
          break;

        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [mode, focused, fields, form, loading]);

  function updateField(key, value) {
    setError("");
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  }

  function selectMode(index) {
    setMode(index);
    setFocused(0);
    setError("");
  }

  async function handleLogin() {
    if (loading) return;
    
    console.log("Starting Login...");
    setError("");
    setLoading(true);

    try {
      if (mode === 0) {
        const host = normalizeXtreamHost(form.host);
        const username = form.username.trim();
        const password = form.password.trim();

        if (!host || !username || !password) {
          throw new Error("Enter server URL, username, and password.");
        }

        console.log("Testing Xtream Login:", host);
        const result = await testXtreamLogin(host, username, password);
        
        if (!result.ok) {
           throw new Error(result.message || "Invalid credentials. Please check your details.");
        }

        localStorage.setItem("iptv", JSON.stringify({ type: "xtream", host, username, password }));
        console.log("Login Success, Navigating...");
        
        // Force a small delay to ensure localStorage is settled
        setTimeout(() => {
          navigateTo("/dashboard");
        }, 100);
        return;
      }

      const playlistUrl = form.m3u.trim();
      if (!playlistUrl) throw new Error("Enter your M3U playlist URL.");

      console.log("Loading M3U:", playlistUrl);
      const channels = await loadM3U(playlistUrl);
      if (!channels.length) throw new Error("No channels found. Check the M3U URL.");

      localStorage.setItem("iptv", JSON.stringify({ type: "m3u", url: playlistUrl }));
      localStorage.setItem("m3u_channels", JSON.stringify(channels));
      
      console.log("M3U Login Success, Navigating...");
      setTimeout(() => {
        navigateTo("/dashboard");
      }, 100);

    } catch (err) {
      console.error("Login Error:", err);
      setError(err?.message || "Login failed. Please check your internet and details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="brand-mark">
          <span className="brand-dot" />
          StreamDeck IPTV
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Premium IPTV portal</p>
          <h1>Live TV, movies, and series built for every screen.</h1>
          <p className="hero-text">
            A responsive OTT experience for Samsung Tizen TVs, desktop browsers,
            and mobile devices.
          </p>
        </div>
        <div className="signal-grid">
          <div><strong>4K</strong><span>Ready</span></div>
          <div><strong>EPG</strong><span>Guide</span></div>
          <div><strong>TV</strong><span>Remote</span></div>
        </div>
      </section>

      <section className="login-card">
        <div className="card-header">
          <p className="eyebrow">Secure access</p>
          <h2>Sign in to your IPTV provider</h2>
          <p>Use Xtream Codes credentials or a direct M3U playlist URL.</p>
        </div>

        <div className="mode-tabs" role="tablist">
          {MODES.map((item, index) => (
            <button
              key={item.id}
              ref={(el) => (modeRefs.current[index] = el)}
              type="button"
              className={`mode-tab ${mode === index ? "active" : ""} ${focused === 0 && mode === index ? "focused" : ""}`}
              onClick={() => selectMode(index)}
              onFocus={() => setFocused(0)}
            >
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </button>
          ))}
        </div>

        <div className="form-panel">
          {fields.map((field, index) => {
            const meta = FIELD_META[field];
            const focusIndex = index + 1;

            return (
              <div
                key={field}
                className={`field-row ${focused === focusIndex ? "focused" : ""}`}
                onClick={() => setFocused(focusIndex)}
              >
                <span>{meta.label}</span>
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  id={`login-${meta.name}`}
                  name={meta.name}
                  type={meta.type}
                  value={form[field]}
                  placeholder={meta.placeholder}
                  inputMode={meta.inputMode}
                  autoComplete="off"
                  onFocus={() => setFocused(focusIndex)}
                  onChange={(event) => updateField(field, event.target.value)}
                />
              </div>
            );
          })}

          {error ? <div className="login-error">{error}</div> : null}

          <button
            ref={submitRef}
            type="button"
            className={`login-submit ${focused === fields.length + 1 ? "focused" : ""}`}
            onFocus={() => setFocused(fields.length + 1)}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
        </div>
      </section>
    </main>
  );
}
