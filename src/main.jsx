import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import "./styles.css";
import "./auth.css";

function authRoute() {
  const hash = window.location.hash;
  if (hash.startsWith("#/signup")) return "signup";
  if (hash.startsWith("#/login")) return "login";
  return "home";
}

function Root() {
  const [route, setRoute] = useState(authRoute);

  useEffect(() => {
    const onChange = () => setRoute(authRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  useEffect(() => {
    if (route === "login") document.title = "Log in — SignBase PSL";
    else if (route === "signup") document.title = "Sign up — SignBase PSL";
    else document.title = "SignBase PSL — Communication Without Barriers";
  }, [route]);

  const onAuth = route !== "home";

  return (
    <>
      <div className={onAuth ? "app-route-hidden" : undefined} aria-hidden={onAuth}>
        <App />
      </div>
      {route === "login" && <LoginPage />}
      {route === "signup" && <SignupPage />}
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode><Root /></React.StrictMode>
);
