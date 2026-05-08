import { useState, useEffect } from "react";

export function useConnection() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      console.log("[Red] Conexión restaurada");
      setOnline(true);
    };
    const handleOffline = () => {
      console.log("[Red] Sin conexión");
      setOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}
