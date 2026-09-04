-- AlterTable
ALTER TABLE "applications"
    ADD COLUMN "rightToWork" TEXT NOT NULL DEFAULT 'no',
    ADD COLUMN "privacyConsent" TEXT NOT NULL DEFAULT 'on';

-- Existing applications predate these form fields. Remove the temporary defaults
-- so every future value is supplied and validated by the API.
ALTER TABLE "applications"
    ALTER COLUMN "rightToWork" DROP DEFAULT,
    ALTER COLUMN "privacyConsent" DROP DEFAULT;
