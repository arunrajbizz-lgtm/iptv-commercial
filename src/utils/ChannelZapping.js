export function getCurrentChannelIndex(
  channels,
  currentStreamId
) {

  return channels.findIndex(

    item =>

      String(item.stream_id)
      ===
      String(currentStreamId)
  );
}

// NEXT CHANNEL
export function getNextChannel(
  channels,
  currentStreamId
) {

  const currentIndex =
    getCurrentChannelIndex(
      channels,
      currentStreamId
    );

  // LOOP
  if (
    currentIndex >=
    channels.length - 1
  ) {

    return channels[0];
  }

  return channels[
    currentIndex + 1
  ];
}

// PREVIOUS CHANNEL
export function getPreviousChannel(
  channels,
  currentStreamId
) {

  const currentIndex =
    getCurrentChannelIndex(
      channels,
      currentStreamId
    );

  // LOOP
  if (currentIndex <= 0) {

    return channels[
      channels.length - 1
    ];
  }

  return channels[
    currentIndex - 1
  ];
}