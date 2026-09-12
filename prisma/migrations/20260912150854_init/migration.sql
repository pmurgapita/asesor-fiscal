-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'TRABAJADOR');

-- CreateEnum
CREATE TYPE "EstadoCivil" AS ENUM ('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'PAREJA_DE_HECHO');

-- CreateEnum
CREATE TYPE "TipoFamiliar" AS ENUM ('CONYUGE', 'HIJO');

-- CreateEnum
CREATE TYPE "EstadoTrabajo" AS ENUM ('POR_COMENZAR', 'EN_CURSO', 'TERMINADO');

-- CreateEnum
CREATE TYPE "EstadoCobro" AS ENUM ('PENDIENTE', 'FACTURADO', 'COBRADO');

-- CreateEnum
CREATE TYPE "OrigenRegistroTiempo" AS ENUM ('CRONOMETRO', 'MANUAL');

-- CreateEnum
CREATE TYPE "Urgencia" AS ENUM ('BAJA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "EstadoTarea" AS ENUM ('PENDIENTE', 'EN_CURSO', 'HECHA');

-- CreateEnum
CREATE TYPE "EstadoProcedimiento" AS ENUM ('ABIERTO', 'CERRADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'TRABAJADOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "tarifaHoraDefecto" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaCliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "CategoriaCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "dni" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "estadoCivil" "EstadoCivil",
    "regimenMatrimonial" TEXT,
    "tarifaHoraEspecial" DECIMAL(10,2),
    "razonSocialFacturacion" TEXT,
    "cifFacturacion" TEXT,
    "direccionFacturacion" TEXT,
    "categoriaId" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lbcDatos" JSONB,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Familiar" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipo" "TipoFamiliar" NOT NULL,
    "nombre" TEXT NOT NULL,
    "dni" TEXT,
    "fechaNacimiento" TIMESTAMP(3),

    CONSTRAINT "Familiar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cif" TEXT,
    "direccion" TEXT,
    "actividad" TEXT,
    "notas" TEXT,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaTrabajo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "CategoriaTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trabajo" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoTrabajo" NOT NULL DEFAULT 'POR_COMENZAR',
    "fechaAlta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),
    "creadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrabajoAsignacion" (
    "trabajoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "TrabajoAsignacion_pkey" PRIMARY KEY ("trabajoId","usuarioId")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" TEXT NOT NULL,
    "trabajoId" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "importe" DECIMAL(10,2) NOT NULL,
    "repercutirACliente" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoPorId" TEXT NOT NULL,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroTiempo" (
    "id" TEXT NOT NULL,
    "trabajoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horaInicio" TIMESTAMP(3) NOT NULL,
    "horaFin" TIMESTAMP(3),
    "duracionMinutos" INTEGER,
    "tarifaAplicada" DECIMAL(10,2) NOT NULL,
    "importe" DECIMAL(10,2),
    "nota" TEXT,
    "estadoCobro" "EstadoCobro" NOT NULL DEFAULT 'PENDIENTE',
    "origen" "OrigenRegistroTiempo" NOT NULL DEFAULT 'CRONOMETRO',
    "editadoManualmente" BOOLEAN NOT NULL DEFAULT false,
    "motivoEdicion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroTiempo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TareaPendiente" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "clienteId" TEXT,
    "usuarioAsignadoId" TEXT NOT NULL,
    "urgencia" "Urgencia" NOT NULL DEFAULT 'MEDIA',
    "fechaLimite" TIMESTAMP(3),
    "estado" "EstadoTarea" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TareaPendiente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedimientoTributario" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipoProcedimiento" TEXT NOT NULL,
    "organismo" TEXT NOT NULL,
    "estado" "EstadoProcedimiento" NOT NULL DEFAULT 'ABIERTO',
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedimientoTributario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedimientoPlazo" (
    "id" TEXT NOT NULL,
    "procedimientoId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaLimite" TIMESTAMP(3) NOT NULL,
    "avisoDiasAntes" INTEGER NOT NULL DEFAULT 15,
    "cumplido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProcedimientoPlazo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaCliente_nombre_key" ON "CategoriaCliente"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaTrabajo_nombre_key" ON "CategoriaTrabajo"("nombre");

-- CreateIndex
CREATE INDEX "RegistroTiempo_trabajoId_idx" ON "RegistroTiempo"("trabajoId");

-- CreateIndex
CREATE INDEX "RegistroTiempo_usuarioId_idx" ON "RegistroTiempo"("usuarioId");

-- CreateIndex
CREATE INDEX "RegistroTiempo_estadoCobro_idx" ON "RegistroTiempo"("estadoCobro");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaCliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Familiar" ADD CONSTRAINT "Familiar_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajo" ADD CONSTRAINT "Trabajo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajo" ADD CONSTRAINT "Trabajo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajo" ADD CONSTRAINT "Trabajo_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrabajoAsignacion" ADD CONSTRAINT "TrabajoAsignacion_trabajoId_fkey" FOREIGN KEY ("trabajoId") REFERENCES "Trabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrabajoAsignacion" ADD CONSTRAINT "TrabajoAsignacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_trabajoId_fkey" FOREIGN KEY ("trabajoId") REFERENCES "Trabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroTiempo" ADD CONSTRAINT "RegistroTiempo_trabajoId_fkey" FOREIGN KEY ("trabajoId") REFERENCES "Trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroTiempo" ADD CONSTRAINT "RegistroTiempo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaPendiente" ADD CONSTRAINT "TareaPendiente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaPendiente" ADD CONSTRAINT "TareaPendiente_usuarioAsignadoId_fkey" FOREIGN KEY ("usuarioAsignadoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedimientoTributario" ADD CONSTRAINT "ProcedimientoTributario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedimientoPlazo" ADD CONSTRAINT "ProcedimientoPlazo_procedimientoId_fkey" FOREIGN KEY ("procedimientoId") REFERENCES "ProcedimientoTributario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
