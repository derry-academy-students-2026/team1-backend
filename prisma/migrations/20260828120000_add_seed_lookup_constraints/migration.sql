-- CreateIndex
CREATE UNIQUE INDEX "capabilities_capabilityName_key" ON "capabilities"("capabilityName");

-- CreateIndex
CREATE UNIQUE INDEX "bands_bandName_key" ON "bands"("bandName");

-- CreateIndex
CREATE UNIQUE INDEX "statuses_statusName_key" ON "statuses"("statusName");

-- CreateIndex
CREATE UNIQUE INDEX "job_roles_sharepointUrl_key" ON "job_roles"("sharepointUrl");