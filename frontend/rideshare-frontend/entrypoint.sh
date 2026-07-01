#!/bin/sh
set -e

: "${API_BASE_URL:=http://localhost:8000}"
: "${PORT:=8080}"

cat > /usr/share/nginx/html/runtime-env.js <<EOF
window.__API_BASE_URL__ = "${API_BASE_URL}";
EOF

envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
