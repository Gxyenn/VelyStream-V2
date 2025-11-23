// This is a basic service worker file for push notifications.

self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title || 'VelyStream';
  const options = {
    body: data.body,
    icon: '/placeholder.svg', // Make sure you have a logo.png in your public folder
    badge: '/placeholder.svg', // And a badge.png
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  // This can be customized to open a specific URL
  event.waitUntil(
    clients.openWindow('/')
  );
});
