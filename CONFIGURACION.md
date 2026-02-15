# Configuración del Frontend

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto Front (plantilla) con las siguientes variables:

```env
# URL del Backend API
VITE_BACKEND_URL=http://localhost:5000
```

### Para Producción

```env
VITE_BACKEND_URL=https://tu-backend-url.com
```

## Notas

- Las variables de entorno en Vite deben comenzar con `VITE_` para ser accesibles en el código
- Reinicia el servidor de desarrollo después de cambiar las variables de entorno
- El archivo `.env` no debe ser commiteado (ya está en .gitignore)

