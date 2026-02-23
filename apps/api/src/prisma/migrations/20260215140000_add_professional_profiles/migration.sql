-- CreateTable
CREATE TABLE "employee_tokens" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_profiles" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "specialty" TEXT,
    "bio" TEXT,
    "headline" TEXT,
    "yearsExperience" INTEGER,
    "skills" TEXT NOT NULL DEFAULT '[]',
    "certifications" TEXT NOT NULL DEFAULT '[]',
    "availability" TEXT,
    "preferredZones" TEXT NOT NULL DEFAULT '[]',
    "consentedAt" TIMESTAMP(3),
    "consentIp" TEXT,
    "openToWork" BOOLEAN NOT NULL DEFAULT false,
    "profileVisible" BOOLEAN NOT NULL DEFAULT false,
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_experiences" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professional_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_tokens_token_key" ON "employee_tokens"("token");

-- CreateIndex
CREATE INDEX "employee_tokens_employeeId_idx" ON "employee_tokens"("employeeId");

-- CreateIndex
CREATE INDEX "employee_tokens_token_idx" ON "employee_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "professional_profiles_email_key" ON "professional_profiles"("email");

-- CreateIndex
CREATE INDEX "professional_profiles_employeeId_idx" ON "professional_profiles"("employeeId");

-- CreateIndex
CREATE INDEX "professional_profiles_openToWork_profileVisible_idx" ON "professional_profiles"("openToWork", "profileVisible");

-- CreateIndex
CREATE INDEX "professional_experiences_profileId_idx" ON "professional_experiences"("profileId");

-- AddForeignKey
ALTER TABLE "employee_tokens" ADD CONSTRAINT "employee_tokens_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_experiences" ADD CONSTRAINT "professional_experiences_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "professional_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
