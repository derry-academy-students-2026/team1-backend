-- CreateEnum
CREATE TYPE "RightToWork" AS ENUM ('yes', 'no');

-- CreateEnum
CREATE TYPE "PrivacyConsent" AS ENUM ('on');

-- AlterTable
-- Values were already constrained to these strings by the API, so the cast is safe.
ALTER TABLE "applications"
    ALTER COLUMN "rightToWork" TYPE "RightToWork" USING "rightToWork"::"RightToWork",
    ALTER COLUMN "privacyConsent" TYPE "PrivacyConsent" USING "privacyConsent"::"PrivacyConsent";
