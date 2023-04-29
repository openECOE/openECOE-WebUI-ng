#!/bin/bash

set -eux

# Valores predeterminados
REPO="openecoe/webui"
RELEASE="$(date '+%Y-%m-%d')"
ADDITIONAL_TAGS=()

# Analizar las opciones y argumentos con nombre
while getopts "r:R:t:" opt; do
  case $opt in
    r)
      REPO="$OPTARG"
      ;;
    R)
      RELEASE="$OPTARG"
      ;;
    t)
      ADDITIONAL_TAGS+=("$OPTARG")
      ;;
    *)
      echo "Uso: $0 [-r repo] [-R release] [-t additional_tag]..."
      exit 1
      ;;
  esac
done

# Construir la imagen de Docker
docker build -t "$REPO:$RELEASE" .

# Etiquetar la imagen de Docker
for tag in "${ADDITIONAL_TAGS[@]}"; do
  docker tag "$REPO:$RELEASE" "$REPO:$tag"
done

