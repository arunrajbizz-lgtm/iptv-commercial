import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import {
  loadM3U
} from "../utils/M3UParser";

import {
  stalkerHandshake,
  getChannels
} from "../utils/StalkerPortal";

export default function LoginPage() {

  // MODES
  const modes = [

    "XTREAM",

    "M3U",

    "STALKER"
  ];

  // STATES
  const [mode,
    setMode] =
    useState(0);

  const [focused,
    setFocused] =
    useState(0);

  const [loading,
    setLoading] =
    useState(false);

  const [form,
    setForm] =
    useState({

      host: "",

      username: "",

      password: "",

      m3u: "",

      portal: "",

      mac:
        "00:1A:79:00:00:01"
    });

  // FIELDS
  const fields = {

    XTREAM: [

      "HOST",

      "USERNAME",

      "PASSWORD"
    ],

    M3U: [

      "M3U_URL"
    ],

    STALKER: [

      "PORTAL_URL",

      "MAC_ADDRESS"
    ]
  };

  // INIT
  useEffect(() => {

    localStorage.removeItem(
      "iptv"
    );

  }, []);

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      switch (event.keyCode) {

        // LEFT
        case KEYS.LEFT:

          if (mode > 0) {

            setMode(
              prev => prev - 1
            );

            setFocused(0);
          }

          break;

        // RIGHT
        case KEYS.RIGHT:

          if (
            mode <
            modes.length - 1
          ) {

            setMode(
              prev => prev + 1
            );

            setFocused(0);
          }

          break;

        // UP
        case KEYS.UP:

          if (focused > 0) {

            setFocused(
              prev => prev - 1
            );
          }

          break;

        // DOWN
        case KEYS.DOWN:

          if (

            focused
            <
            getCurrentFields()
              .length
          ) {

            setFocused(
              prev => prev + 1
            );
          }

          break;

        // ENTER
        case KEYS.ENTER:

          handleEnter();

          break;

        default:

          break;
      }
    }

    document.addEventListener(
      "keydown",
      handleKeys
    );

    return () => {

      document.removeEventListener(
        "keydown",
        handleKeys
      );
    };

  }, [
    mode,
    focused,
    form
  ]);

  // CURRENT FIELDS
  function getCurrentFields() {

    return fields[
      modes[mode]
    ];
  }

  // ENTER
  async function handleEnter() {

    const current =
      getCurrentFields();

    // LOGIN
    if (
      focused === current.length
    ) {

      handleLogin();

      return;
    }

    const field =
      current[focused];

    const value =
      prompt(
        `Enter ${field}`
      ) || "";

    // HOST
    if (field === "HOST") {

      setForm(prev => ({

        ...prev,

        host:
          value.startsWith(
            "http"
          )
            ? value
            : `http://${value}`
      }));
    }

    // USERNAME
    else if (
      field === "USERNAME"
    ) {

      setForm(prev => ({

        ...prev,

        username: value
      }));
    }

    // PASSWORD
    else if (
      field === "PASSWORD"
    ) {

      setForm(prev => ({

        ...prev,

        password: value
      }));
    }

    // M3U
    else if (
      field === "M3U_URL"
    ) {

      setForm(prev => ({

        ...prev,

        m3u: value
      }));
    }

    // PORTAL
    else if (
      field === "PORTAL_URL"
    ) {

      setForm(prev => ({

        ...prev,

        portal:
          value.startsWith(
            "http"
          )
            ? value
            : `http://${value}`
      }));
    }

    // MAC
    else if (
      field === "MAC_ADDRESS"
    ) {

      setForm(prev => ({

        ...prev,

        mac: value
      }));
    }
  }

  // LOGIN
  async function handleLogin() {

    setLoading(true);

    try {

      // XTREAM
      if (mode === 0) {

        const api =

          `${form.host}/player_api.php?username=${form.username}&password=${form.password}`;

        console.log(
          "Testing API:",
          api
        );

        const response =
          await fetch(api);

        const data =
          await response.json();

        console.log(data);

        // SUCCESS
        if (
          data.user_info
        ) {

          localStorage.setItem(

            "iptv",

            JSON.stringify({

              type:
                "xtream",

              host:
                form.host,

              username:
                form.username,

              password:
                form.password
            })
          );

          // SAVE TEST DATA
          localStorage.setItem(

            "live_channels",

            JSON.stringify([])
          );

          alert(
            "Xtream Login Success"
          );

          window.location.href =
            "/dashboard";

          return;
        }

        throw new Error(
          "Invalid Xtream Login"
        );
      }

      // M3U
      if (mode === 1) {

        const channels =
          await loadM3U(
            form.m3u
          );

        localStorage.setItem(

          "iptv",

          JSON.stringify({

            type: "m3u",

            url:
              form.m3u
          })
        );

        localStorage.setItem(

          "m3u_channels",

          JSON.stringify(
            channels
          )
        );

        window.location.href =
          "/dashboard";

        return;
      }

      // STALKER
      if (mode === 2) {

        const token =
          await stalkerHandshake(

            form.portal,

            form.mac
          );

        if (!token) {

          throw new Error(
            "Handshake Failed"
          );
        }

        const channels =
          await getChannels(

            form.portal,

            form.mac,

            token
          );

        localStorage.setItem(

          "iptv",

          JSON.stringify({

            type:
              "stalker",

            portal:
              form.portal,

            mac:
              form.mac,

            token
          })
        );

        localStorage.setItem(

          "stalker_channels",

          JSON.stringify(
            channels
          )
        );

        window.location.href =
          "/dashboard";
      }

    } catch (error) {

      console.log(error);

      alert(
        error.message
      );
    }

    setLoading(false);
  }

  return (

    <div style={{
      width: "100%",
      height: "100vh",
      background:
        "#000",
      display: "flex",
      justifyContent:
        "center",
      alignItems:
        "center",
      color: "white"
    }}>

      {/* CARD */}

      <div style={{
        width: "900px",
        background:
          "#111",
        borderRadius:
          "24px",
        padding: "50px"
      }}>

        {/* TITLE */}

        <div style={{
          fontSize: "54px",
          fontWeight: "bold",
          marginBottom: "40px",
          color: "#00aaff"
        }}>

          IPTV LOGIN

        </div>

        {/* MODES */}

        <div style={{
          display: "flex",
          gap: "20px",
          marginBottom: "40px"
        }}>

          {
            modes.map(
              (item, index) => (

              <div
                key={item}
                style={{

                  padding:
                    "18px 30px",

                  borderRadius:
                    "14px",

                  background:
                    mode === index
                      ? "#00aaff"
                      : "#222",

                  fontSize:
                    "24px",

                  fontWeight:
                    "bold"
                }}
              >

                {item}

              </div>

            ))
          }

        </div>

        {/* INPUTS */}

        <div style={{
          display: "flex",
          flexDirection:
            "column",
          gap: "20px"
        }}>

          {
            getCurrentFields()
              .map(
                (field, index) => (

                <div
                  key={field}
                  style={{

                    padding:
                      "24px",

                    borderRadius:
                      "18px",

                    background:
                      focused === index
                        ? "#00aaff"
                        : "#222",

                    border:
                      focused === index
                        ? "3px solid white"
                        : "3px solid transparent"
                  }}
                >

                  <div style={{
                    fontSize: "18px",
                    opacity: 0.7,
                    marginBottom:
                      "10px"
                  }}>

                    {field}

                  </div>

                  <div style={{
                    fontSize: "24px",
                    fontWeight:
                      "bold"
                  }}>

                    Press ENTER

                  </div>

                </div>
              ))
          }

          {/* LOGIN */}

          <div style={{

            padding:
              "26px",

            borderRadius:
              "20px",

            background:
              focused
              ===
              getCurrentFields()
                .length
                ? "#00cc66"
                : "#222",

            border:
              focused
              ===
              getCurrentFields()
                .length
                ? "3px solid white"
                : "3px solid transparent",

            textAlign:
              "center",

            fontSize:
              "30px",

            fontWeight:
              "bold"
          }}>

            {
              loading
                ? "CONNECTING..."
                : "LOGIN"
            }

          </div>

        </div>

      </div>

    </div>
  );
}