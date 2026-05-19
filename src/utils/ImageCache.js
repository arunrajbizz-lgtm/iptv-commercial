const cache = new Map();

// LOAD IMAGE
export function preloadImage(url) {

  return new Promise((resolve) => {

    // EXISTS
    if (cache.has(url)) {

      resolve(url);

      return;
    }

    const img =
      new Image();

    img.onload = () => {

      cache.set(url, true);

      resolve(url);
    };

    img.onerror = () => {

      resolve(url);
    };

    img.src = url;
  });
}

// PRELOAD LIST
export async function preloadImages(
  items,
  key = "stream_icon"
) {

  const promises =
    items.map(item => {

      const image =
        item[key];

      if (!image) {

        return Promise.resolve();
      }

      return preloadImage(
        image
      );
    });

  await Promise.all(promises);
}

// CLEAR
export function clearImageCache() {

  cache.clear();
}