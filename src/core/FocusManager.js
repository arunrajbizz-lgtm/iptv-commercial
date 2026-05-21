class FocusManager {

  constructor() {
    this.zone = "sidebar";
    this.sidebarIndex = 0;
    this.history = ["sidebar"];

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
    if (this.zone !== zone) {
      this.history.push(this.zone);
      this.zone = zone;
    }
    console.log("Focus Zone:", zone);
  }

  // GET
  getZone() {
    return this.zone;
  }

  // BACK
  goBack() {
    if (this.history.length > 0) {
      this.zone = this.history.pop();
    }
    return this.zone;
  }

  // SIDEBAR
  setSidebar(index) {
    this.sidebarIndex = index;
  }

  getSidebar() {
    return this.sidebarIndex;
  }

  // SAVE POSITION
  savePosition(zone, position) {
    this.lastPositions[zone] = position;
  }

  // RESTORE
  getPosition(zone) {
    return this.lastPositions[zone] || 0;
  }

  // RESET
  reset() {
    this.zone = "sidebar";
    this.sidebarIndex = 0;
    this.history = ["sidebar"];
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