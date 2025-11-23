# Chilemon-Showdown
Proyecto para CC5003 - Aplicaciones Web Reactivas. Primavera 2025.

## Descripción del proyecto 

Hoy la comunidad chilena que juega simuladores PvP debe usar plataformas globales (idioma, 
latencia, eventos y horarios no alineados). Con Chilémon Showdown © queremos cambiar eso: 
reemplazar los nombres de los Pokémones por referencias a la cultura chilena y que los 
jugadores puedan encontrar batallas en una modalidad horaria más cercana a su contraparte. 
Queremos que los usuarios compitan en línea por turnos asíncronos, seleccionando equipos 
de “pokemon” con nombres inspirados en la cultura local.

En esta aplicación web, el usuario será capaz de crear su propio equipo de chilémon, y lanzarse a batallar
contra personas de todo el país!

## Estructura del Estado Global

## Mapa de rutas y flujo de autenticación

### Mapa de rutas

```bash
/api
 ├── /login               
 │     ├── /                    (POST)    - Iniciar sesión
 │     ├── /me                  (GET)     - Obtener usuario autenticado
 │     └── /logout              (POST)    - Cerrar sesión
 ├── /users
 │     ├── /                    (GET)     - Obtener todos los usuarios
 │     └── /                    (POST)    - Registrar nuevo usuario
 ├── /chilemon
 │     ├── /                    (GET)     - Lista de todos los chilemon
 │     └── /:id                 (GET)     - Obtener Chilemon por ID
 ├── /team
 │     ├── /teams               (GET)     - Obtener todos los equipos del usuario
 │     ├── /teams/:id           (GET)     - Obtener equipo único por ID
 │     ├── /teams               (POST)    - Crear un nuevo equipo
 │     ├── /teams/:id           (PUT)     - Actualizar un equipo
 │     ├── /teams/:id           (DELETE)  - Eliminar un equipo
 │     └── /teamChilemon        (GET)     - Obtener chilemon, miembros de un equipo
 ├── /battles
 │     ├── /battles/:id         (GET)     - Obtener todos los equipos del usuario
 │     ├── /userId/:battles     (GET)     - Obtener todas las batallas donde participa UserId
 │     ├── /battles             (POST)    - Crea una batalla o se une a una en estado waiting
 │     ├── /battles/:id/move    (GET)     - Obtener todos los equipos del usuario
 │     ├── /battles/:id/switch  (GET)     - Obtener todos los equipos del usuario
 │     └── /battles/:id/forfeit (GET)     - Obtener todos los equipos del usuario
 ```

### Flujo de autenticación
![Flujo de autenticación](./flujo_autenticacion.png)

## Testing E2E

## Desiciones de diseño y librerías de estilos

## Despliegue de la aplicación

URL aplicación desplegada: 

```bash
fullstack.dcc.uchile.cl:7142
```

Los pasos de construcción y despliegue fueron los siguientes:

1. En la carpeta de backend: 
```bash
npm run build:ui
npm run build
npm run seed
```

2. Subir al servidor la carpeta backend:
```bash
scp -P219 -r backend fullstack@fullstack.dcc.uchile.cl:elpepesin/chilemon
```

3. Dentro del servidor 
```bash
cd elpepesin/chilemon/backend
npm i
npm run start
```
