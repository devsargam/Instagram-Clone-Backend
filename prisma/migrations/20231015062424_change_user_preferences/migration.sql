/*
  Warnings:

  - Added the required column `website` to the `UserPreferences` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'PREFER_NOT_SAY');

-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'PREFER_NOT_SAY',
ADD COLUMN     "website" TEXT NOT NULL;
