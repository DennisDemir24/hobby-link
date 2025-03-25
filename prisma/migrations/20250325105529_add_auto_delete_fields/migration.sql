-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "autoDeleteEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autoDeleteEnabledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "scheduledForDeletionAt" TIMESTAMP(3);
