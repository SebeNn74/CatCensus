import { useState, useEffect } from "react";
import { countPendings } from "../db/indexedDB";
import { useConnection } from "../hooks/useConnection";
import "./styles/SyncBanner.css";

const MESSAGES = {
  offline: "Sin conexión — Los datos se guardarán localmente",
  pending: (n) =>
    `${n} registro${n !== 1 ? "s" : ""} pendiente${n !== 1 ? "s" : ""} de sincronización`,
};

function usePendingCount(online) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      const result = await countPendings();
      setCount(result.total);
    }
    fetchCount();
  }, [online]);

  return count;
}

function SyncBanner() {
  const online = useConnection();
  const pendingCount = usePendingCount(online);

  const isVisible = !online || pendingCount > 0;
  if (!isVisible) return null;

  const isOffline = !online;
  const message = isOffline ? MESSAGES.offline : MESSAGES.pending(pendingCount);

  return (
    <div
      className={`sync-banner ${isOffline ? "sync-banner--offline" : "sync-banner--pending"}`}
      role="status"
      aria-live="polite"
    >
      <span className="sync-banner-dot" aria-hidden="true" />
      <span className="sync-banner-text">{message}</span>
    </div>
  );
}

export default SyncBanner;
