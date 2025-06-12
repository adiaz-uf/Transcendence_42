FROM dpage/pgadmin4:latest

USER root

RUN apk update && apk add gettext && rm -rf /var/lib/apt/lists/*

COPY pgpass /.pgpass

COPY servers.json /pgadmin4/servers.json

COPY entrypoint-custom.sh /pgadmin4/entrypoint-custom.sh

RUN chmod 600 /.pgpass && chmod +x /pgadmin4/entrypoint-custom.sh

EXPOSE 80

ENTRYPOINT ["/pgadmin4/entrypoint-custom.sh"]
