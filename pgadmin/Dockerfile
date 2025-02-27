FROM dpage/pgadmin4

USER root
RUN apk update && apk add gettext && rm -rf /var/lib/apt/lists/*

#ENV PGADMIN_DEFAULT_EMAIL=${PGADMIN_DEFAULT_EMAIL:-pgadmin4@pgadmin.org}
#ENV PGADMIN_DEFAULT_PASSWORD=${PGADMIN_DEFAULT_PASSWORD:-postgres}
#ENV PGADMIN_CONFIG_SERVER_MODE=False
#ENV PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED=False

COPY pgpass /.pgpass
COPY servers.json /pgadmin4/servers.json
COPY entrypoint.sh /pgadmin4/entrypoint.sh

RUN chmod 600 /.pgpass && chmod +x /pgadmin4/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/pgadmin4/entrypoint.sh"]
