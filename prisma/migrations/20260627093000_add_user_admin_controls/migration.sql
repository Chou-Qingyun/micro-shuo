ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginCountry" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isLoginBlocked" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "UserLoginEvent" ADD COLUMN IF NOT EXISTS "country" TEXT;

CREATE INDEX IF NOT EXISTS "User_isLoginBlocked_idx" ON "User"("isLoginBlocked");
