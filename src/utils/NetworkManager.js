class NetworkManager {

  constructor() {

    this.online =
      navigator.onLine;

    this.listeners = [];
  }

  // INIT
  initialize() {

    window.addEventListener(

      "online",

      () => {

        this.online = true;

        this.notify();
      }
    );

    window.addEventListener(

      "offline",

      () => {

        this.online = false;

        this.notify();
      }
    );

    console.log(
      "Network Manager Ready"
    );
  }

  // STATUS
  isOnline() {

    return this.online;
  }

  // LISTENER
  subscribe(callback) {

    this.listeners.push(
      callback
    );
  }

  // NOTIFY
  notify() {

    this.listeners.forEach(
      callback => {

        callback(
          this.online
        );
      }
    );
  }

  // TEST
  async testConnection() {

    try {

      await fetch(

          "https://www.google.com",

          {
            mode: "no-cors"
          }
        );

      return true;

    } catch {

      return false;
    }
  }
}

const networkManager =
  new NetworkManager();

export default networkManager;
