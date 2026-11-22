CREATE TYPE "AccountRole" AS ENUM ('user', 'admin');
CREATE TYPE "WorkItemStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'ARCHIVED');
CREATE TYPE "WorkItemPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "role" "AccountRole" NOT NULL,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Profile" (
    "accountId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    CONSTRAINT "Profile_pkey" PRIMARY KEY ("accountId")
);

CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "title" TEXT NOT NULL,
    "status" "WorkItemStatus" NOT NULL,
    "priority" "WorkItemPriority" NOT NULL,
    "estimatedHours" INTEGER NOT NULL,
    "internalNote" TEXT NOT NULL,
    "internalCostCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "WorkItem_estimatedHours_nonnegative" CHECK ("estimatedHours" >= 0),
    CONSTRAINT "WorkItem_internalCostCents_nonnegative" CHECK ("internalCostCents" >= 0)
);

CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkItemLabel" (
    "workItemId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,
    CONSTRAINT "WorkItemLabel_pkey" PRIMARY KEY ("workItemId", "labelId")
);

CREATE UNIQUE INDEX "Account_login_key" ON "Account"("login");
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE INDEX "WorkItem_ownerId_projectId_idx" ON "WorkItem"("ownerId", "projectId");
CREATE INDEX "WorkItem_projectId_idx" ON "WorkItem"("projectId");
CREATE UNIQUE INDEX "Label_slug_key" ON "Label"("slug");
CREATE INDEX "WorkItemLabel_labelId_idx" ON "WorkItemLabel"("labelId");

ALTER TABLE "Profile" ADD CONSTRAINT "Profile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkItemLabel" ADD CONSTRAINT "WorkItemLabel_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkItemLabel" ADD CONSTRAINT "WorkItemLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
