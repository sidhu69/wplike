import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Router } from "wouter";

// Initialize Capacitor if running in native app
if (typeof window !== 'undefined' && (window as any).Capacitor) {
  import('@capacitor/core').then(({ Capacitor }) => {
    console.log('Running on:', Capacitor.getPlatform());
  });
}

// Use hash-based routing to work under Capacitor's file scheme
createRoot(document.getElementById("root")!).render(
  <Router hook={(cb) => {
    const getHash = () => window.location.hash.replace(/^#/, "") || "/";
    const onChange = () => cb(getHash());
    window.addEventListener("hashchange", onChange);
    window.addEventListener("load", onChange);
    return () => {
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("load", onChange);
    };
  }}>
    <App />
  </Router>
);