# Sistema de Trocería - Cubi

Sistema completo de gestión de trocería desarrollado con Next.js 13, Tailwind CSS y Supabase.

## Características Implementadas

### Dashboard Principal
- Métricas en tiempo real (Volumen ingresado, Volumen producido, Total de trozas, Rendimiento general)
- Gráfico de producción diaria
- Resumen general con indicador de rendimiento
- Tabla de entradas recientes

### Historial de Trocería
- Listado completo de entradas de trocería
- Visualización de detalles por entrada seleccionada
- Información de volumen final y total de trozas

### Entrada de Trocería
- Formulario de captura de datos (fecha, turno, aserradero)
- Tabla dinámica de trozas con cálculo automático de volumen
- Campos: Origen, Diámetro 1, Diámetro 2, Largo, Clase, Descuento %
- Cálculo automático de volumen usando fórmula cilíndrica
- Agregar/eliminar trozas dinámicamente
- Finalizar o descartar entrada

### Base de Datos
- Tabla `entradas_troceria`: Registro de entradas con folio, fecha, turno, aserradero
- Tabla `trozas`: Detalle de cada troza con dimensiones y volumen calculado
- Tabla `produccion_diaria`: Registro diario de volúmenes de ingreso y producción
- Row Level Security (RLS) implementado en todas las tablas

## Configuración

### 1. Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

### 2. Configurar Supabase

El proyecto ya tiene una base de datos Supabase configurada con las siguientes tablas:
- `entradas_troceria`
- `trozas`
- `produccion_diaria`

Para conectar tu proyecto:

1. Crea o accede a tu proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > API
3. Copia tu `Project URL` y `anon public` key

### 3. Configurar Variables de Entorno

Edita el archivo `.env.local` con tus credenciales de Supabase:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
\`\`\`

### 4. Ejecutar el Proyecto

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

\`\`\`
/
├── app/                          # Páginas de Next.js 13 (App Router)
│   ├── page.tsx                 # Dashboard principal
│   ├── troceria/
│   │   ├── page.tsx            # Historial de trocería
│   │   └── nueva/
│   │       └── page.tsx        # Formulario de nueva entrada
│   ├── produccion/page.tsx     # Módulo de producción (placeholder)
│   ├── ventas/page.tsx         # Módulo de ventas (placeholder)
│   ├── reportes/page.tsx       # Módulo de reportes (placeholder)
│   └── configuracion/page.tsx  # Módulo de configuración (placeholder)
├── components/
│   ├── Sidebar.tsx             # Sidebar de navegación
│   └── Header.tsx              # Header con título y avatar
├── lib/
│   └── supabase.ts             # Cliente de Supabase y tipos
└── public/                      # Imágenes estáticas
\`\`\`

## Diseño

El diseño está basado en los mockups proporcionados:
- **Colores**: Verde oscuro (#1a3a35) para sidebar, azul para acciones primarias
- **Tipografía**: Inter (Google Fonts)
- **Componentes**: shadcn/ui
- **Iconos**: Lucide React

## Funcionalidades Técnicas

### Cálculo de Volumen
El sistema calcula automáticamente el volumen de cada troza usando la fórmula:

\`\`\`
V = π × r² × L
\`\`\`

Donde:
- r = (diámetro_1 + diámetro_2) / 4 (radio promedio en metros)
- L = largo en metros
- El volumen final considera el descuento porcentual aplicado

### Navegación
- Sidebar fijo con enlaces a todas las secciones
- Indicador visual de página activa
- Responsive design

### Integración con Supabase
- Cliente Supabase configurado con tipos TypeScript
- Queries optimizadas con `maybeSingle()` para datos únicos
- Manejo de errores y estados de carga

## Próximos Pasos

1. Configurar autenticación de usuarios
2. Implementar gráficos con Chart.js o Recharts
3. Agregar módulos de Producción, Ventas y Reportes
4. Implementar exportación de datos a Excel/PDF
5. Agregar filtros y búsqueda en el historial

## Tecnologías

- **Framework**: Next.js 13 (App Router)
- **Estilos**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Iconos**: Lucide React
- **TypeScript**: Tipado estático completo
