-- CreateEnum
CREATE TYPE "TransportStateEnum" AS ENUM ('FREE', 'WAITING_OPERATOR_AUTHORIZATION', 'WAITING_DRIVER_DISPATCH', 'ON_ROUTE');

-- CreateEnum
CREATE TYPE "RouteStatusEnum" AS ENUM ('WAITING_OPERATOR_AUTHORIZATION', 'WAITING_DRIVER_DISPATCH', 'ON_COURSE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OrderStatusEnum" AS ENUM ('WAITING_APPROVAL', 'REJECTED', 'WAITING_PAYMENT', 'IN_PREPARATION', 'LOADED', 'WAITING_DISPATCH', 'ON_ROUTE', 'ACCIDENT', 'RESOLVED_ACCIDENT', 'ARRIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('CLERK', 'OPERATOR', 'DRIVER', 'MANAGER', 'ADMIN');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accessToken" TEXT,
    "role" "RoleEnum" NOT NULL,
    "transportState" "TransportStateEnum",
    "routeId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_cpf_length" CHECK (LENGTH("cpf") = 11),
    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- Adicionar super usuário raíz
INSERT INTO "Users" ("id", "username", "name", "cpf", "passwordHash", "role", "createdById", "updatedAt") VALUES (
    'root',
    'root',
    'Super Admin',
    '00000000000',
    '0',
    'ADMIN',
    'root',
    NOW()
);

-- CreateTable
CREATE TABLE "DriversToLicenses" (
    "driverId" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,

    CONSTRAINT "DriversToLicenses_pkey" PRIMARY KEY ("driverId","licenseId")
);

-- CreateTable
CREATE TABLE "Licenses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routes" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "RouteStatusEnum" NOT NULL,
    "dispatchApprovedOn" TIMESTAMP(3),
    "dispatchApprovedById" TEXT,
    "routeStartedOn" TIMESTAMP(3),
    "routeCompletedOn" TIMESTAMP(3),

    CONSTRAINT "Routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicles" (
    "id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "internalVolume" DOUBLE PRECISION NOT NULL,
    "maxLoad" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "transportState" "TransportStateEnum" NOT NULL,
    "routeId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicles_plate_length" CHECK (LENGTH("plate") = 8),
    CONSTRAINT "Vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehiclesToLicenses" (
    "vehicleId" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,

    CONSTRAINT "VehiclesToLicenses_pkey" PRIMARY KEY ("vehicleId","licenseId")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientRegistration" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "OrderStatusEnum" NOT NULL,
    "rejectedById" TEXT,
    "rejectedOn" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "approvedById" TEXT,
    "approvedOn" TIMESTAMP(3),
    "paymentConfirmedById" TEXT,
    "paymentConfirmedOn" TIMESTAMP(3),
    "loadedById" TEXT,
    "loadedOn" TIMESTAMP(3),
    "routeId" TEXT,
    "routeIndex" INTEGER,
    "accidentOn" TIMESTAMP(3),
    "accidentDescription" TEXT,
    "accidentResolvedById" TEXT,
    "accidentResolvedOn" TIMESTAMP(3),
    "accidentResolutionDescription" TEXT,
    "arrivedOn" TIMESTAMP(3),
    "cancelledById" TEXT,
    "cancelledOn" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "statusBeforeCancellation" "OrderStatusEnum",

    CONSTRAINT "Orders_client_registration_length" CHECK (LENGTH("clientRegistration") = 11 OR LENGTH("clientRegistration") = 14),
    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdersToLicenses" (
    "orderId" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,

    CONSTRAINT "OrdersToLicenses_pkey" PRIMARY KEY ("orderId","licenseId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_cpf_key" ON "Users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Users_routeId_key" ON "Users"("routeId");

-- CreateIndex
CREATE INDEX "Users_isActive_idx" ON "Users"("isActive");

-- CreateIndex
CREATE INDEX "Users_accessToken_idx" ON "Users"("accessToken");

-- CreateIndex
CREATE INDEX "Users_role_idx" ON "Users"("role");

-- CreateIndex
CREATE INDEX "Users_transportState_idx" ON "Users"("transportState");

-- CreateIndex
CREATE INDEX "DriversToLicenses_licenseId_idx" ON "DriversToLicenses"("licenseId");

-- CreateIndex
CREATE INDEX "Routes_driverId_idx" ON "Routes"("driverId");

-- CreateIndex
CREATE INDEX "Routes_vehicleId_idx" ON "Routes"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicles_plate_key" ON "Vehicles"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicles_routeId_key" ON "Vehicles"("routeId");

-- CreateIndex
CREATE INDEX "Vehicles_isActive_idx" ON "Vehicles"("isActive");

-- CreateIndex
CREATE INDEX "Vehicles_transportState_idx" ON "Vehicles"("transportState");

-- CreateIndex
CREATE INDEX "VehiclesToLicenses_licenseId_idx" ON "VehiclesToLicenses"("licenseId");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_routeId_key" ON "Orders"("routeId");

-- CreateIndex
CREATE INDEX "Orders_status_idx" ON "Orders"("status");

-- CreateIndex
CREATE INDEX "OrdersToLicenses_licenseId_idx" ON "OrdersToLicenses"("licenseId");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriversToLicenses" ADD CONSTRAINT "DriversToLicenses_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriversToLicenses" ADD CONSTRAINT "DriversToLicenses_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "Licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licenses" ADD CONSTRAINT "Licenses_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routes" ADD CONSTRAINT "Routes_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routes" ADD CONSTRAINT "Routes_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routes" ADD CONSTRAINT "Routes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routes" ADD CONSTRAINT "Routes_dispatchApprovedById_fkey" FOREIGN KEY ("dispatchApprovedById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicles" ADD CONSTRAINT "Vehicles_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicles" ADD CONSTRAINT "Vehicles_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiclesToLicenses" ADD CONSTRAINT "VehiclesToLicenses_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiclesToLicenses" ADD CONSTRAINT "VehiclesToLicenses_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "Licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_paymentConfirmedById_fkey" FOREIGN KEY ("paymentConfirmedById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_loadedById_fkey" FOREIGN KEY ("loadedById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_accidentResolvedById_fkey" FOREIGN KEY ("accidentResolvedById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdersToLicenses" ADD CONSTRAINT "OrdersToLicenses_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdersToLicenses" ADD CONSTRAINT "OrdersToLicenses_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "Licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
