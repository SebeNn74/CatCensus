import { useState, useEffect } from "react";
import { countPendings } from "../db/indexedDB";
import { useConnection } from "../hooks/useConnection";

function SyncBanner() {
  const online = useConnection();
  const [pendings, setPendings] = useState(0);

  useEffect(() => {
    async function verify() {
      const count = await countPendings();
      setPendings(count.total);
    }
    verify();
    // Re-verifica cada vez que cambia la conexión
  }, [online]);

  // Si está online y no hay pendientes, no muestra nada
  if (online && pendings === 0) return null;

  return (
    <div
      style={{
        backgroundColor: online ? "#16a34a" : "#f59e0b",
        color: "white",
        padding: "8px 16px",
        textAlign: "center",
        fontSize: "14px",
        fontWeight: "500",
      }}
    >
      {!online && <span>Sin conexión: los datos se guardarán localmente</span>}
      {online && pendings > 0 && (
        <span>Hay {pendings} registro(s) pendientes de sincronización</span>
      )}
    </div>
  );
}

export default SyncBanner;
