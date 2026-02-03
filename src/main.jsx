import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Error boundary for better error handling
try {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Failed to render app:", error);
  document.getElementById("root").innerHTML = `
    <div style="min-height: 100vh; background: black; color: white; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div style="text-align: center; max-width: 600px;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #a855f7;">TrapMasterPro</h1>
        <p style="color: #ef4444; margin-bottom: 1rem;">Error loading application</p>
        <p style="color: #9ca3af; font-size: 0.875rem;">${error.message}</p>
        <p style="color: #6b7280; font-size: 0.75rem; margin-top: 1rem;">Please check the browser console for details.</p>
      </div>
    </div>
  `;
}
