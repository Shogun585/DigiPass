-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'warden', 'guard', 'other');

-- CreateEnum
CREATE TYPE "PassType" AS ENUM ('leave', 'market', 'other');

-- CreateEnum
CREATE TYPE "PassStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('checked in', 'checked out', 'scan');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('out', 'in', 'market');

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(25) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(20) NOT NULL,
    "last_name" VARCHAR(20) NOT NULL,
    "role" "Role" NOT NULL,
    "contact_details" VARCHAR(50),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_pass" (
    "pass_id" SERIAL NOT NULL,
    "college_id" VARCHAR(25) NOT NULL,
    "pass_type" "PassType" NOT NULL,
    "leave_start" DATE NOT NULL,
    "leave_end" DATE NOT NULL,
    "pass_status" "PassStatus" NOT NULL DEFAULT 'pending',
    "request_time" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_pass_pkey" PRIMARY KEY ("pass_id")
);

-- CreateTable
CREATE TABLE "logs" (
    "screen_id" SERIAL NOT NULL,
    "action" "LogAction" NOT NULL,
    "pass_id" INTEGER NOT NULL,
    "staff_id" VARCHAR(25) NOT NULL,
    "scan_time" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_status" "StudentStatus" NOT NULL DEFAULT 'in',

    CONSTRAINT "logs_pkey" PRIMARY KEY ("screen_id")
);

-- CreateIndex
CREATE INDEX "college_id_idx" ON "leave_pass"("college_id");

-- CreateIndex
CREATE INDEX "pass_id_idx" ON "logs"("pass_id");

-- CreateIndex
CREATE INDEX "staff_id_idx" ON "logs"("staff_id");

-- AddForeignKey
ALTER TABLE "leave_pass" ADD CONSTRAINT "leave_pass_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_pass_id_fkey" FOREIGN KEY ("pass_id") REFERENCES "leave_pass"("pass_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
