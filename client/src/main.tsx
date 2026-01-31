import { createRoot } from "react-dom/client";
import App from "./App";

import "./index.css";
import "leaflet/dist/leaflet.css";

// Service Worker
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}

createRoot(document.getElementById("root")!).render(<App />);
