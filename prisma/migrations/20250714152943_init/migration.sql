-- CreateEnum
CREATE TYPE "MachineStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OUT_OF_WATER', 'ERROR');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING_PAYMENT', 'PAYMENT_COMPLETE', 'PAYMENT_FAILED');

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "location_description" TEXT NOT NULL,
    "location_link" TEXT NOT NULL,
    "status" "MachineStatus" NOT NULL,
    "installed_at" TIMESTAMP(3) NOT NULL,
    "last_online_at" TIMESTAMP(3),

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_code_payments" (
    "id" TEXT NOT NULL,
    "machine_id" TEXT NOT NULL,
    "decoded_qr" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "status" "TransactionStatus" NOT NULL,

    CONSTRAINT "qr_code_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_logs" (
    "id" TEXT NOT NULL,
    "machine_id" TEXT NOT NULL,
    "maintenance_date" TIMESTAMP(3) NOT NULL,
    "technician_name" TEXT NOT NULL,
    "notes" TEXT NOT NULL,

    CONSTRAINT "maintenance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hourly_machine_reports" (
    "id" TEXT NOT NULL,
    "machine_id" TEXT NOT NULL,
    "report_timestamp" TIMESTAMP(3) NOT NULL,
    "total_ro_dispensed" INTEGER NOT NULL,
    "total_al_dispensed" INTEGER NOT NULL,
    "total_mi_dispensed" INTEGER NOT NULL,
    "total_qr_revenue" INTEGER NOT NULL,
    "total_cash_revenue" INTEGER NOT NULL,
    "num_cash_transaction" INTEGER NOT NULL,
    "num_qr_transaction" INTEGER NOT NULL,
    "total_s_btl_count" INTEGER NOT NULL,
    "total_m_btl_count" INTEGER NOT NULL,
    "total_l_btl_count" INTEGER NOT NULL,
    "total_xl_btl_count" INTEGER NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hourly_machine_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "qr_code_payments" ADD CONSTRAINT "qr_code_payments_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hourly_machine_reports" ADD CONSTRAINT "hourly_machine_reports_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
