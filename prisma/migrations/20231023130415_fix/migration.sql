/*
  Warnings:

  - You are about to drop the column `postId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_postId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "postId";
