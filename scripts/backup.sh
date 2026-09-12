#!/usr/bin/env bash
#
# Copia de seguridad de la base de datos.
#
# Uso:
#   scripts/backup.sh
#
# Lee DATABASE_URL del archivo .env (o de las variables de entorno si ya
# están puestas). Si además defines BACKUP_ENCRYPTION_PASSPHRASE, la copia
# se cifra con esa frase de paso (recomendado si la copia sale del servidor,
# por ejemplo a otro disco o a la nube).
#
# Guarda las copias en ./backups y borra automáticamente las que tengan más
# de BACKUP_RETENTION_DIAS días (30 por defecto).

set -euo pipefail

DIR_RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR_RAIZ"

if [ -z "${DATABASE_URL:-}" ] && [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: no se ha encontrado DATABASE_URL (ni en .env ni en el entorno)." >&2
  exit 1
fi

# pg_dump no entiende el parámetro "?schema=..." que usa Prisma en la URL.
URL_BD="${DATABASE_URL%%\?*}"

DIR_BACKUPS="$DIR_RAIZ/backups"
mkdir -p "$DIR_BACKUPS"

FECHA="$(date -u +%Y%m%d-%H%M%S)"
ARCHIVO_SQL="$DIR_BACKUPS/asesor-fiscal-$FECHA.sql.gz"

echo "Generando copia de seguridad en $ARCHIVO_SQL ..."
pg_dump "$URL_BD" --no-owner --no-privileges | gzip > "$ARCHIVO_SQL"

if [ -n "${BACKUP_ENCRYPTION_PASSPHRASE:-}" ]; then
  echo "Cifrando la copia..."
  gpg --batch --yes --passphrase "$BACKUP_ENCRYPTION_PASSPHRASE" --symmetric --cipher-algo AES256 \
    --output "$ARCHIVO_SQL.gpg" "$ARCHIVO_SQL"
  rm "$ARCHIVO_SQL"
  ARCHIVO_SQL="$ARCHIVO_SQL.gpg"
  echo "Copia cifrada: $ARCHIVO_SQL"
else
  echo "Aviso: BACKUP_ENCRYPTION_PASSPHRASE no está definida, la copia NO se ha cifrado." >&2
  echo "Copia sin cifrar: $ARCHIVO_SQL"
fi

RETENCION_DIAS="${BACKUP_RETENTION_DIAS:-30}"
echo "Borrando copias de más de $RETENCION_DIAS días..."
find "$DIR_BACKUPS" -name 'asesor-fiscal-*.sql.gz*' -mtime "+$RETENCION_DIAS" -delete

echo "Copia de seguridad terminada."
