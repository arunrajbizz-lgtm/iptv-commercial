// CONTINUE WATCHING
export function saveContinueWatching(
  item
) {

  try {

    let list =
      JSON.parse(

        localStorage.getItem(
          "continue_watching"
        )
      ) || [];

    // REMOVE DUPLICATE
    list = list.filter(

      existing =>

        String(
          existing.stream_id
        )
        !==
        String(item.stream_id)
    );

    // ADD FIRST
    list.unshift({

      ...item,

      updated:
        Date.now()
    });

    // LIMIT
    list = list.slice(0, 20);

    localStorage.setItem(

      "continue_watching",

      JSON.stringify(list)
    );

  } catch (error) {

    console.log(error);
  }
}

// RECENT CHANNELS
export function saveRecentChannel(
  item
) {

  try {

    let list =
      JSON.parse(

        localStorage.getItem(
          "recent_channels"
        )
      ) || [];

    // REMOVE DUPLICATE
    list = list.filter(

      existing =>

        String(
          existing.stream_id
        )
        !==
        String(item.stream_id)
    );

    // ADD FIRST
    list.unshift({

      ...item,

      updated:
        Date.now()
    });

    // LIMIT
    list = list.slice(0, 20);

    localStorage.setItem(

      "recent_channels",

      JSON.stringify(list)
    );

  } catch (error) {

    console.log(error);
  }
}