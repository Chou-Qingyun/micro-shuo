import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import { randomBytes, scryptSync } from "node:crypto";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

function readArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? "" : process.argv[index + 1] || "";
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derivedKey}`;
}

const username = readArg("username").trim();
const password = readArg("password");
const displayName = readArg("display-name").trim() || username;

if (!username || !password) {
  console.error(
    "Usage: npm run admin:create -- --username admin --password 'your-password'",
  );
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Please configure .env.local first.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

try {
  const adminUser = await prisma.adminUser.upsert({
    where: { username },
    update: {
      passwordHash: hashPassword(password),
      displayName,
      isActive: true,
    },
    create: {
      username,
      passwordHash: hashPassword(password),
      displayName,
    },
  });

  console.log(`Admin user saved: ${adminUser.username}`);
} finally {
  await prisma.$disconnect();
}

