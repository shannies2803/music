#!/bin/sh
# Test supabase/schema.sql in a throwaway Postgres (needs Postgres 15+ server binaries).
#   sh theory-room/build/test_db.sh
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
BIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)
[ -x "$BIN/initdb" ] || { echo "Postgres server not found"; exit 1; }
TMP=$(mktemp -d); chmod 777 "$TMP"
RUN="sh -c"; [ "$(id -u)" = 0 ] && RUN="su -s /bin/sh nobody -c"
$RUN "$BIN/initdb -D $TMP/db -A trust -U postgres >/dev/null"
$RUN "$BIN/pg_ctl -D $TMP/db -o '-k $TMP -p 55432 -c listen_addresses=' -l $TMP/log start >/dev/null"
trap "$RUN \"$BIN/pg_ctl -D $TMP/db stop -m fast >/dev/null\"; rm -rf $TMP" EXIT
sleep 1
cd "$HERE" && psql -h "$TMP" -p 55432 -U postgres -q -v ON_ERROR_STOP=1 -f test_db.sql postgres
