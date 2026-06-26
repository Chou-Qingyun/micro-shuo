-- Allow one email address to subscribe to multiple sources, such as multiple novels.
UPDATE "Subscription"
SET "source" = 'site'
WHERE "source" IS NULL;

DROP INDEX IF EXISTS "Subscription_email_key";

ALTER TABLE "Subscription"
ALTER COLUMN "source" SET DEFAULT 'site',
ALTER COLUMN "source" SET NOT NULL;

CREATE INDEX "Subscription_email_idx" ON "Subscription"("email");
CREATE UNIQUE INDEX "Subscription_email_source_key" ON "Subscription"("email", "source");
