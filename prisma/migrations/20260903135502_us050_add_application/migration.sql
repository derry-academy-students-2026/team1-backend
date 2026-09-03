-- CreateTable
CREATE TABLE "applications" (
    "applicationId" SERIAL NOT NULL,
    "jobRoleId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "applicantName" TEXT NOT NULL,
    "applicantEmail" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "linkedInUrl" TEXT,
    "coverLetter" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in progress',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("applicationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_jobRoleId_userId_key" ON "applications"("jobRoleId", "userId");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "job_roles"("jobRoleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
