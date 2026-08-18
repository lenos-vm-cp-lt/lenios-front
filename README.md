# LeniosFront

Este proyecto fue generado utilizando Angular CLI versión 19.0.2.

## Servidor de desarrollo

Para iniciar un servidor de desarrollo local, ejecuta:

```bash
ng serve
```

Una vez que el servidor esté corriendo, abre tu navegador y navega a `http://localhost:4200/`. La aplicación se recargará automáticamente cada vez que modifiques algún archivo fuente.

## Andamiaje de código

Angular CLI incluye potentes herramientas de generación de código. Para generar un nuevo componente, ejecuta:

```bash
ng generate component nombre-del-componente
```

Para ver la lista completa de esquemas disponibles (componentes, directivas, pipes, etc.), ejecuta:

```bash
ng generate --help
```

## Compilación

Para compilar el proyecto, ejecuta:

```bash
ng build
```

Esto compilará el proyecto y almacenará los artefactos de build en el directorio `dist/`. Por defecto, el build de producción optimiza la aplicación para rendimiento y velocidad.

## Ejecución de pruebas unitarias

Para ejecutar pruebas unitarias con el test runner Karma, usa:

```bash
ng test
```

## Ejecución de pruebas End-to-End

Para pruebas end-to-end (e2e), ejecuta:

```bash
ng e2e
```

Angular CLI no incluye un framework de pruebas e2e por defecto. Puedes elegir el que mejor se adapte a tus necesidades.

## Recursos adicionales

Para más información sobre el uso de Angular CLI, incluyendo referencias detalladas de comandos, visita la página [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).

---

## Por qué la validación del cliente no es seguridad (#29)

### 1. Principio de Arquitectura y Defensa en Profundidad

En el desarrollo de aplicaciones web modernas, existe una distinción fundamental entre Experiencia de Usuario (UX) y Seguridad del Sistema:

- **Validación en el Frontend (Angular / Cliente):** Las reglas de validación en la interfaz de usuario (como `Validators.required`, `Validators.email`, mensajes de error inline y desactivación de botones de formulario) existen únicamente para mejorar la experiencia de usuario (UX). Su objetivo es brindar retroalimentación inmediata sin generar latencia de red.

- **Superficie de Manipulación:** Debido a que el código frontend se ejecuta directamente en el dispositivo y navegador del usuario, un cliente o atacante posee control absoluto sobre el entorno. Cualquier formulario o regla frontend puede ser omitida modificando el DOM, desactivando JavaScript o realizando peticiones HTTP directas al backend mediante herramientas como cURL, Postman, Fetch o scripts personalizados.

- **Validación en el Backend (Render / API REST):** La seguridad real, la integridad de la base de datos y la aplicación estricta de las reglas de negocio recaen incondicionalmente en el Backend. El servidor debe tratar cualquier entrada proveniente del cliente como potencialmente maliciosa o no confiable, validando la presencia, tipo y formato de cada campo a nivel de servidor.

### 2. Evidencia Técnica: Bypass de Formulario Frontend y Rechazo del Backend

Se ejecutó una prueba de bypass enviando peticiones HTTP directas con cURL al endpoint de registro de usuarios en el backend alojado en Render (`https://lenios-back-docker.onrender.com/api/v1/auth/registro`), omitiendo la interfaz web de Angular.

**A) Petición cURL (Bypass del formulario Angular omitiendo la contraseña obligatoria)**

Se envió una solicitud POST directa omitiendo el campo obligatorio `password`:

```bash
curl -i -X POST https://lenios-back-docker.onrender.com/api/v1/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Prueba Bypass Frontend", "email": "bypass-test@example.com"}'
```

**B) Respuesta del Backend en Render (Rechazo con HTTP 400 Bad Request)**

El servidor interceptó y rechazó inmediatamente la petición a nivel de backend, retornando un código HTTP 400 Bad Request y impidiendo cualquier registro en la base de datos:

```http
HTTP/1.1 400 Bad Request
Date: Mon, 17 Aug 2026 23:06:48 GMT
Content-Type: application/json; charset=utf-8
x-render-origin-server: Render
Server: cloudflare

{
  "success": false,
  "message": "Nombre, email y contraseña son requeridos",
  "error": null
}
```

**C) Prueba con Formato Inválido de Correo Electrónico**

Al enviar una petición omitiendo la estructura válida de correo (`"email": "correo-invalido"`), la validación del esquema en el backend rechazó la solicitud a nivel de servidor:

```json
{
  "success": false,
  "message": "Usuario validation failed: email: Por favor ingresa un correo electrónico válido",
  "error": null
}
```

### 3. Conclusión

