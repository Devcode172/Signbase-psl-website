import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const LOGIN_MAIL = "Thanks for login in";

const hits = new Map();

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function createSupabaseClient(env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw Object.assign(
      new Error("Database is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the server environment."),
      { status: 503 }
    );
  }
  try {
    return createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  } catch {
    throw Object.assign(
      new Error("Supabase configuration is invalid. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."),
      { status: 503 }
    );
  }
}

function databaseUnavailable(operation, error) {
  console.error(`Supabase ${operation} failed (${error?.code || error?.name || "unknown error"}).`);
  return Object.assign(
    new Error("Account storage is temporarily unavailable. Please try again."),
    { status: 503 }
  );
}

async function insertUser(user, env) {
  const supabase = createSupabaseClient(env);
  let result;
  try {
    result = await supabase.from("app_users").insert(user);
  } catch (error) {
    throw databaseUnavailable("signup", error);
  }

  if (result.error?.code === "23505") return false;
  if (result.error) throw databaseUnavailable("signup", result.error);
  return true;
}

async function findUser(email, env) {
  const supabase = createSupabaseClient(env);
  let result;
  try {
    result = await supabase
      .from("app_users")
      .select("email, password_hash")
      .eq("email", email)
      .maybeSingle();
  } catch (error) {
    throw databaseUnavailable("login lookup", error);
  }

  if (result.error) throw databaseUnavailable("login lookup", result.error);
  return result.data;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function parseBody(raw) {
  if (raw && typeof raw === "object" && !Buffer.isBuffer(raw)) return raw;
  const text = Buffer.isBuffer(raw) ? raw.toString("utf8") : String(raw || "");
  if (!text) return {};
  try {
    const body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch {
    throw Object.assign(new Error("The form could not be read."), { status: 400 });
  }
}

function readBody(req) {
  if (req.body !== undefined) return Promise.resolve(parseBody(req.body));
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      const buffer = Buffer.from(chunk);
      size += buffer.length;
      if (size > 20_000) {
        reject(Object.assign(new Error("That request is too large."), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(buffer);
    });
    req.on("end", () => {
      try {
        resolve(parseBody(Buffer.concat(chunks)));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", () => {
      reject(Object.assign(new Error("The form could not be read."), { status: 400 }));
    });
  });
}

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function cleanName(value) {
  return String(value || "").replace(/[\u0000-\u001F]/g, "").trim();
}

function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((time) => now - time < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 12;
}

async function sendLoginMail(env, to) {
  const host = env.SMTP_HOST;
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw Object.assign(
      new Error("Mail is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in the server environment."),
      { status: 503 }
    );
  }

  const port = Number(env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: env.SMTP_SECURE === "true" || port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: env.MAIL_FROM || user,
    to,
    subject: LOGIN_MAIL,
    text: LOGIN_MAIL,
  });
}

async function handle(req, res, env) {
  const url = (req.url || "").split("?")[0];
  if (url !== "/api/signup" && url !== "/api/login") return false;
  if (req.method !== "POST") {
    send(res, 405, { error: "Use the form on this page." });
    return true;
  }

  const ip = req.socket?.remoteAddress || "local";
  if (limited(ip)) {
    send(res, 429, { error: "Too many attempts. Wait a minute and try again." });
    return true;
  }

  const body = await readBody(req);
  const email = cleanEmail(body.email);
  const password = String(body.password || "");

  if (!validEmail(email)) {
    send(res, 400, { error: "Enter a valid email address." });
    return true;
  }
  if (password.length < 8 || password.length > 128) {
    send(res, 400, { error: "Password must be at least 8 characters." });
    return true;
  }

  if (url === "/api/signup") {
    const name = cleanName(body.name);
    if (name.length < 2 || name.length > 80) {
      send(res, 400, { error: "Enter your name." });
      return true;
    }

    const created = await insertUser({
      name,
      email,
      password_hash: hashPassword(password),
    }, env);

    if (!created) {
      send(res, 409, { error: "An account with this email already exists. Log in instead." });
      return true;
    }

    send(res, 201, { ok: true });
    return true;
  }

  const user = await findUser(email, env);
  if (!user || !verifyPassword(password, user.password_hash)) {
    send(res, 401, { error: "Email or password is incorrect." });
    return true;
  }

  try {
    await sendLoginMail(env, user.email);
  } catch (error) {
    const status = error.status || 502;
    const message = error.status
      ? error.message
      : "You are signed in, but the email could not be sent. Check the SMTP environment variables.";
    send(res, status, { error: message });
    return true;
  }

  send(res, 200, { ok: true, email: user.email, message: LOGIN_MAIL });
  return true;
}

export async function handleAuthRequest(req, res, env = process.env) {
  try {
    const handled = await handle(req, res, env);
    if (!handled) send(res, 404, { error: "Not found." });
  } catch (error) {
    if (!res.headersSent) send(res, error.status || 500, { error: error.message || "Something went wrong." });
  }
}

export function authApiPlugin(env) {
  const attach = (server) => {
    server.middlewares.use((req, res, next) => {
      handle(req, res, env)
        .then((handled) => {
          if (!handled) next();
        })
        .catch((error) => {
          if (!res.headersSent) send(res, error.status || 500, { error: error.message || "Something went wrong." });
        });
    });
  };

  return {
    name: "signbase-auth-api",
    configureServer: attach,
    configurePreviewServer: attach,
  };
}
