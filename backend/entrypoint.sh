#!/bin/sh
set -e

python manage.py migrate --noinput
exec gunicorn rideshare_backend.wsgi:application --bind 0.0.0.0:8080