Esta prueba demuestra con evidencia real que la validación en el cliente no constituye una medida de seguridad. Aunque un atacante se salte todos los controles del formulario en Angular, la validación estricta a nivel de servidor en Render rechaza las peticiones no válidas, garantizando la robustez e integridad del sistema.

---

## Flujo de Trabajo y Políticas de Ramas (Git Flow) (#30)

Este proyecto implementa un flujo de trabajo basado en Pull Requests y reglas de protección de ramas para garantizar la calidad del código y la colaboración ordenada:

**Rama de Integración:**
- `develop`: Rama principal de trabajo y colaboración, protegida contra push directo.

**Ramas de Funcionalidad (`feature/*`):**
- Todo desarrollo, corrección o mejora de issue debe realizarse en una rama independiente derivada de `develop` (ej. `feature/laura-front`).

**Políticas de Integración (Branch Protection Rules):**
- **Prohibición de Push Directo:** Los intentos de realizar un `git push` directo hacia la rama `develop` son rechazados automáticamente por GitHub (violación de reglas de repositorio).
- **Revisiones Obligatorias:** Todo cambio para integrarse en `develop` se realiza estrictamente mediante un Pull Request (PR), el cual requiere de forma obligatoria al menos 1 aprobación de otro colaborador para habilitar el botón de fusión (Merge).

---

## Arquitectura y Patrones de Diseño (#31)

### 1. Arquitectura de 3 Capas

El sistema está estructurado formalmente en una arquitectura de 3 capas, garantizando alta modularidad, mantenibilidad, separación de responsabilidades y escalabilidad:

- **Capa de Presentación (Frontend Angular 19):** Corresponde a la interfaz gráfica del usuario (Single Page Application - SPA). Encargada de renderizar las vistas, gestionar la experiencia de usuario (UX), capturar eventos del usuario y realizar validaciones visuales de formularios.

- **Capa de Negocio / Servicios (Backend Node.js con Express):** Contiene la lógica del dominio de la aplicación, controladores de endpoints REST, orquestación de servicios y middlewares de seguridad (autenticación JWT, control de acceso RBAC y desinfección/validación de datos de entrada).

- **Capa de Datos y Repositorio (Mongoose ODM / MongoDB Atlas):** Responsable del acceso físico a los datos, definición de esquemas/modelos y la ejecución de operaciones de persistencia en la base de datos MongoDB Atlas.

> **[!IMPORTANT]**
> **Aclaración de Aislamiento de Capas:** El Frontend (Angular) no realiza ninguna consulta directa a la base de datos. El cliente web interactúa de manera 100% aislada, consumiendo únicamente la API REST HTTP/HTTPS del backend. Toda lectura o modificación de datos requiere pasar por los controladores y verificaciones de seguridad de la Capa de Negocio del backend antes de tocar la base de datos.

### 2. Patrones de Diseño Aplicados y Justificación Técnico-Arquitectónica

**A) Patrón Singleton (Singleton Pattern)**

- **Ubicación en el código:** Archivo de conexión backend `lenios-back/src/config/db.js` (`DatabaseSingleton`).
- **Descripción:** El patrón Singleton asegura que una clase tenga una única instancia en todo el ciclo de vida de la aplicación y proporciona un punto de acceso global a dicha instancia.
- **Justificación:** La creación reiterada de conexiones a MongoDB en un entorno Node.js/Express agotaría rápidamente el pool de conexiones del servidor y provocaría fugas de memoria (connection leaks). Al implementar `DatabaseSingleton`, la aplicación reutiliza la misma conexión activa a MongoDB Atlas en cada solicitud HTTP, reduciendo latencia y optimizando el consumo de recursos.

**B) Patrón Repository (Repository Pattern)**

- **Ubicación en el código:**
  - Backend (Persistencia): Modelos Mongoose en `lenios-back/src/models/` (`Producto.js`, `Usuario.js`, `Pedido.js`, `Cliente.js`, `SolicitudArco.js`, `AuditLog.js`, etc.).
  - Frontend (Abstracción de API): Servicios de Angular en `src/app/services/` (`product.service.ts`, `auth.service.ts`, `pedido.service.ts`, `arco.service.ts`, etc.).
- **Descripción:** El patrón Repository actúa como una capa intermedia entre la capa de negocio y la capa de acceso a datos, abstrayendo los detalles específicos de persistencia y presentando una interfaz limpia para las operaciones CRUD.
- **Justificación:** Abstrae la lógica de persistencia y desacopla el acceso a datos de la capa de negocio. En el backend, los controladores interactúan con los modelos de Mongoose sin necesidad de construir consultas de bajo nivel a la base de datos. En el frontend, los componentes de Angular invocan métodos de los servicios sin conocer detalles de la infraestructura HTTP/Fetch, facilitando las pruebas unitarias y el mantenimiento del código.

