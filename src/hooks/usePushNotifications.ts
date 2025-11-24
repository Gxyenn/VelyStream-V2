import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

const VAPID_PUBLIC_KEY = "YOUR_VAPID_PUBLIC_KEY"; // THIS MUST BE REPLACED ON THE SERVER

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAndSubscribe = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();

      if (sub) {
        setIsSubscribed(true);
        setSubscription(sub);
      } else {
        // If not subscribed, attempt to subscribe automatically
        await subscribe();
      }
      setIsLoading(false);
    };
    checkAndSubscribe();
  }, []);

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error("Push Notifications are not supported by this browser.");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        toast.warning("Permission to receive notifications was not granted.");
        return;
      }
      // toast.success("Permission granted!"); // Removed for less intrusive automatic prompt

      if (VAPID_PUBLIC_KEY === "YOUR_VAPID_PUBLIC_KEY") {
        toast.error("Subscription failed: VAPID key is not configured.", {
          description: "The application developer needs to configure the push notification keys on the server.",
        });
        console.error("VAPID_PUBLIC_KEY is not set.");
        return;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('Push Subscription:', sub);
      toast.success("Successfully subscribed to notifications!");
      
      // ===================================================================
      // IMPORTANT: Send this 'sub' object to your backend server
      // Example:
      // await fetch('/api/subscribe', {
      //   method: 'POST',
      //   body: JSON.stringify(sub),
      //   headers: { 'Content-Type': 'application/json' }
      // });
      // ===================================================================

      setIsSubscribed(true);
      setSubscription(sub);

    } catch (error) {
      console.error('Failed to subscribe to push notifications', error);
      toast.error("An error occurred during subscription.", {
        description: `${error.message}`,
      });
    }
  };

  return { isSubscribed, subscribe, isLoading };
};
