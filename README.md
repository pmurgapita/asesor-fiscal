# Gestión del despacho

Aplicación interna de gestión para un despacho de asesoría fiscal. Ver
`REQUISITOS.md` para la especificación funcional completa.

## Cómo arrancarla en local

1. Necesitas Node.js 20+ y PostgreSQL en marcha.
2. Copia `.env.example` a `.env` y rellena `DATABASE_URL` (con una base de
   datos PostgreSQL vacía ya creada) y `SESSION_SECRET` (una cadena
   aleatoria larga, por ejemplo con `openssl rand -hex 32`).
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Crea las tablas en la base de datos:
   ```bash
   npx prisma migrate dev
   ```
5. Carga los datos de prueba ficticios (clientes, trabajadores, trabajos):
   ```bash
   npm run db:seed
   ```
6. Arranca la aplicación:
   ```bash
   npm run dev
   ```
7. Abre [http://localhost:3000](http://localhost:3000). Usuarios de prueba
   (contraseña `cambiar123` para todos):
   - `admin@despacho.test` (administrador)
   - `maria@despacho.test` (trabajadora)
   - `javier@despacho.test` (trabajador)

## Estado actual

Completado hasta la Fase 3:

- **Flujo núcleo**: cliente → trabajo → cronómetro → guardado del tiempo,
  con corrección manual de registros.
- **Ficha completa de cliente**: alta, edición, familiares y empresas
  asociadas.
- **Tareas pendientes**: listado filtrable por prioridad y trabajador,
  cambio rápido de estado, alta y edición.
- **Procedimientos tributarios**: varios plazos/hitos por procedimiento,
  con aviso visual cuando se acerca o vence un plazo.
- **Trabajos y gastos**: alta/edición de trabajos con categoría y
  trabajadores asignados, gastos/suplidos por trabajo, y listado global
  filtrable por cliente/estado/trabajador.

Pendiente (fuera del alcance original, anotado durante el desarrollo):
"igualas" (clientes con cuota fija mensual), tareas recurrentes internas
del despacho, y presupuestos a clientes. Tampoco se ha implementado
todavía: exportación a Excel/CSV, ni los campos de Prevención de Blanqueo
de Capitales (el modelo ya está preparado para añadirlos sin romper nada).