---

## Guía de Despliegue y Manual de Usuario (Entregable Final - #32)

Esta sección contiene toda la información necesaria para levantar, probar y verificar el funcionamiento completo de LeniosFront y su ecosistema.

### 1. Diagrama de Arquitectura y Componentes

El sistema implementa una arquitectura desacoplada de 3 capas, actualmente desplegada en la nube:

```
[ Angular Frontend (SPA) — Desplegado en Vercel ]
       │  (Peticiones HTTP REST / JSON)
       ▼
[ Backend API (Node.js / Express) — Desplegado en Render vía Docker ]
       │  (Patrón Repository & Singleton)
       ▼
[ Base de Datos (MongoDB Atlas) ]
```

### 2. Entornos Desplegados

| Componente | Plataforma | URL |
|---|---|---|
| Frontend (Angular) | Vercel | `https://lenios-front.vercel.app/` |
| Backend (Node.js / Express) | Render (contenedor Docker) | `https://lenios-back-docker.onrender.com` |
| Documentación de la API (Swagger) | Render | `https://lenios-back-docker.onrender.com/api-docs/` |
| Base de datos | MongoDB Atlas | — |

### 3. Instrucciones de Ejecución Paso a Paso

**A) Ejecución Local (Sin Docker)**

Clonar el repositorio:

```bash
git clone https://github.com/lenos-vm-cp-lt/lenios-front.git
cd lenios-front
```

Instalar dependencias:

```bash
npm install
```

Iniciar el servidor de desarrollo:

```bash
ng serve
```

Abre tu navegador en `http://localhost:4200/`.

**B) Ejecución Local con Docker**

El proyecto incluye un `Dockerfile` multi-etapa y un `docker-compose.yml` para levantar el entorno de desarrollo dentro de un contenedor, con hot-reload activado mediante volúmenes.

`docker-compose.yml`:

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    ports:
      - "4200:4200"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

Parado en la raíz del proyecto (donde está el `docker-compose.yml`), ejecuta:

```bash
docker-compose up --build
```

- `--build` reconstruye la imagen; úsalo la primera vez o cuando cambien las dependencias (`package.json`).
- Las siguientes veces, con `docker-compose up` es suficiente.
- Para correrlo en segundo plano: `docker-compose up --build -d`.

Abre tu navegador en `http://localhost:4200/`. Los cambios en el código local se reflejan automáticamente dentro del contenedor gracias al volumen montado.

Para detener el contenedor:

```bash
docker-compose down
```

**C) Entornos en Producción**

- **Frontend (Vercel):** `https://lenios-front.vercel.app/` — Desplegado automáticamente mediante integración continua (CI/CD) a partir del repositorio.
- **Backend (Render):** `https://lenios-back-docker.onrender.com` — Desplegado mediante una imagen Docker.
- **Documentación de la API:** `https://lenios-back-docker.onrender.com/api-docs/`

### 4. Credenciales de Prueba (Panel de Administración)

Para verificar las funciones protegidas del sistema y el panel de administración sin comprometer datos reales, utiliza las siguientes credenciales de prueba:

| Campo | Valor |
|---|---|
| Rol | Administrador de Prueba |
| Correo electrónico | `admin.test@lenios.com` |
| Contraseña | `AdminTest2026*` |

### 5. Verificación de Flujo Completo de Punta a Punta (E2E)

Se realizó una verificación manual completa sobre la **URL pública de producción** (`https://lenios-front.vercel.app/`), confirmando que el flujo funciona de extremo a extremo sin errores 404/500.

#### Recorrido Completo del Flujo E2E:
`ver catálogo` ➔ `agregar al carrito` ➔ `checkout hacia WhatsApp` ➔ `login con admin` ➔ `entrada correcta al dashboard de administración`

#### Detalle de Verificación por Pasos:
- [x] **Ver catálogo:** Carga correcta de elementos y productos desde la API de backend en Render.
- [x] **Agregar al carrito:** Adición, modificación de cantidades y control de stock local en el carrito de compras.
- [x] **Checkout hacia WhatsApp:** Generación dinámica del mensaje de pedido estructurado y redirección para atención al cliente vía WhatsApp.
- [x] **Login con admin:** Autenticación exitosa mediante el portal de login utilizando las credenciales de prueba de administrador (`admin.test@lenios.com` / `admin@lenosrellenos.com`).
- [x] **Entrada correcta al dashboard de administración:** Redirección automática inmediata del usuario con rol administrador hacia el **Dashboard de Administración** (`/admin/dashboard`) y gestión segura de recursos del sistema con rechazo de peticiones no autorizadas.

> **Resultado:** La URL pública funciona al 100% en el flujo evaluado. No se encontraron errores 404/500 durante la verificación.

