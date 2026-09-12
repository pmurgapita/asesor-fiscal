#!/usr/bin/env bash
#
# Restaura una copia de seguridad generada por scripts/backup.sh.
#
# Uso:
#   scripts/restore.sh backups/asesor-fiscal-20260101-120000.sql.gz
#
# ATENCIÓN: esto SOBRESCRIBE los datos actuales de la base de datos a la
# que apunta DATABASE_URL. Úsalo solo cuando realmente quieras reemplazar
# los datos (por ejemplo, para recuperar tras un problema, o para preparar
# un entorno de pruebas con datos reales de otra copia).

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

# psql no entiende el parámetro "?schema=..." que usa Prisma en la URL.
URL_BD="${DATABASE_URL%%\?*}"

ARCHIVO="${1:-}"
if [ -z "$ARCHIVO" ]; then
  echo "Uso: scripts/restore.sh <archivo-de-copia>" >&2
  exit 1
fi
if [ ! -f "$ARCHIVO" ]; then
  echo "Error: no existe el archivo '$ARCHIVO'." >&2
  exit 1
fi

DESTINO_VISIBLE="$(echo "$URL_BD" | sed -E 's#(://[^:]+):[^@]*@#\1:****@#')"

echo "Vas a SOBRESCRIBIR la base de datos de destino con el contenido de:"
echo "  Archivo:  $ARCHIVO"
echo "  Destino:  $DESTINO_VISIBLE"
read -r -p "Escribe 'restaurar' para confirmar: " CONFIRMACION
if [ "$CONFIRMACION" != "restaurar" ]; then
  echo "Cancelado."
  exit 1
fi

TMP_SQL="$(mktemp)"
trap 'rm -f "$TMP_SQL"' EXIT

case "$ARCHIVO" in
  *.gpg)
    echo "Descifrando..."
    if [ -z "${BACKUP_ENCRYPTION_PASSPHRASE:-}" ]; then
      echo "Error: el archivo está cifrado pero no hay BACKUP_ENCRYPTION_PASSPHRASE." >&2
      exit 1
    fi
    gpg --batch --yes --passphrase "$BACKUP_ENCRYPTION_PASSPHRASE" --decrypt "$ARCHIVO" | gunzip > "$TMP_SQL"
    ;;
  *.gz)
    gunzip -c "$ARCHIVO" > "$TMP_SQL"
    ;;
  *)
    cp "$ARCHIVO" "$TMP_SQL"
    ;;
esac

echo "Restaurando..."
psql "$URL_BD" -v ON_ERROR_STOP=1 -f "$TMP_SQL"

echo "Restauración terminada."
