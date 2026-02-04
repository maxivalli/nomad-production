#!/bin/bash

# Script para generar iconos PWA desde Nomad.png
# Requiere ImageMagick instalado: sudo apt-get install imagemagick

SOURCE_IMAGE="../public/Nomad.png"
OUTPUT_DIR="../public/icons"

# Crear directorio de iconos si no existe
mkdir -p "$OUTPUT_DIR"

# Tamaños de iconos necesarios para PWA
SIZES=(72 96 128 144 152 192 384 512)

echo "Generando iconos PWA desde $SOURCE_IMAGE..."

for size in "${SIZES[@]}"; do
  echo "Creando icono ${size}x${size}..."
  convert "$SOURCE_IMAGE" -resize "${size}x${size}" "$OUTPUT_DIR/icon-${size}x${size}.png"
done

echo "¡Iconos generados exitosamente en $OUTPUT_DIR!"
