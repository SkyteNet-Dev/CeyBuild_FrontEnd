importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCXKY0rKzfLoVa0Ehf9W9Mcwkb39SV3ouA",
  authDomain: "skilllink-94aea.firebaseapp.com",
  projectId: "skilllink-94aea",
  storageBucket: "skilllink-94aea.firebasestorage.app",
  messagingSenderId: "524502510647",
  appId: "1:524502510647:web:c21ec0dd7e62fe53f6e3b2",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "SkillLink";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/globe.svg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
