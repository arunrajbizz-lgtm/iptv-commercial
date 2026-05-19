// SCORE
function scoreItem(
  item,
  history = [],
  favorites = []
) {

  let score = 0;

  // FAVORITE BOOST
  const favorite =
    favorites.find(

      fav =>

        String(fav.stream_id)
        ===
        String(item.stream_id)
    );

  if (favorite) {

    score += 50;
  }

  // HISTORY BOOST
  history.forEach(entry => {

    // SAME TYPE
    if (
      entry.stream_type
      ===
      item.stream_type
    ) {

      score += 10;
    }

    // SAME CATEGORY
    if (
      entry.category_name
      &&
      item.category_name
      &&
      entry.category_name
      ===
      item.category_name
    ) {

      score += 25;
    }

    // PARTIAL NAME
    if (

      entry.name
        ?.toLowerCase()
        .includes(

          item.name
            ?.toLowerCase()
            .split(" ")[0]
        )
    ) {

      score += 20;
    }
  });

  return score;
}

// BUILD
export function buildRecommendations(
  items = [],
  history = [],
  favorites = []
) {

  const scored =
    items.map(item => ({

      ...item,

      recommendationScore:
        scoreItem(

          item,

          history,

          favorites
        )
    }));

  return scored
    .sort(

      (
        a,
        b
      ) =>

        b.recommendationScore
        -
        a.recommendationScore
    )
    .slice(0, 20);
}