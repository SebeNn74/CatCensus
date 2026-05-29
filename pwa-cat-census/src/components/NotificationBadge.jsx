import { BellCheck, BellOff } from "lucide-react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { useAuth } from "../hooks/useAuth";
import "./styles/NotificationBadge.css";

export function NotificationBadge() {
  const { token } = useAuth();
  const { isSubscribed, requestPermissionAndSubscribe } =
    usePushNotifications();

  if (!token) return null;

  return (
    <div className="notification-badge-container">
      <button
        onClick={() => requestPermissionAndSubscribe(token)}
        className={`notification-badge ${isSubscribed ? "active" : ""}`}
        title={
          isSubscribed
            ? "Notificaciones activadas"
            : "Haz click para activar notificaciones"
        }
      >
        {isSubscribed ? (
          <BellCheck size={25} strokeWidth={2} />
        ) : (
          <BellOff size={25} strokeWidth={2} />
        )}
      </button>
    </div>
  );
}
