import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePushNotifications } from "../hooks/usePushNotifications";
import "./styles/PushPermissionModal.css";

export function PushPermissionModal() {
  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const { isLoading, error, isSubscribed, requestPermissionAndSubscribe } =
    usePushNotifications();

  useEffect(() => {
    if (token && !isSubscribed) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [token, isSubscribed]);

  if (!showModal || isSubscribed) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>🔔 Mantente actualizado</h2>
        <p>Recibe notificaciones cuando haya nuevos censos disponibles</p>

        <div className="modal-actions">
          <button
            onClick={() => {
              requestPermissionAndSubscribe(token);
            }}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? "Activando..." : "Sí, activar"}
          </button>
          <button onClick={() => setShowModal(false)} className="btn-secondary">
            Después
          </button>
        </div>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
