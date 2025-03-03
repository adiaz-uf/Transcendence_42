#!/bin/sh

envsubst < /.pgpass > /tmp/.pgpass && mv /tmp/.pgpass /.pgpass

cp /.pgpass /var/lib/pgadmin/.pgpass

chmod 600 /var/lib/pgadmin/.pgpass

envsubst < /pgadmin4/servers.json > /tmp/servers.json && mv /tmp/servers.json /pgadmin4/servers.json

exec /entrypoint.sh "$@"
