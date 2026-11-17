import ExcelJS from "exceljs";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "vite";

const localEnv = loadEnv("development", process.cwd(), "");
for (const name of ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) {
  if (!process.env[name] && localEnv[name]) process.env[name] = localEnv[name];
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before migrating users.");
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

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(process.argv[2] || "data/users.xlsx");
const sheet = workbook.getWorksheet("Users") || workbook.worksheets[0];
if (!sheet) throw new Error("The workbook does not contain a Users worksheet.");

const users = [];
sheet.eachRow((row, rowNumber) => {
  if (rowNumber === 1) return;
  const email = cellText(row.getCell(2).value).toLowerCase();
  const passwordHash = cellText(row.getCell(3).value);
  if (!email || !passwordHash) return;
  users.push({
    name: cellText(row.getCell(1).value),
    email,
    password_hash: passwordHash,
    created_at: cellText(row.getCell(4).value) || new Date().toISOString(),
  });
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

for (let index = 0; index < users.length; index += 100) {
  const batch = users.slice(index, index + 100);
  const { error } = await supabase
    .from("app_users")
    .upsert(batch, { onConflict: "email", ignoreDuplicates: true });
  if (error) {
    throw new Error(`User migration failed at batch ${Math.floor(index / 100) + 1}: ${error.message}`);
  }
}

console.log(`Processed ${users.length} workbook rows. Existing database emails were left unchanged.`);
