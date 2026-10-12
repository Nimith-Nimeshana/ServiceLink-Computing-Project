import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Start the complete ServiceLink React prototype.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);