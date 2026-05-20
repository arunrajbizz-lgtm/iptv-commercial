import { navigateTo } from "../utils/navigation";
import {
  useEffect,
  useState
} from "react";

export default function ContinueWatching() {

  const [items,
    setItems] =
    useState([]);

  // INIT
  useEffect(() => {

    loadItems();

  }, []);

  // LOAD
  function loadItems() {

    try {

      const data =
        JSON.parse(

          localStorage.getItem(
            "continue_watching"
          )
        ) || [];

      setItems(data);

    } catch (error) {

      console.log(error);
    }
  }

  // OPEN
  function openItem(item) {

    if (!item) return;

    localStorage.setItem(
      "stream_id",
      item.stream_id
    );

    localStorage.setItem(
      "stream_name",
      item.name
    );

    localStorage.setItem(
      "stream_type",
      item.type
    );

    navigateTo("/player");
  }

  // EMPTY
  if (!items.length) {

    return null;
  }

  return (

    <div style={{
      marginBottom: "60px"
    }}>

      {/* TITLE */}

      <div style={{
        fontSize: "42px",
        fontWeight: "bold",
        marginBottom: "26px"
      }}>

        CONTINUE WATCHING

      </div>

      {/* ROW */}

      <div style={{
        display: "flex",
        gap: "24px",
        overflowX: "auto"
      }}>

        {
          items.map(
            (item, index) => (

            <div
              key={index}
              onClick={() => {

                openItem(item);
              }}
              style={{

                minWidth:
                  "260px",

                background:
                  "#1d1d1d",

                borderRadius:
                  "18px",

                overflow:
                  "hidden",

                cursor:
                  "pointer",

                border:
                  "2px solid rgba(255,255,255,0.08)"
              }}
            >

              {/* IMAGE */}

              <img
                src={
                  item.stream_icon
                  ||
                  item.cover
                }
                alt=""
                style={{
                  width: "100%",
                  height: "340px",
                  objectFit:
                    "cover",
                  background:
                    "#000"
                }}
              />

              {/* INFO */}

              <div style={{
                padding: "18px"
              }}>

                {/* NAME */}

                <div style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom:
                    "12px"
                }}>

                  {item.name}

                </div>

                {/* TIME */}

                <div style={{
                  fontSize: "18px",
                  opacity: 0.75
                }}>

                  Resume Playback

                </div>

              </div>

            </div>

          ))
        }

      </div>

    </div>
  );
}