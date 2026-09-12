-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('INMEDIATA', 'ALTA', 'MEDIA', 'BAJA', 'NINGUNA');

-- AlterEnum
BEGIN;
CREATE TYPE "EstadoTarea_new" AS ENUM ('PDTE_INICIAR', 'EN_CURSO', 'PDTE_CLIENTE', 'PDTE_OTROS', 'PDTE_COBRO', 'TERMINADA');
ALTER TABLE "public"."TareaPendiente" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "TareaPendiente" ALTER COLUMN "estado" TYPE "EstadoTarea_new" USING ("estado"::text::"EstadoTarea_new");
ALTER TYPE "EstadoTarea" RENAME TO "EstadoTarea_old";
ALTER TYPE "EstadoTarea_new" RENAME TO "EstadoTarea";
DROP TYPE "public"."EstadoTarea_old";
ALTER TABLE "TareaPendiente" ALTER COLUMN "estado" SET DEFAULT 'PDTE_INICIAR';
COMMIT;

-- AlterTable
ALTER TABLE "TareaPendiente" DROP COLUMN "urgencia",
ADD COLUMN     "prioridad" "Prioridad" NOT NULL DEFAULT 'MEDIA',
ALTER COLUMN "estado" SET DEFAULT 'PDTE_INICIAR';

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "tarifaHoraDefecto";

-- DropEnum
DROP TYPE "Urgencia";

-- CreateTable
CREATE TABLE "TarifaDespacho" (
    "id" TEXT NOT NULL,
    "importeHora" DECIMAL(10,2) NOT NULL,
    "vigenteDesde" TIMESTAMP(3) NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TarifaDespacho_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TarifaDespacho_vigenteDesde_idx" ON "TarifaDespacho"("vigenteDesde");

