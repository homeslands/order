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
  apiKey: "AIzaSyBBaA5FPySsAQKL5DEAA0Jp7Flf8ZbMVCg",
  authDomain: "order-notification-dev.firebaseapp.com",
  projectId: "order-notification-dev",
  storageBucket: "order-notification-dev.firebasestorage.app",
  messagingSenderId: "972559792749",
  appId: "1:972559792749:web:1580e74b049fa8069c1d64",
  measurementId: "G-XJNL3ZZ17B"
};

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig)

// Get messaging instance
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
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
  event.notification.close()

  // Handle click action (e.g., open a URL)
  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Try to find and focus existing window
        if (windowClients.length > 0) {
          // Prefer to focus the first available window and navigate
          const client = windowClients[0]
          
          // Post message to client để navigate (thay vì open new window)
          client.postMessage({
            type: 'NOTIFICATION_NAVIGATION',
            url: urlToOpen
          })
          
          return client.focus()
        }
        
        // If no window open, open new one
        if (clients.openWindow) {
          // Convert relative URL to absolute for openWindow
          const absoluteUrl = new URL(urlToOpen, self.location.origin).href
          return clients.openWindow(absoluteUrl)
        }
      }),
  )
})
