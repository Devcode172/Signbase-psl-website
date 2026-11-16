import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";
import nodemailer from "nodemailer";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const usersFile = path.join(root, "data", "users.xlsx");
const legacyFile = path.join(root, "data", "users.json");
const LOGIN_MAIL = "Thanks for login in";
const SHEET_NAME = "Users";

const hits = new Map();

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function cellText(value) {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if (typeof value.text === "string") return value.text;
    if (value.result != null) return cellText(value.result);
    if (Array.isArray(value.richText)) return value.richText.map((part) => part.text || "").join("");
  }
  return String(value).trim();
}

function readLegacyUsers() {
  try {
    const parsed = JSON.parse(fs.readFileSync(legacyFile, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readUsers() {
  if (!fs.existsSync(usersFile)) {
    const legacy = readLegacyUsers();
    if (legacy.length) await writeUsers(legacy);
    return legacy;
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(usersFile);
  const sheet = workbook.getWorksheet(SHEET_NAME) || workbook.worksheets[0];
  if (!sheet) return [];

  const users = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const email = cellText(row.getCell(2).value).toLowerCase();
    const passwordHash = cellText(row.getCell(3).value);
    if (!email || !passwordHash) return;
    users.push({
      name: cellText(row.getCell(1).value),
      email,
      passwordHash,
      createdAt: cellText(row.getCell(4).value),
    });
  });
  return users;
}

async function writeUsers(users) {
  fs.mkdirSync(path.dirname(usersFile), { recursive: true });
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(SHEET_NAME);
  sheet.columns = [
    { header: "Name", key: "name", width: 28 },
    { header: "Email", key: "email", width: 36 },
    { header: "Password Hash", key: "passwordHash", width: 88 },
    { header: "Created At", key: "createdAt", width: 28 },
  ];
  sheet.getRow(1).font = { bold: true };
  for (const user of users) {
    sheet.addRow({
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    });
  }

  try {
    await workbook.xlsx.writeFile(usersFile);
  } catch (error) {
    if (error.code === "EBUSY" || error.code === "EPERM") {
      throw Object.assign(new Error("Close data/users.xlsx in Excel, then try again."), { status: 503 });
    }
    throw error;
  }
}

let writeChain = Promise.resolve();

function updateUsers(mutator) {
  writeChain = writeChain.then(async () => {
    const users = await readUsers();
    const result = mutator(users);
    await writeUsers(users);
    return result;
  });
  return writeChain;
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

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 20_000) {
        reject(Object.assign(new Error("That request is too large."), { status: 413 }));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error("The form could not be read."), { status: 400 }));
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
      new Error("Mail is not set up yet. Add SMTP_HOST, SMTP_USER, and SMTP_PASS to the .env file, then restart the site."),
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

    const created = await updateUsers((users) => {
      if (users.some((user) => user.email === email)) return false;
      users.push({
        name,
        email,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      });
      return true;
    });

    if (!created) {
      send(res, 409, { error: "An account with this email already exists. Log in instead." });
      return true;
    }

    send(res, 201, { ok: true });
    return true;
  }

  const users = await readUsers();
  const user = users.find((entry) => entry.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    send(res, 401, { error: "Email or password is incorrect." });
    return true;
  }

  try {
    await sendLoginMail(env, user.email);
  } catch (error) {
    const status = error.status || 502;
    const message = error.status
      ? error.message
      : "You are signed in, but the email could not be sent. Check the mail settings in .env.";
    send(res, status, { error: message });
    return true;
  }

  send(res, 200, { ok: true, email: user.email, message: LOGIN_MAIL });
  return true;
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
