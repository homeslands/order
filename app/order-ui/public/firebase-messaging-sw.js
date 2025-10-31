// Firebase Cloud Messaging Service Worker
// This file runs in the background to handle push notifications

importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
)
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js',
)

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDpQB9k3vuLVEoEEBjBlubMslADQPdcwuM',
  authDomain: 'order-notification-4b9b0.firebaseapp.com',
  projectId: 'order-notification-4b9b0',
  storageBucket: 'order-notification-4b9b0.firebasestorage.app',
  messagingSenderId: '798286114785',
  appId: '1:798286114785:web:16d1ee4d69d141681beca0',
  measurementId: 'G-W8XQ1YY2H6',
}

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig)

// Get messaging instance
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message:',
    payload,
  )

  const notificationTitle = payload.notification?.title || 'New Notification'
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icon.png',
    badge: '/badge.png',
    data: payload.data,
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log(
    '[firebase-messaging-sw.js] Notification clicked:',
    event.notification,
  )

  event.notification.close()

  // Handle click action (e.g., open a URL)
  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i]
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      }),
  )
})
