-- CreateTable
CREATE TABLE "Record" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data" BYTEA NOT NULL,
    "name" TEXT,
    "pmScanId" INTEGER NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_pmScanId_fkey" FOREIGN KEY ("pmScanId") REFERENCES "PMScan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
