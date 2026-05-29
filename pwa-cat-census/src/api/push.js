import { API_BASE_URL } from "./config";
import { urlBase64ToUint8Array } from "../utils/pushUtils";
import { PUSH_ERRORS } from "../constants/messages";

export async function getPushPublicKey() {
  const response = await fetch(`${API_BASE_URL}/push/key`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(PUSH_ERRORS.VAPID_KEY_FAILED(response.status, errorText));
  }

  const data = await response.json();
  if (!data.publicKey) throw new Error(PUSH_ERRORS.PUBLIC_KEY_MISSING);

  return data.publicKey;
}

export async function savePushSubscription(subscription, token) {
  const response = await fetch(`${API_BASE_URL}/push/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subscription),
  });

  if (response.status !== 204) {
    const errorText = await response.text();
    throw new Error(
      PUSH_ERRORS.SUBSCRIPTION_FAILED(response.status, errorText),
    );
  }
}

export async function subscribeToPush(token) {
  if (!token) throw new Error(PUSH_ERRORS.NO_TOKEN);

  const publicKey = await getPushPublicKey();
  console.log(publicKey);
  console.log(urlBase64ToUint8Array(publicKey));
  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    await savePushSubscription(subscription, token);
  }
}
