// SAVE POSITION
export function saveResumePosition(
  streamId,
  currentTime,
  duration
) {

  try {

    // INVALID
    if (
      !streamId
      ||
      !currentTime
    ) {

      return;
    }

    const positions =
      JSON.parse(

        localStorage.getItem(
          "resume_positions"
        )

      ) || {};

    positions[streamId] = {

      currentTime,

      duration,

      updated:
        Date.now()
    };

    localStorage.setItem(

      "resume_positions",

      JSON.stringify(
        positions
      )
    );

    console.log(
      "Resume Saved"
    );

  } catch (error) {

    console.log(error);
  }
}

// LOAD POSITION
export function getResumePosition(
  streamId
) {

  try {

    const positions =
      JSON.parse(

        localStorage.getItem(
          "resume_positions"
        )

      ) || {};

    return positions[
      streamId
    ] || null;

  } catch (error) {

    console.log(error);

    return null;
  }
}

// REMOVE
export function clearResumePosition(
  streamId
) {

  try {

    const positions =
      JSON.parse(

        localStorage.getItem(
          "resume_positions"
        )

      ) || {};

    delete positions[
      streamId
    ];

    localStorage.setItem(

      "resume_positions",

      JSON.stringify(
        positions
      )
    );

  } catch (error) {

    console.log(error);
  }
}