import {
  useEffect,
  useState
} from "react";

import networkManager
from "../utils/NetworkManager";

export default function NetworkBanner() {

  const [online,
    setOnline] =
    useState(true);

  // INIT
  useEffect(() => {

    networkManager.initialize();

    setOnline(
      networkManager.isOnline()
    );

    networkManager.subscribe(
      status => {

        setOnline(status);
      }
    );

  }, []);

  // ONLINE
  if (online) {

    return null;
  }

  return (

    <div className="network-banner">

      NO INTERNET CONNECTION

    </div>
  );
}