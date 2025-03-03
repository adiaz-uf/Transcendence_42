FROM dpage/pgadmin4

USER root

RUN apk update && apk add gettext && rm -rf /var/lib/apt/lists/*

COPY pgpass /.pgpass

COPY servers.json /pgadmin4/servers.json

COPY entrypoint.sh /pgadmin4/entrypoint.sh

RUN chmod 600 /.pgpass && chmod +x /pgadmin4/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/pgadmin4/entrypoint.sh"]
