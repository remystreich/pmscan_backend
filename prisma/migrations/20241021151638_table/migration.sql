-- CreateTable
CREATE TABLE "PMScan" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "display" BYTEA NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PMScan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PMScan" ADD CONSTRAINT "PMScan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
