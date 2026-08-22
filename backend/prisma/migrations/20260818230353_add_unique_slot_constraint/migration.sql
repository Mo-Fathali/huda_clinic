/*
  Warnings:

  - A unique constraint covering the columns `[serviceId,date,startTime]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Appointment_serviceId_date_startTime_key" ON "Appointment"("serviceId", "date", "startTime");
