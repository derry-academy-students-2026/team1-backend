/*
  Warnings:

  - You are about to drop the column `status` on the `job_roles` table. All the data in the column will be lost.
  - Added the required column `description` to the `job_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfOpenPositions` to the `job_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsibilities` to the `job_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharepointUrl` to the `job_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusId` to the `job_roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "job_roles" DROP COLUMN "status",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "numberOfOpenPositions" INTEGER NOT NULL,
ADD COLUMN     "responsibilities" TEXT NOT NULL,
ADD COLUMN     "sharepointUrl" TEXT NOT NULL,
ADD COLUMN     "statusId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "statuses" (
    "statusId" SERIAL NOT NULL,
    "statusName" TEXT NOT NULL,

    CONSTRAINT "statuses_pkey" PRIMARY KEY ("statusId")
);

-- AddForeignKey
ALTER TABLE "job_roles" ADD CONSTRAINT "job_roles_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "statuses"("statusId") ON DELETE RESTRICT ON UPDATE CASCADE;
