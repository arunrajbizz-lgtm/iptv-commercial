// PARSE TIME
export function parseEPGTime(
  value
) {

  if (!value) {

    return new Date();
  }

  // XTREAM FORMAT
  if (
    typeof value === "string"
  ) {

    const clean =
      value.replace(
        " ",
        "T"
      );

    return new Date(clean);
  }

  return new Date(value);
}

// FORMAT
export function formatEPGTime(
  value
) {

  const date =
    parseEPGTime(value);

  return date.toLocaleTimeString(
    [],

    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

// CURRENT PROGRAM
export function getCurrentProgram(
  epg = []
) {

  const now =
    Date.now();

  return epg.find(program => {

    const start =
      parseEPGTime(
        program.start
        ||
        program.start_timestamp
      ).getTime();

    const end =
      parseEPGTime(
        program.end
        ||
        program.stop_timestamp
      ).getTime();

    return (
      now >= start
      &&
      now <= end
    );
  });
}

// NEXT PROGRAM
export function getNextProgram(
  epg = []
) {

  const now =
    Date.now();

  return epg.find(program => {

    const start =
      parseEPGTime(
        program.start
        ||
        program.start_timestamp
      ).getTime();

    return start > now;
  });
}

// PROGRESS %
export function getProgramProgress(
  program
) {

  if (!program) {

    return 0;
  }

  const now =
    Date.now();

  const start =
    parseEPGTime(
      program.start
      ||
      program.start_timestamp
    ).getTime();

  const end =
    parseEPGTime(
      program.end
      ||
      program.stop_timestamp
    ).getTime();

  const duration =
    end - start;

  const elapsed =
    now - start;

  const progress =
    (elapsed / duration) * 100;

  return Math.max(
    0,
    Math.min(100, progress)
  );
}

// TIMELINE
export function buildTimeline(
  epg = []
) {

  return epg.map(program => ({

    ...program,

    formattedStart:
      formatEPGTime(

        program.start
        ||
        program.start_timestamp
      ),

    formattedEnd:
      formatEPGTime(

        program.end
        ||
        program.stop_timestamp
      )
  }));
}