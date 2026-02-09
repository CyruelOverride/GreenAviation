# Instrucciones para corregir las dependencias

Ejecuta estos comandos en orden:

1. Elimina node_modules y package-lock.json:
   ```
   rmdir /s /q node_modules
   del package-lock.json
   ```

2. Limpia la caché de npm:
   ```
   npm cache clean --force
   ```

3. Reinstala las dependencias:
   ```
   npm install
   ```

4. Inicia el servidor:
   ```
   npm run dev
   ```

