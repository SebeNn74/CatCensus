import { useState, useCallback, useEffect } from "react";
import { subscribeToPush } from "../api/push";
import {
  isPushNotificationSupported,
} from "../utils/pushUtils";
import { PUSH_ERRORS } from "../constants/messages";

export function usePushNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      if (!isPushNotificationSupported()) return;
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    }

    checkSubscription();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (isPushNotificationSupported()) {
        setIsSubscribed(Notification.permission === "granted");
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const requestPermissionAndSubscribe = useCallback(async (token) => {
    setError(null);
    setIsLoading(true);

    try {
      if (!isPushNotificationSupported()) {
        throw new Error(PUSH_ERRORS.NO_BROWSER_SUPPORT);
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error(PUSH_ERRORS.PERMISSION_DENIED);
      }

      await subscribeToPush(token);
      setIsSubscribed(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    isSubscribed,
    requestPermissionAndSubscribe,
  };
}
