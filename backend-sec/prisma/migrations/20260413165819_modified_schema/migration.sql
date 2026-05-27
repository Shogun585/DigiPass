-- AlterTable
ALTER TABLE "logs" ALTER COLUMN "scan_time" SET DATA TYPE TIMESTAMP(0);

-- RenameIndex
ALTER INDEX "college_id_idx" RENAME TO "college_id";

-- RenameIndex
ALTER INDEX "pass_id_idx" RENAME TO "pass_id";

-- RenameIndex
ALTER INDEX "staff_id_idx" RENAME TO "staff_id";
