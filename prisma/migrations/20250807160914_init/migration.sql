-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CAREWORKER'
);

-- CreateTable
CREATE TABLE "ClockLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "clockInAt" DATETIME NOT NULL,
    "clockInLoc" TEXT NOT NULL,
    "clockOutAt" DATETIME,
    "clockOutLoc" TEXT,
    "noteIn" TEXT,
    "noteOut" TEXT,
    CONSTRAINT "ClockLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
