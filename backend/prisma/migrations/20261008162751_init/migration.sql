-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "busCount" INTEGER NOT NULL,
    "busNote" TEXT,
    "frequencyMin" INTEGER NOT NULL,
    "firstTrip" TEXT NOT NULL,
    "lastTrip" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "departureTimes" TEXT[],

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusStop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'OUTBOUND',
    "transferRoutes" INTEGER[],
    "routeId" INTEGER NOT NULL,

    CONSTRAINT "BusStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Route_number_key" ON "Route"("number");

-- CreateIndex
CREATE INDEX "BusStop_routeId_direction_order_idx" ON "BusStop"("routeId", "direction", "order");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "BusStop" ADD CONSTRAINT "BusStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
