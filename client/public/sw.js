self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: data.data
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const caseId = event.notification.data.caseId;
  const id = event.notification.data.id;
  
  event.waitUntil(
    clients.openWindow('/admin/submission/' + id)
  );
});
