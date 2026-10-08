-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cycle" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Level_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "levelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    CONSTRAINT "Group_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroupRoutineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "GroupRoutineItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT,
    "attentionHours" TEXT,
    "avatarInitials" TEXT NOT NULL,
    "avatarColor" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "StaffAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "groupId" TEXT,
    "roleLabel" TEXT NOT NULL,
    CONSTRAINT "StaffAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StaffAssignment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "allergySevere" BOOLEAN NOT NULL DEFAULT false,
    "allergyDetail" TEXT,
    "feedingNotes" TEXT,
    "sleepNotes" TEXT,
    "likes" TEXT,
    "adaptationNotes" TEXT,
    "photoVisibility" BOOLEAN NOT NULL DEFAULT true,
    "avatarColor" TEXT NOT NULL,
    CONSTRAINT "Child_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    CONSTRAINT "EmergencyContact_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "relationshipLabel" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ChildGuardian" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "receivesComms" BOOLEAN NOT NULL DEFAULT true,
    "canPickUp" BOOLEAN NOT NULL DEFAULT false,
    "canPay" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ChildGuardian_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChildGuardian_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "checkInTime" DATETIME,
    "checkInBy" TEXT,
    "checkOutTime" DATETIME,
    "checkOutBy" TEXT,
    "registeredById" TEXT,
    CONSTRAINT "Attendance_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attendance_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "time" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "exceptionValue" TEXT,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "photoUrl" TEXT,
    "authorId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyEntry_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DailyEntry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailySummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "mood" TEXT,
    "note" TEXT,
    "materialsForTomorrow" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SIN_REGISTROS',
    "authorId" TEXT,
    "sentAt" DATETIME,
    "readAt" DATETIME,
    CONSTRAINT "DailySummary_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DailySummary_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audienceScope" TEXT NOT NULL,
    "groupId" TEXT,
    "responseType" TEXT NOT NULL,
    "dueAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "addToCalendar" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Notice_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notice_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NoticeRecipient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noticeId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "readAt" DATETIME,
    "response" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "respondedAt" DATETIME,
    CONSTRAINT "NoticeRecipient_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "Notice" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NoticeRecipient_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NoticeRecipient_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "audienceScope" TEXT NOT NULL,
    "groupId" TEXT,
    "rsvpRequired" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Event_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventGuardian" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "reminder" BOOLEAN NOT NULL DEFAULT false,
    "rsvp" TEXT,
    CONSTRAINT "EventGuardian_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventGuardian_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventGuardian_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Concept" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "periodicity" TEXT NOT NULL,
    "validFrom" DATETIME,
    "validTo" DATETIME,
    "applicableMonths" TEXT,
    "dueRule" TEXT,
    "calculation" TEXT
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT "Charge_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Charge_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guardianId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "proofUrl" TEXT,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VALIDACION',
    "folio" TEXT,
    "validatedById" TEXT,
    "validatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "chargeId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PaymentAllocation_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_email_key" ON "Guardian"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ChildGuardian_childId_guardianId_key" ON "ChildGuardian"("childId", "guardianId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_childId_date_key" ON "Attendance"("childId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailySummary_childId_date_key" ON "DailySummary"("childId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "NoticeRecipient_noticeId_guardianId_childId_key" ON "NoticeRecipient"("noticeId", "guardianId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "EventGuardian_eventId_guardianId_childId_key" ON "EventGuardian"("eventId", "guardianId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "Concept_key_key" ON "Concept"("key");
