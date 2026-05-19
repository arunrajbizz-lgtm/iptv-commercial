// LOAD M3U
export async function loadM3U(
  url
) {

  try {

    const response =
      await fetch(url);

    const text =
      await response.text();

    return parseM3U(
      text
    );

  } catch (error) {

    console.log(
      "M3U Load Error",
      error
    );

    return [];
  }
}

// PARSE
export function parseM3U(
  content
) {

  try {

    const lines =
      content.split("\n");

    const channels = [];

    let current = null;

    for (
      let i = 0;
      i < lines.length;
      i++
    ) {

      const line =
        lines[i].trim();

      // INFO
      if (
        line.startsWith(
          "#EXTINF"
        )
      ) {

        const nameMatch =

          line.match(
            /,(.*)$/
          );

        const logoMatch =

          line.match(
            /tvg-logo="([^"]+)"/
          );

        const groupMatch =

          line.match(
            /group-title="([^"]+)"/
          );

        current = {

          name:
            nameMatch
              ? nameMatch[1]
              : "Unknown",

          stream_icon:
            logoMatch
              ? logoMatch[1]
              : "",

          category_name:
            groupMatch
              ? groupMatch[1]
              : "General"
        };
      }

      // URL
      else if (

        line &&
        !line.startsWith("#")
      ) {

        if (current) {

          channels.push({

            ...current,

            stream_url:
              line,

            stream_id:
              Date.now()
              + i
          });

          current = null;
        }
      }
    }

    console.log(
      "Parsed Channels:",
      channels.length
    );

    return channels;

  } catch (error) {

    console.log(
      "M3U Parse Error",
      error
    );

    return [];
  }
}