import React, { useState } from "react";
import { ArrowLeft, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import "../auth.css";

function Brand() {
  return (
    <a className="auth-brand" href="#home">
      <img src={`${import.meta.env.BASE_URL}psl-emblem-white.png`} alt="" className="auth-brand-mark" />
      <span>SignBase <b>PSL</b></span>
    </a>
  );
}

function Field({ id, label, type = "text", value, onChange, autoComplete, placeholder }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <label className="auth-field" htmlFor={id}>
      <span>{label}</span>
      <div className={isPassword ? "auth-field-wrap" : undefined}>
        <input
          id={id}
          name={id}
          type={inputType}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          required
        />
        {isPassword && (
          <button
            type="button"
            className="auth-eye-btn"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </label>
  );
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong. Try again.");
  return data;
}

export function LoginPage() {
  const created = window.location.hash.includes("created=1");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await postJson("/api/login", { email, password });
      setSentTo(data.email || email.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <Brand />
      <section className="auth-card">
        {sentTo ? (
          <div className="auth-success">
            <p className="auth-kicker">Email sent</p>
            <h1>Thanks for login in</h1>
            <p>
              A message was sent to <b>{sentTo}</b>. It says "Thanks for login in".
            </p>
            <a className="auth-submit" href="#home">Back to the site <ArrowUpRight size={16} /></a>
          </div>
        ) : (
          <>
            <div className="auth-heading-row">
              <a className="auth-back" href="#home"><ArrowLeft size={15} /> Back</a>
              <h1>Log in</h1>
            </div>
            <p className="auth-lead">Use the email and password from your SignBase account.</p>
            {created && <p className="auth-note">Account created. Log in and we will email you.</p>}
            <form onSubmit={onSubmit}>
              <Field id="login-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="you@email.com" />
              <Field id="login-password" label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" placeholder="Your password" />
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button className="auth-submit" type="submit" disabled={busy}>
                {busy ? "Sending email…" : "Log in"}
              </button>
            </form>
            <p className="auth-switch">
              New here? <a href="#/signup">Create an account</a>
            </p>
          </>
        )}
      </section>
    </main>
  );
}

export function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await postJson("/api/signup", { name, email, password });
      window.location.hash = "#/login?created=1";
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <Brand />
      <section className="auth-card">
        <div className="auth-heading-row">
          <a className="auth-back" href="#home"><ArrowLeft size={15} /> Back</a>
          <h1 className="auth-heading-signup">Create an account</h1>
        </div>
        <p className="auth-lead">Sign up with the email where you want to receive messages.</p>
        <form onSubmit={onSubmit}>
          <Field id="signup-name" label="Name" value={name} onChange={setName} autoComplete="name" placeholder="Your name" />
          <Field id="signup-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="you@email.com" />
          <Field id="signup-password" label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" placeholder="At least 8 characters" />
          <Field id="signup-confirm" label="Confirm password" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" placeholder="Repeat your password" />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <a href="#/login">Log in</a>
        </p>
      </section>
    </main>
  );
}
