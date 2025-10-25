import React from "react";
import ReactDOM from "react-dom/client";
import App from "./main.jsx";

// This is the clean, non-repeated entry point for a modern React application.

// 1. Get the container element once.
const rootElement = document.getElementById("root");

// 2. Ensure the element exists before attempting to create the root.
if (rootElement) {
  // 3. Create the root and render the application.
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Log an error if the root element is missing from index.html
  console.error(
    "The root element with ID 'root' was not found in the document."
  );
}
