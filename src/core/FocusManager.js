class FocusManager {

  constructor() {

    this.zone =
      "sidebar";

    this.lastPositions = {

      sidebar: 0,

      content: 0,

      player: 0,

      overlay: 0,

      modal: 0
    };
  }

  // SET
  setZone(zone) {

    this.zone = zone;

    console.log(
      "Focus Zone:",
      zone
    );
  }

  // GET
  getZone() {

    return this.zone;
  }

  // SAVE POSITION
  savePosition(
    zone,
    position
  ) {

    this.lastPositions[
      zone
    ] = position;
  }

  // RESTORE
  getPosition(zone) {

    return this.lastPositions[
      zone
    ] || 0;
  }

  // RESET
  reset() {

    this.zone =
      "sidebar";

    this.lastPositions = {

      sidebar: 0,

      content: 0,

      player: 0,

      overlay: 0,

      modal: 0
    };
  }
}

const focusManager =
  new FocusManager();

export default focusManager;