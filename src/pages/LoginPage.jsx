import { useEffect, useMemo, useState, useRef } from "react";
import { navigateTo } from "../utils/navigation";
import { loadM3U } from "../utils/M3UParser";
import { KEYS } from "../utils/tizenRemote";
import {
  normalizeXtreamHost
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
    inputMode: "url"
  },
  username: {
    label: "Username",
    placeholder: "Enter username",
    type: "text",
    inputMode: "text"
  },
  password: {
    label: "Password",
    placeholder: "Enter password",
    type: "password",
    inputMode: "text"
  },
  m3u: {
    label: "M3U playlist URL",
    placeholder: "https://example.com/playlist.m3u",
    type: "text",
    inputMode: "url"
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

  // Focus effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (focused === 0) {
        modeRefs.current[mode]?.focus();
      } else if (focused > 0 && focused <= fields.length) {
        const input = inputRefs.current[focused - 1];
        if (input) {
          input.focus();
          // Explicitly trigger click to help some Tizen versions open IME
          // This is a common pattern for TV apps
          input.click();
        }
      } else if (focused === fields.length + 1) {
        submitRef.current?.focus();
      }
    }, 50);
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
          } else if (isInput) {
            // Let the global tizenInputFix handle the click/IME trigger
            // or explicitly do it here if needed
          } else if (focused === 0) {
            event.preventDefault();
            selectMode(mode);
            setFocused(1); // Jump to first input after selecting mode
          }
          break;

        case KEYS.BACK:
          // Optional: handle back button to go up a field or exit?
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

        localStorage.setItem(
          "iptv",
          JSON.stringify({
            type: "xtream",
            host,
            username,
            password
          })
        );

        navigateTo("/dashboard");
        return;
      }

      const playlistUrl = form.m3u.trim();

      if (!playlistUrl) {
        throw new Error("Enter your M3U playlist URL.");
      }

      const channels = await loadM3U(playlistUrl);

      if (!channels.length) {
        throw new Error("No channels found. Check the M3U URL or server access.");
      }

      localStorage.setItem(
        "iptv",
        JSON.stringify({
          type: "m3u",
          url: playlistUrl
        })
      );
      localStorage.setItem("m3u_channels", JSON.stringify(channels));

      navigateTo("/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-hero" aria-label="IPTV overview">
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

        <div className="signal-grid" aria-hidden="true">
          <div>
            <strong>4K</strong>
            <span>Ready</span>
          </div>
          <div>
            <strong>EPG</strong>
            <span>Guide</span>
          </div>
          <div>
            <strong>TV</strong>
            <span>Remote</span>
          </div>
        </div>
      </section>

      <section className="login-card" aria-label="Sign in">
        <div className="card-header">
          <p className="eyebrow">Secure access</p>
          <h2>Sign in to your IPTV provider</h2>
          <p>
            Use Xtream Codes credentials or a direct M3U playlist URL supplied
            by your provider.
          </p>
        </div>

        <div className="mode-tabs" role="tablist" aria-label="Login type">
          {MODES.map((item, index) => (
            <button
              key={item.id}
              ref={(el) => (modeRefs.current[index] = el)}
              type="button"
              className={`mode-tab ${mode === index ? "active" : ""} ${
                focused === 0 && mode === index ? "focused" : ""
              }`}
              onClick={() => selectMode(index)}
              onFocus={() => setFocused(0)}
              role="tab"
              aria-selected={mode === index}
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
              <label
                key={field}
                className={`field-row ${focused === focusIndex ? "focused" : ""}`}
                onClick={() => setFocused(focusIndex)}
              >
                <span>{meta.label}</span>
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type={meta.type}
                  value={form[field]}
                  placeholder={meta.placeholder}
                  inputMode={meta.inputMode}
                  autoComplete={field === "password" ? "current-password" : "off"}
                  onFocus={() => setFocused(focusIndex)}
                  onChange={(event) => updateField(field, event.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </label>
            );
          })}

          {error ? <div className="login-error">{error}</div> : null}

          <button
            ref={submitRef}
            type="button"
            className={`login-submit ${
              focused === fields.length + 1 ? "focused" : ""
            }`}
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
