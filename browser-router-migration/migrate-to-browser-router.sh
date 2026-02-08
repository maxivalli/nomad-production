#!/bin/bash

# =========================================================================
# Script de Migración: Hash Router → Browser Router
# =========================================================================
# Este script migra el proyecto de HashRouter a BrowserRouter
# Incluye sistema de backup automático y rollback completo
# =========================================================================

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups/browser-router-migration-$(date +%Y%m%d_%H%M%S)"
MIGRATION_FILES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/migration-files" && pwd)"

# Archivos a modificar
FILES_TO_MIGRATE=(
    "client/src/main.jsx"
    "client/src/App.jsx"
    "client/src/components/ProductModal.jsx"
    "client/public/_redirects"
)

# =========================================================================
# FUNCIONES AUXILIARES
# =========================================================================

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

# =========================================================================
# FUNCIÓN: CREAR BACKUP
# =========================================================================

create_backup() {
    print_header "CREANDO BACKUP DE ARCHIVOS ORIGINALES"
    
    mkdir -p "$BACKUP_DIR"
    
    for file in "${FILES_TO_MIGRATE[@]}"; do
        local source_file="$PROJECT_DIR/$file"
        local backup_file="$BACKUP_DIR/$file"
        
        if [ -f "$source_file" ]; then
            mkdir -p "$(dirname "$backup_file")"
            cp "$source_file" "$backup_file"
            print_success "Backup creado: $file"
        else
            print_warning "Archivo no encontrado (se omite): $file"
        fi
    done
    
    # Guardar información de la migración
    cat > "$BACKUP_DIR/migration_info.txt" << EOF
===========================================
MIGRACIÓN: Hash Router → Browser Router
===========================================
Fecha: $(date)
Directorio del proyecto: $PROJECT_DIR
Archivos respaldados: ${#FILES_TO_MIGRATE[@]}

Archivos modificados:
$(printf '%s\n' "${FILES_TO_MIGRATE[@]}")

Para revertir los cambios, ejecuta:
./migrate-to-browser-router.sh rollback $BACKUP_DIR
===========================================
EOF
    
    print_success "Backup completo guardado en: $BACKUP_DIR"
    print_info "Puedes revertir los cambios ejecutando: ./migrate-to-browser-router.sh rollback $BACKUP_DIR"
}

# =========================================================================
# FUNCIÓN: APLICAR MIGRACIÓN
# =========================================================================

apply_migration() {
    print_header "APLICANDO MIGRACIÓN A BROWSER ROUTER"
    
    for file in "${FILES_TO_MIGRATE[@]}"; do
        local source_file="$MIGRATION_FILES_DIR/$file"
        local target_file="$PROJECT_DIR/$file"
        
        if [ -f "$source_file" ]; then
            mkdir -p "$(dirname "$target_file")"
            cp "$source_file" "$target_file"
            print_success "Migrado: $file"
        else
            print_error "Archivo de migración no encontrado: $file"
            return 1
        fi
    done
    
    print_success "Todos los archivos han sido migrados correctamente"
}

# =========================================================================
# FUNCIÓN: VERIFICAR MIGRACIÓN
# =========================================================================

verify_migration() {
    print_header "VERIFICANDO MIGRACIÓN"
    
    local errors=0
    
    # Verificar que BrowserRouter esté presente en main.jsx
    if grep -q "BrowserRouter" "$PROJECT_DIR/client/src/main.jsx"; then
        print_success "BrowserRouter detectado en main.jsx"
    else
        print_error "BrowserRouter NO encontrado en main.jsx"
        errors=$((errors + 1))
    fi
    
    # Verificar que HashRouter no esté presente
    if ! grep -q "HashRouter" "$PROJECT_DIR/client/src/main.jsx"; then
        print_success "HashRouter removido correctamente"
    else
        print_warning "HashRouter todavía presente en el código"
    fi
    
    # Verificar que la ruta /share/:slug esté definida
    if grep -q "/share/:slug" "$PROJECT_DIR/client/src/main.jsx"; then
        print_success "Ruta /share/:slug configurada"
    else
        print_error "Ruta /share/:slug NO configurada"
        errors=$((errors + 1))
    fi
    
    if [ $errors -eq 0 ]; then
        print_success "Verificación completada sin errores"
        return 0
    else
        print_error "Verificación completada con $errors errores"
        return 1
    fi
}

# =========================================================================
# FUNCIÓN: ROLLBACK
# =========================================================================

rollback() {
    local backup_path="$1"
    
    if [ -z "$backup_path" ]; then
        print_error "Debes especificar la ruta del backup"
        print_info "Uso: ./migrate-to-browser-router.sh rollback <ruta_del_backup>"
        exit 1
    fi
    
    if [ ! -d "$backup_path" ]; then
        print_error "El directorio de backup no existe: $backup_path"
        exit 1
    fi
    
    print_header "REVIRTIENDO MIGRACIÓN"
    print_warning "Restaurando archivos desde: $backup_path"
    
    for file in "${FILES_TO_MIGRATE[@]}"; do
        local backup_file="$backup_path/$file"
        local target_file="$PROJECT_DIR/$file"
        
        if [ -f "$backup_file" ]; then
            cp "$backup_file" "$target_file"
            print_success "Restaurado: $file"
        else
            print_warning "Backup no encontrado para: $file"
        fi
    done
    
    print_success "Rollback completado"
    print_info "Los archivos han sido restaurados a su estado anterior"
}

# =========================================================================
# FUNCIÓN: LISTAR BACKUPS
# =========================================================================

list_backups() {
    print_header "BACKUPS DISPONIBLES"
    
    local backups_dir="$PROJECT_DIR/backups"
    
    if [ ! -d "$backups_dir" ]; then
        print_warning "No hay backups disponibles"
        return
    fi
    
    local count=0
    for backup in "$backups_dir"/browser-router-migration-*; do
        if [ -d "$backup" ]; then
            count=$((count + 1))
            echo -e "${GREEN}$count.${NC} $(basename "$backup")"
            if [ -f "$backup/migration_info.txt" ]; then
                echo "   Fecha: $(grep "Fecha:" "$backup/migration_info.txt" | cut -d: -f2-)"
            fi
        fi
    done
    
    if [ $count -eq 0 ]; then
        print_warning "No hay backups disponibles"
    else
        print_info "Total de backups: $count"
    fi
}

# =========================================================================
# FUNCIÓN: POST-MIGRACIÓN
# =========================================================================

post_migration_steps() {
    print_header "PASOS POST-MIGRACIÓN"
    
    echo -e "${YELLOW}⚠ IMPORTANTE - Próximos pasos:${NC}\n"
    
    echo "1. Verifica que tu servidor esté configurado correctamente:"
    echo "   - Para Netlify: El archivo _redirects ha sido actualizado"
    echo "   - Para otros hosts: Configura para que todas las rutas apunten a index.html"
    echo ""
    echo "2. Si usas Vercel, crea un archivo vercel.json con:"
    echo "   {"
    echo "     \"rewrites\": ["
    echo "       { \"source\": \"/(.*)\", \"destination\": \"/\" }"
    echo "     ]"
    echo "   }"
    echo ""
    echo "3. Prueba las siguientes URLs después del deploy:"
    echo "   - ${BLUE}https://tudominio.com/${NC} (home)"
    echo "   - ${BLUE}https://tudominio.com/producto/nombre-producto${NC} (modal de producto)"
    echo "   - ${BLUE}https://tudominio.com/share/nombre-producto${NC} (compartir con meta tags)"
    echo "   - ${BLUE}https://tudominio.com/admin${NC} (panel admin)"
    echo ""
    echo "4. Verifica que los enlaces compartidos funcionen correctamente"
    echo "   - Prueba compartir un producto en WhatsApp/Facebook"
    echo "   - Verifica que se vean las imágenes y meta tags"
    echo ""
    echo "5. Si algo no funciona, ejecuta el rollback:"
    echo "   ${GREEN}./migrate-to-browser-router.sh rollback $BACKUP_DIR${NC}"
    echo ""
}

# =========================================================================
# FUNCIÓN PRINCIPAL
# =========================================================================

main() {
    local command="${1:-migrate}"
    
    case "$command" in
        migrate)
            print_header "INICIANDO MIGRACIÓN A BROWSER ROUTER"
            create_backup
            apply_migration
            if verify_migration; then
                post_migration_steps
                print_success "\n¡Migración completada con éxito!"
            else
                print_error "\nLa migración se completó pero hay advertencias"
                print_info "Revisa los mensajes anteriores"
            fi
            ;;
        
        rollback)
            rollback "$2"
            ;;
        
        list)
            list_backups
            ;;
        
        verify)
            verify_migration
            ;;
        
        help|--help|-h)
            print_header "AYUDA - Script de Migración"
            echo "Uso: ./migrate-to-browser-router.sh [comando] [opciones]"
            echo ""
            echo "Comandos disponibles:"
            echo "  migrate        - Ejecuta la migración completa (por defecto)"
            echo "  rollback <dir> - Revierte la migración usando el backup especificado"
            echo "  list           - Lista todos los backups disponibles"
            echo "  verify         - Verifica que la migración se haya aplicado correctamente"
            echo "  help           - Muestra esta ayuda"
            echo ""
            echo "Ejemplos:"
            echo "  ./migrate-to-browser-router.sh"
            echo "  ./migrate-to-browser-router.sh migrate"
            echo "  ./migrate-to-browser-router.sh rollback ./backups/browser-router-migration-20250208_120000"
            echo "  ./migrate-to-browser-router.sh list"
            ;;
        
        *)
            print_error "Comando desconocido: $command"
            echo "Usa './migrate-to-browser-router.sh help' para ver los comandos disponibles"
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@"
