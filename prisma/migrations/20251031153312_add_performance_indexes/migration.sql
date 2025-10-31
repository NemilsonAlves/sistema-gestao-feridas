-- CreateIndex
CREATE INDEX "appointments_patientId_idx" ON "appointments"("patientId");

-- CreateIndex
CREATE INDEX "appointments_userId_idx" ON "appointments"("userId");

-- CreateIndex
CREATE INDEX "appointments_scheduledDate_idx" ON "appointments"("scheduledDate");

-- CreateIndex
CREATE INDEX "appointments_status_scheduledDate_idx" ON "appointments"("status", "scheduledDate");

-- CreateIndex
CREATE INDEX "appointments_priority_idx" ON "appointments"("priority");

-- CreateIndex
CREATE INDEX "evolutions_patientId_idx" ON "evolutions"("patientId");

-- CreateIndex
CREATE INDEX "evolutions_woundId_idx" ON "evolutions"("woundId");

-- CreateIndex
CREATE INDEX "evolutions_userId_idx" ON "evolutions"("userId");

-- CreateIndex
CREATE INDEX "evolutions_createdAt_idx" ON "evolutions"("createdAt");

-- CreateIndex
CREATE INDEX "evolutions_type_idx" ON "evolutions"("type");

-- CreateIndex
CREATE INDEX "patients_cpf_idx" ON "patients"("cpf");

-- CreateIndex
CREATE INDEX "patients_name_idx" ON "patients"("name");

-- CreateIndex
CREATE INDEX "patients_status_createdAt_idx" ON "patients"("status", "createdAt");

-- CreateIndex
CREATE INDEX "patients_responsibleId_idx" ON "patients"("responsibleId");

-- CreateIndex
CREATE INDEX "treatments_patientId_idx" ON "treatments"("patientId");

-- CreateIndex
CREATE INDEX "treatments_woundId_idx" ON "treatments"("woundId");

-- CreateIndex
CREATE INDEX "treatments_userId_idx" ON "treatments"("userId");

-- CreateIndex
CREATE INDEX "treatments_createdAt_idx" ON "treatments"("createdAt");

-- CreateIndex
CREATE INDEX "treatments_nextChangeDate_idx" ON "treatments"("nextChangeDate");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_isActive_idx" ON "users"("role", "isActive");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "wound_images_woundId_idx" ON "wound_images"("woundId");

-- CreateIndex
CREATE INDEX "wound_images_createdAt_idx" ON "wound_images"("createdAt");

-- CreateIndex
CREATE INDEX "wounds_patientId_idx" ON "wounds"("patientId");

-- CreateIndex
CREATE INDEX "wounds_status_createdAt_idx" ON "wounds"("status", "createdAt");

-- CreateIndex
CREATE INDEX "wounds_type_status_idx" ON "wounds"("type", "status");

-- CreateIndex
CREATE INDEX "wounds_createdAt_idx" ON "wounds"("createdAt");
