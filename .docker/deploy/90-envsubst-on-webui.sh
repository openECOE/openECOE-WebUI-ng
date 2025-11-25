#!/bin/sh

# Guardar como LF en vez de CRLF

set -e

ME=$(basename $0)

entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

auto_envsubst() {
  entrypoint_log "$ME: Running envsubst on env.template.js to env.js"
  envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js
}

auto_envsubst

exit 0