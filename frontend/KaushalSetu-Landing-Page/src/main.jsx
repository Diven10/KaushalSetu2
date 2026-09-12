import React from "react";
import ReactDOM from "react-dom/client";
import KaushalSetuLanding from "./KaushalSetuLanding";
import "./kaushalsetu-landing.css";

// Sign-in and registration are handled by the platform's shared sign-in page,
// served by the API. Point signInBase at wherever that runs — the landing page
// appends ?from=trainee / ?from=employer so the visitor's choice carries over.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <KaushalSetuLanding signInBase="http://localhost:8000/" />
  </React.StrictMode>
);
