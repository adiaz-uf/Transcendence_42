#!/bin/sh

until nc -z db 5432; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 1
done

echo "PostgreSQL is ready, running migrations..."
python manage.py makemigrations api
python manage.py migrate --noinput || { echo "Migration failed"; exit 1; }

exec daphne -b 0.0.0.0 -p ${BACKEND_PORT} backend.asgi:application
