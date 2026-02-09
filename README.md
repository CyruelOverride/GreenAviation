# Campus Virtual GreenAviation

Plataforma web integral orientada a la formación de pilotos que centraliza el estudio teórico, la gestión académica de los alumnos, la evaluación mediante exámenes online y el seguimiento de prácticas de vuelo.

## Características Principales

- **Página Principal**: Presentación de la academia y oferta educativa
- **Estudio Teórico**: Acceso a manuales digitales y material audiovisual
- **Exámenes Online**: Sistema de evaluación con temporizador y resultados detallados
- **Gestión de Alumnos**: Panel para administradores y alumnos
- **Recursos Adicionales**: Biblioteca de manuales y material complementario
- **Preparación Práctico**: Material para examen práctico
- **Clases Online**: Acceso a clases en vivo y grabaciones

## Tecnologías Utilizadas

- React 18.2.0
- React Router DOM 6.20.0
- Vite 5.0.8 (Build tool moderna y rápida)
- CSS3 (Responsive Design)

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

3. Abrir [http://localhost:3000](http://localhost:3000) en el navegador

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción

## Estructura del Proyecto

```
src/
├── components/
│   ├── Header/
│   └── Sidebar/
├── pages/
│   ├── Home/
│   ├── Login/
│   ├── EstudioTeorico/
│   ├── Examenes/
│   ├── GestionAlumnos/
│   ├── RecursosAdicionales/
│   ├── PreparacionPractico/
│   └── ClasesOnline/
├── App.js
├── App.css
├── index.js
└── index.css
```

## Funcionalidades

### Autenticación
- Sistema de login básico (demo)
- Control de acceso basado en roles (Administrador / Alumno)
- Protección de rutas para usuarios autenticados

### Roles de Usuario

**Administrador:**
- Visualización de todos los alumnos
- Exportación de datos a Excel
- Acceso al historial académico
- Consulta de registros de vuelo

**Alumno:**
- Visualización de información personal
- Acceso a progreso académico
- Consulta de registros de vuelo
- Acceso a contenido audiovisual

## Ventajas de Vite

- ⚡ **Inicio rápido**: El servidor de desarrollo inicia instantáneamente
- 🔥 **HMR (Hot Module Replacement)**: Actualizaciones instantáneas sin perder el estado
- 📦 **Build optimizado**: Producción optimizada con Rollup
- 🎯 **Menos advertencias**: Dependencias modernas sin paquetes deprecados

## Notas de Desarrollo

- Los placeholders de imagen utilizan el servicio `via.placeholder.com`
- La autenticación es simulada (cualquier email y contraseña funcionan)
- Las integraciones con Google Drive y CloudAhoy están preparadas para implementación futura

## Próximos Pasos

- Integración con backend/API
- Conexión con Google Drive para material audiovisual
- Integración con API CloudAhoy
- Sistema de autenticación real
- Base de datos para gestión de alumnos y exámenes
