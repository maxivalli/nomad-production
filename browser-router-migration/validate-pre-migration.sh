#!/bin/bash

# =========================================================================
# Script de Validación Pre-Migración
# =========================================================================
# Verifica que el proyecto esté listo para la migración a BrowserRouter
# =========================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Contador de errores y warnings
ERRORS=0
WARNINGS=0

print_header "VALIDACIÓN PRE-MIGRACIÓN A BROWSER ROUTER"

# 1. Verificar que existe el directorio del proyecto
echo "1. Verificando estructura del proyecto..."
if [ -d "$PROJECT_DIR/client" ]; then
    print_success "Directorio client/ encontrado"
else
    print_error "Directorio client/ NO encontrado"
    ERRORS=$((ERRORS + 1))
fi

# 2. Verificar archivos clave
echo -e "\n2. Verificando archivos necesarios..."

required_files=(
    "client/src/main.jsx"
    "client/src/App.jsx"
    "client/src/components/ProductModal.jsx"
    "client/public/_redirects"
)

for file in "${required_files[@]}"; do
    if [ -f "$PROJECT_DIR/$file" ]; then
        print_success "Encontrado: $file"
    else
        print_error "NO encontrado: $file"
        ERRORS=$((ERRORS + 1))
    fi
done

# 3. Verificar que actualmente usa HashRouter
echo -e "\n3. Verificando configuración actual..."

if grep -q "HashRouter" "$PROJECT_DIR/client/src/main.jsx"; then
    print_success "HashRouter detectado (correcto para migración)"
else
    print_warning "HashRouter NO detectado - es posible que ya uses BrowserRouter"
    WARNINGS=$((WARNINGS + 1))
fi

# 4. Verificar dependencias de React Router
echo -e "\n4. Verificando dependencias..."

if [ -f "$PROJECT_DIR/client/package.json" ]; then
    if grep -q "react-router-dom" "$PROJECT_DIR/client/package.json"; then
        print_success "react-router-dom instalado"
        
        # Obtener versión
        version=$(grep "react-router-dom" "$PROJECT_DIR/client/package.json" | head -1 | grep -o '"[0-9]*\.[0-9]*\.[0-9]*"' | tr -d '"')
        print_info "Versión detectada: $version"
        
        # Verificar que sea v6+
        major_version=$(echo $version | cut -d. -f1)
        if [ "$major_version" -ge 6 ]; then
            print_success "Versión compatible (v6+)"
        else
            print_warning "Versión antigua detectada. Se recomienda actualizar a v6+"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        print_error "react-router-dom NO encontrado en package.json"
        ERRORS=$((ERRORS + 1))
    fi
else
    print_error "package.json NO encontrado"
    ERRORS=$((ERRORS + 1))
fi

# 5. Verificar que node_modules existe
echo -e "\n5. Verificando instalación..."

if [ -d "$PROJECT_DIR/client/node_modules" ]; then
    print_success "node_modules/ encontrado"
else
    print_warning "node_modules/ NO encontrado - ejecuta 'npm install' antes de migrar"
    WARNINGS=$((WARNINGS + 1))
fi

# 6. Verificar Git (para backup adicional)
echo -e "\n6. Verificando control de versiones..."

if [ -d "$PROJECT_DIR/.git" ]; then
    print_success "Repositorio Git detectado"
    
    # Verificar si hay cambios sin commit
    cd "$PROJECT_DIR"
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        print_warning "Hay cambios sin commit en Git"
        print_info "Se recomienda hacer commit antes de migrar"
        WARNINGS=$((WARNINGS + 1))
    else
        print_success "No hay cambios pendientes en Git"
    fi
else
    print_warning "No se detectó Git - se recomienda usar control de versiones"
    WARNINGS=$((WARNINGS + 1))
fi

# 7. Verificar el servidor backend
echo -e "\n7. Verificando configuración del servidor..."

if [ -f "$PROJECT_DIR/server/index.js" ]; then
    print_success "Servidor backend detectado"
    
    # Verificar que maneja la ruta de compartir
    if grep -q "shareProduct\|share" "$PROJECT_DIR/server/index.js"; then
        print_success "Ruta de compartir configurada en el servidor"
    else
        print_warning "No se detectó manejo de ruta /share/ en el servidor"
        print_info "Verifica que el servidor maneje correctamente /share/:slug"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    print_warning "Servidor backend NO detectado en la ubicación esperada"
    WARNINGS=$((WARNINGS + 1))
fi

# 8. Verificar espacio en disco
echo -e "\n8. Verificando espacio en disco..."

available_space=$(df -h "$PROJECT_DIR" | awk 'NR==2 {print $4}')
print_info "Espacio disponible: $available_space"

if df "$PROJECT_DIR" | awk 'NR==2 {exit ($4 < 100000)}'; then
    print_success "Espacio en disco suficiente"
else
    print_warning "Poco espacio en disco disponible"
    WARNINGS=$((WARNINGS + 1))
fi

# Resumen final
print_header "RESUMEN DE VALIDACIÓN"

echo -e "${BLUE}Total de comprobaciones:${NC}"
echo -e "  ${GREEN}✓ Exitosas: $((18 - ERRORS - WARNINGS))${NC}"
echo -e "  ${YELLOW}⚠ Advertencias: $WARNINGS${NC}"
echo -e "  ${RED}✗ Errores: $ERRORS${NC}"

echo ""

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        print_success "¡Todo listo para la migración!"
        echo ""
        print_info "Ejecuta el siguiente comando para iniciar la migración:"
        echo -e "  ${GREEN}./migrate-to-browser-router.sh${NC}"
    else
        print_warning "El proyecto está listo, pero hay algunas advertencias"
        echo ""
        print_info "Puedes continuar con la migración, pero revisa las advertencias primero"
        echo -e "  ${GREEN}./migrate-to-browser-router.sh${NC}"
    fi
else
    print_error "Hay errores que deben resolverse antes de migrar"
    echo ""
    print_info "Resuelve los errores indicados arriba y vuelve a ejecutar esta validación"
fi

echo ""

exit $ERRORS
