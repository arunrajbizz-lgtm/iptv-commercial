const PREFIX = "iptv_app_";

// SAVE
export function saveData(
  key,
  value
) {

  try {

    localStorage.setItem(

      PREFIX + key,

      JSON.stringify(value)
    );

    return true;

  } catch (error) {

    console.log(
      "Storage Save Error",
      error
    );

    return false;
  }
}

// LOAD
export function loadData(
  key,
  defaultValue = null
) {

  try {

    const data =
      localStorage.getItem(
        PREFIX + key
      );

    if (!data) {

      return defaultValue;
    }

    return JSON.parse(data);

  } catch (error) {

    console.log(
      "Storage Load Error",
      error
    );

    return defaultValue;
  }
}

// REMOVE
export function removeData(
  key
) {

  try {

    localStorage.removeItem(
      PREFIX + key
    );

  } catch (error) {

    console.log(
      "Storage Remove Error",
      error
    );
  }
}

// CLEAR APP
export function clearAppStorage() {

  try {

    Object.keys(localStorage)
      .forEach(key => {

        if (
          key.startsWith(
            PREFIX
          )
        ) {

          localStorage.removeItem(
            key
          );
        }
      });

  } catch (error) {

    console.log(
      "Storage Clear Error",
      error
    );
  }
}

// EXISTS
export function hasData(
  key
) {

  return localStorage.getItem(
    PREFIX + key
  ) !== null;
}

// SAFE ARRAY
export function loadArray(
  key
) {

  const data =
    loadData(key, []);

  return Array.isArray(data)
    ? data
    : [];
}