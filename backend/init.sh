#!/bin/sh
python manage.py migrate
exec daphne -b 0.0.0.0 -p ${BACKEND_PORT} backend.asgi:application
