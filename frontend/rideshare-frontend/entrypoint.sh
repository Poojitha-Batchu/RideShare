#!/bin/sh
set -e

: "${API_BASE_URL:=http://localhost:8000}"
cat > /usr/share/nginx/html/runtime-env.js <<EOF
window.__API_BASE_URL__ = "${API_BASE_URL}";
EOF

exec nginx -g 'daemon off;'
