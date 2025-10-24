import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize Capacitor if running in native app
if (typeof window !== 'undefined' && (window as any).Capacitor) {
  import('@capacitor/core').then(({ Capacitor }) => {
    console.log('Running on:', Capacitor.getPlatform());
  });
}

createRoot(document.getElementById("root")!).render(<App />);