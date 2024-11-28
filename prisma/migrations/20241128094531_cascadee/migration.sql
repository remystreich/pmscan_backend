-- DropForeignKey
ALTER TABLE "PMScan" DROP CONSTRAINT "PMScan_userId_fkey";

-- DropForeignKey
ALTER TABLE "Record" DROP CONSTRAINT "Record_pmScanId_fkey";

-- CreateIndex
CREATE INDEX "Record_pmScanId_idx" ON "Record"("pmScanId");

-- AddForeignKey
ALTER TABLE "PMScan" ADD CONSTRAINT "PMScan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_pmScanId_fkey" FOREIGN KEY ("pmScanId") REFERENCES "PMScan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
