/*
  Warnings:

  - You are about to drop the column `userId` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_userId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "_Posts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Posts_AB_unique" ON "_Posts"("A", "B");

-- CreateIndex
CREATE INDEX "_Posts_B_index" ON "_Posts"("B");

-- AddForeignKey
ALTER TABLE "_Posts" ADD CONSTRAINT "_Posts_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Posts" ADD CONSTRAINT "_Posts_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
