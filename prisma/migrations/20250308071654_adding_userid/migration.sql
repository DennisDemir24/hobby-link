/*
  Warnings:

  - Added the required column `userId` to the `Community` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "userId" TEXT NOT NULL;
