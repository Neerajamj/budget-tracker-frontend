// CRA default PWA service worker setup

export function register(config) {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((reg) => {
          console.log("Service Worker registered:", reg);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    });
  }
}
