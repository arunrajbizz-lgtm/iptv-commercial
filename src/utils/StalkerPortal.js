// HANDSHAKE
export async function stalkerHandshake(
  portal,
  mac
) {

  try {

    const url =

      `${portal}/portal.php?type=stb&action=handshake&token=&JsHttpRequest=1-xml`;

    const response =
      await fetch(url, {

        method: "GET",

        headers: {

          Cookie:
            `mac=${mac}; stb_lang=en; timezone=GMT`,

          Referer:
            portal,

          "User-Agent":
            "Mozilla/5.0 (QtEmbedded; U; Linux; C)"
        }
      });

    const data =
      await response.json();

    return data.js.token;

  } catch (error) {

    console.log(
      "Handshake Error",
      error
    );

    return null;
  }
}

// PROFILE
export async function getProfile(
  portal,
  mac,
  token
) {

  try {

    const url =

      `${portal}/portal.php?type=stb&action=get_profile&hd=1&ver=ImageDescription:0.2.18-r23-250;ImageDate:Thu Sep 13 11:31:16 EEST 2018;PORTAL version:5.5.0;API Version:JS API version:343;STB API version:146;Player Engine version:0x58c&num_banks=2&sn=8F5EA4662E9AD&stb_type=MAG250&client_type=STB&image_version=218&video_out=hdmi&device_id=&device_id2=&signature=&auth_second_step=1&hw_version=1.7-BD-00&not_valid_token=0&metrics=%7B%22mac%22%3A%22${mac}%22%7D&hw_version_2=e1&timestamp=0&api_signature=262&prehash=0f745136d021752337aba35d49bbb23327902654&JsHttpRequest=1-xml`;

    const response =
      await fetch(url, {

        headers: {

          Authorization:
            `Bearer ${token}`,

          Cookie:
            `mac=${mac}; stb_lang=en; timezone=GMT`
        }
      });

    const data =
      await response.json();

    return data.js;

  } catch (error) {

    console.log(error);

    return null;
  }
}

// CHANNELS
export async function getChannels(
  portal,
  mac,
  token
) {

  try {

    const url =

      `${portal}/portal.php?type=itv&action=get_all_channels&force_ch_link_check=&JsHttpRequest=1-xml`;

    const response =
      await fetch(url, {

        headers: {

          Authorization:
            `Bearer ${token}`,

          Cookie:
            `mac=${mac}; stb_lang=en; timezone=GMT`
        }
      });

    const data =
      await response.json();

    return data.js.data || [];

  } catch (error) {

    console.log(error);

    return [];
  }
}

// CREATE STREAM URL
export async function createStreamLink(
  portal,
  mac,
  token,
  cmd
) {

  try {

    const encoded =
      encodeURIComponent(
        cmd
      );

    const url =

      `${portal}/portal.php?type=itv&action=create_link&cmd=${encoded}&series=0&forced_storage=undefined&disable_ad=0&download=0&force_ch_link_check=0&JsHttpRequest=1-xml`;

    const response =
      await fetch(url, {

        headers: {

          Authorization:
            `Bearer ${token}`,

          Cookie:
            `mac=${mac}; stb_lang=en; timezone=GMT`
        }
      });

    const data =
      await response.json();

    return data.js.cmd;

  } catch (error) {

    console.log(error);

    return null;
  }
}

// VOD
export async function getVod(
  portal,
  mac,
  token
) {

  try {

    const url =

      `${portal}/portal.php?type=vod&action=get_ordered_list&genre=*&force_ch_link_check=&fav=0&sortby=added&hd=0&p=1&JsHttpRequest=1-xml`;

    const response =
      await fetch(url, {

        headers: {

          Authorization:
            `Bearer ${token}`,

          Cookie:
            `mac=${mac}; stb_lang=en; timezone=GMT`
        }
      });

    const data =
      await response.json();

    return data.js.data || [];

  } catch (error) {

    console.log(error);

    return [];
  }
}