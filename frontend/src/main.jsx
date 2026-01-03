import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // asegúrate de que exista si usas Tailwind o estilos globales

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
