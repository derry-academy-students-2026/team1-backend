-- CreateTable
CREATE TABLE "job_roles" (
    "jobRoleId" SERIAL NOT NULL,
    "roleName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "closingDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "capabilityId" INTEGER NOT NULL,
    "bandId" INTEGER NOT NULL,

    CONSTRAINT "job_roles_pkey" PRIMARY KEY ("jobRoleId")
);

-- CreateTable
CREATE TABLE "capabilities" (
    "capabilityId" SERIAL NOT NULL,
    "capabilityName" TEXT NOT NULL,

    CONSTRAINT "capabilities_pkey" PRIMARY KEY ("capabilityId")
);

-- CreateTable
CREATE TABLE "bands" (
    "bandId" SERIAL NOT NULL,
    "bandName" TEXT NOT NULL,

    CONSTRAINT "bands_pkey" PRIMARY KEY ("bandId")
);

-- AddForeignKey
ALTER TABLE "job_roles" ADD CONSTRAINT "job_roles_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "capabilities"("capabilityId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_roles" ADD CONSTRAINT "job_roles_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "bands"("bandId") ON DELETE RESTRICT ON UPDATE CASCADE;
