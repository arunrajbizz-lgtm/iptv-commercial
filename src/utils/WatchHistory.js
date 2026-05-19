export function getHistory() {

  const saved =
    localStorage.getItem(
      "watch_history"
    );

  if (!saved) {

    return [];
  }

  return JSON.parse(saved);
}

export function saveHistory(item) {

  let history =
    getHistory();

  // REMOVE OLD
  history =
    history.filter(

      x =>
        x.stream_id !==
        item.stream_id
    );

  // ADD NEW
  history.unshift({

    ...item,

    watched_at:
      Date.now()
  });

  // LIMIT
  history =
    history.slice(0, 30);

  localStorage.setItem(

    "watch_history",

    JSON.stringify(history)
  );
}

export function clearHistory() {

  localStorage.removeItem(
    "watch_history"
  );
}