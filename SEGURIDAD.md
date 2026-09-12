# Seguridad, privacidad y copias de seguridad

Este documento resume cómo protege esta aplicación los datos del despacho y
de sus clientes, y qué debe hacer quien la administre para mantenerla
segura. Está pensado para acompañar al `REQUISITOS.md` original, en el
apartado de "Requisitos no funcionales".

## 1. Control de acceso

- Cada trabajador tiene su propio usuario y contraseña. Las contraseñas
  nunca se guardan en texto plano: se almacenan cifradas con `bcrypt`
  (una función pensada para contraseñas, resistente a ataques de fuerza
  bruta).
- Hay dos roles: **administrador** (ve y gestiona todo, incluida el alta de
  usuarios) y **trabajador** (usa la aplicación día a día: clientes,
  trabajos, tareas, procedimientos). La gestión de usuarios
  (`/usuarios`) solo es accesible para administradores.
- La sesión se guarda en una cookie firmada y cifrada (`iron-session`), que
  el navegador no puede leer ni modificar. Al cerrar sesión, o si el
  usuario se desactiva, deja de funcionar inmediatamente.
- Un administrador puede desactivar el acceso de un trabajador en cualquier
  momento desde `/usuarios`, sin necesidad de borrar sus datos ni su
  historial (los registros de tiempo, tareas, etc. de ese trabajador se
  conservan).

**Pendiente / a valorar más adelante:** un límite de intentos de inicio de
sesión (para dificultar ataques por fuerza bruta) y un cambio de contraseña
obligatorio en el primer inicio de sesión. No se ha implementado porque
para un despacho pequeño en una red de confianza el riesgo es bajo, pero es
sencillo añadirlo si se necesita.

## 2. Cifrado en tránsito

- **Obligatorio en producción:** la aplicación debe servirse siempre por
  HTTPS (nunca HTTP sin cifrar), para que las contraseñas y los datos de
  clientes no viajen en claro por la red. La mayoría de plataformas de
  despliegue (Vercel, Render, Railway, un servidor con Caddy o Nginx +
  Let's Encrypt…) dan esto de forma automática o con una configuración
  mínima.
- Las cookies de sesión llevan el atributo `Secure` en producción (el
  navegador no las envía nunca por HTTP sin cifrar) y `HttpOnly` (no son
  accesibles desde JavaScript, lo que dificulta robarlas mediante ataques
  de tipo XSS).
- La conexión de la aplicación a la base de datos también debe ir cifrada
  en producción: si el proveedor de PostgreSQL lo soporta (la mayoría de
  proveedores gestionados sí), añade `?sslmode=require` al final de
  `DATABASE_URL`.

## 3. Cifrado en reposo

- **Base de datos:** si usas un PostgreSQL gestionado (Neon, Supabase,
  Railway, RDS, Cloud SQL…), el cifrado del disco donde se guardan los
  datos ya viene activado por el proveedor. Si el despacho monta su propio
  servidor, se recomienda cifrar el disco del servidor (por ejemplo con
  LUKS en Linux).
- **Copias de seguridad:** el script `scripts/backup.sh` puede cifrar cada
  copia con una contraseña (variable `BACKUP_ENCRYPTION_PASSPHRASE`, ver
  more abajo). Si esa variable no está definida, la copia se genera *sin
  cifrar* y el script lo avisa por pantalla — no lo dejes así en
  producción.

## 4. Copias de seguridad periódicas

Dos scripts, en `scripts/`:

- **`scripts/backup.sh`** — genera una copia comprimida (y cifrada, si has
  configurado `BACKUP_ENCRYPTION_PASSPHRASE`) en la carpeta `backups/`
  (que nunca se sube al repositorio). Borra automáticamente las copias de
  más de 30 días (configurable con `BACKUP_RETENTION_DIAS`).
- **`scripts/restore.sh <archivo>`** — restaura una copia. Pide
  confirmación explícita porque sobrescribe la base de datos de destino, y
  muestra a qué base de datos vas a restaurar antes de pedirla.

También disponibles como `npm run db:backup` y `npm run db:restore`.

**Cómo programarlo automáticamente** (por ejemplo, cada noche a las 3:00,
en el servidor donde corre la aplicación):

```bash
crontab -e
# añadir esta línea:
0 3 * * * cd /ruta/a/asesor-fiscal && BACKUP_ENCRYPTION_PASSPHRASE="..." ./scripts/backup.sh >> /var/log/asesor-fiscal-backup.log 2>&1
```

Recomendaciones:

- Guarda la frase de cifrado (`BACKUP_ENCRYPTION_PASSPHRASE`) en un sitio
  distinto de donde se guardan las copias (por ejemplo, en un gestor de
  contraseñas del despacho) — si se pierde, las copias cifradas no se
  pueden recuperar.
- Copia de vez en cuando la carpeta `backups/` fuera del propio servidor
  (a otro disco, a un almacenamiento en la nube del despacho, etc.). Una
  copia de seguridad que vive solo en el mismo servidor no protege frente
  a un fallo de ese servidor.
- Prueba la restauración de vez en cuando (por ejemplo, cada varios meses)
  contra una base de datos de prueba, para comprobar que las copias
  realmente sirven.

## 5. RGPD y secreto profesional

La aplicación trata datos personales de los clientes del despacho (DNI,
estado civil, hijos, datos económicos…), sujetos al RGPD y al secreto
profesional del asesor. Medidas ya aplicadas:

- Acceso solo mediante usuario y contraseña (ver punto 1).
- Minimización: solo se piden los campos indicados en `REQUISITOS.md`; los
  campos de Prevención de Blanqueo de Capitales están reservados en el
  modelo de datos pero no se piden ni se muestran todavía.
- Los datos de prueba usados durante el desarrollo son siempre ficticios
  (nunca se ha usado un dato real de un cliente).
- Exportación a CSV disponible como red de seguridad durante la migración
  desde Excel (ver `README.md`), útil también para ejercer el derecho de
  portabilidad si un cliente lo solicitara.

Pendiente de valorar por el despacho (son decisiones de organización, no
solo técnicas):

- Un registro de actividades de tratamiento (obligatorio bajo RGPD para la
  mayoría de despachos).
- Una política de cuánto tiempo se conservan los datos de un cliente tras
  dejar de serlo, y un proceso para purgarlos cuando corresponda.
- Si se contrata un hosting externo (nube), firmar con el proveedor un
  contrato de encargado de tratamiento (la mayoría de proveedores serios
  ya lo ofrecen).

## 6. Buenas prácticas para quien administre el servidor

- Nunca subas el archivo `.env` (contiene la contraseña de la base de
  datos y la clave de sesión) ni la carpeta `backups/` a git — ambos ya
  están en `.gitignore`.
- Actualiza las dependencias del proyecto de vez en cuando
  (`npm outdated`, `npm audit`) para recibir parches de seguridad.
- Si sospechas que una contraseña de usuario se ha visto comprometida,
  desactiva ese usuario desde `/usuarios` y crea uno nuevo.
