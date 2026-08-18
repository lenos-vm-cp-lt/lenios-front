# LeniosFront

Este proyecto fue generado utilizando Angular CLI versión 19.0.2.

## Servidor de desarrollo

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Andamiaje de código

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Compilación

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Ejecución de pruebas unitarias

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Ejecución de pruebas End-to-End

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

---

## Por qué la validación del cliente no es seguridad (#29)

### 1. Principio de Arquitectura y Defensa en Profundidad
En el desarrollo de aplicaciones web modernas, existe una distinción fundamental entre **Experiencia de Usuario (UX)** y **Seguridad del Sistema**:

- **Validación en el Frontend (Angular / Cliente):** Las reglas de validación en la interfaz de usuario (como `Validators.required`, `Validators.email`, mensajes de error inline y desactivación de botones de formulario) existen **únicamente para mejorar la experiencia de usuario (UX)**. Su objetivo es brindar retroalimentación inmediata sin generar latencia de red.
- **Superficie de Manipulación:** Debido a que el código frontend se ejecuta directamente en el dispositivo y navegador del usuario, un cliente o atacante posee control absoluto sobre el entorno. Cualquier formulario o regla frontend puede ser omitida modificando el DOM, desactivando JavaScript o realizando peticiones HTTP directas al backend mediante herramientas como `cURL`, `Postman`, `Fetch` o scripts personalizados.
- **Validación en el Backend (Render / API REST):** La seguridad real, la integridad de la base de datos y la aplicación estricta de las reglas de negocio **recaen incondicionalmente en el Backend**. El servidor debe tratar **cualquier entrada proveniente del cliente como potencialmente maliciosa o no confiable**, validando la presencia, tipo y formato de cada campo a nivel de servidor.

---

### 2. Evidencia Técnica: Bypass de Formulario Frontend y Rechazo del Backend

Se ejecutó una prueba de bypass enviando peticiones HTTP directas con `cURL` al endpoint de registro de usuarios en el backend alojado en Render (`https://lenios-back-docker.onrender.com/api/v1/auth/registro`), omitiendo la interfaz web de Angular.

#### A) Petición cURL (Bypass del formulario Angular omitiendo la contraseña obligatoria)
Se envió una solicitud `POST` directa omitiendo el campo obligatorio `password`:

```bash
curl -i -X POST https://lenios-back-docker.onrender.com/api/v1/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Prueba Bypass Frontend", "email": "bypass-test@example.com"}'
```

#### B) Respuesta del Backend en Render (Rechazo con HTTP 400 Bad Request)
El servidor interceptó y rechazó inmediatamente la petición a nivel de backend, retornando un código **HTTP 400 Bad Request** y impidiendo cualquier registro en la base de datos:

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

#### C) Prueba con Formato Inválido de Correo Electrónico
Al enviar una petición omitiendo la estructura válida de correo (`"email": "correo-invalido"`), la validación del esquema en el backend rechazó la solicitud a nivel de servidor:

```json
{
  "success": false,
  "message": "Usuario validation failed: email: Por favor ingresa un correo electrónico válido",
  "error": null
}
```

---

### 3. Conclusión
Esta prueba demuestra con evidencia real que la validación en el cliente no constituye una medida de seguridad. Aunque un atacante se salte todos los controles del formulario en Angular, la **validación estricta a nivel de servidor en Render rechaza las peticiones no válidas**, garantizando la robustez e integridad del sistema.



# Flujo de Trabajo y Políticas de Ramas (Git Flow) (#30)

Este proyecto implementa un flujo de trabajo basado en Pull Requests y reglas de protección de ramas para garantizar la calidad del código y la colaboración ordenada:

1. **Rama de Integración:**
   - `develop`: Rama principal de trabajo y colaboración, protegida contra `push` directo.

2. **Ramas de Funcionalidad (`feature/*`):**
   - Todo desarrollo, corrección o mejora de issue debe realizarse en una rama independiente derivada de `develop` (ej. `feature/laura-front`).

3. **Políticas de Integración (Branch Protection Rules):**
   - **Prohibición de Push Directo:** Los intentos de realizar un `git push` directo hacia la rama `develop` son rechazados automáticamente por GitHub (violación de reglas de repositorio).
   - **Revisiones Obligatorias:** Todo cambio para integrarse en `develop` se realiza estrictamente mediante un **Pull Request (PR)**, el cual requiere de forma obligatoria al menos **1 aprobación** de otro colaborador para habilitar el botón de fusión (*Merge*).

---

## Arquitectura y Patrones de Diseño (#31)

### 1. Arquitectura de 3 Capas
El sistema está estructurado formalmente en una **arquitectura de 3 capas**, garantizando alta modularidad, mantenibilidad, separación de responsabilidades y escalabilidad:

1. **Capa de Presentación (Frontend Angular 19):**
   - Corresponde a la interfaz gráfica del usuario (Single Page Application - SPA).
   - Encargada de renderizar las vistas, gestionar la experiencia de usuario (UX), capturar eventos del usuario y realizar validaciones visuales de formularios.
   
2. **Capa de Negocio / Servicios (Backend Node.js con Express):**
   - Contiene la lógica del dominio de la aplicación, controladores de endpoints REST, orquestación de servicios y middlewares de seguridad (autenticación JWT, control de acceso RBAC y desinfección/validación de datos de entrada).
   
3. **Capa de Datos y Repositorio (Mongoose ODM / MongoDB Atlas):**
   - Responsable del acceso físico a los datos, definición de esquemas/modelos y la ejecución de operaciones de persistencia en la base de datos MongoDB Atlas.

> [!IMPORTANT]
> **Aclaración de Aislamiento de Capas:**
> El Frontend (Angular) **no realiza ninguna consulta directa a la base de datos**. El cliente web interactúa de manera 100% aislada, consumiendo únicamente la **API REST HTTP/HTTPS** del backend. Toda lectura o modificación de datos requiere pasar por los controladores y verificaciones de seguridad de la Capa de Negocio del backend antes de tocar la base de datos.

---

### 2. Patrones de Diseño Aplicados y Justificación Técnico-Arquitectónica

#### A) Patrón Singleton (Singleton Pattern)
- **Ubicación en el código:** Archivo de conexión backend `lenios-back/src/config/db.js` (`DatabaseSingleton`).
- **Descripción:** El patrón Singleton asegura que una clase tenga **una única instancia** en todo el ciclo de vida de la aplicación y proporciona un punto de acceso global a dicha instancia.
- **Justificación:** La creación reiterada de conexiones a MongoDB en un entorno Node.js/Express agotaría rápidamente el pool de conexiones del servidor y provocaría fugas de memoria (*connection leaks*). Al implementar `DatabaseSingleton`, la aplicación reutiliza la misma conexión activa a MongoDB Atlas en cada solicitud HTTP, reduciendo latencia y optimizando el consumo de recursos.

#### B) Patrón Repository (Repository Pattern)
- **Ubicación en el código:** 
  - **Backend (Persistencia):** Modelos Mongoose en `lenios-back/src/models/` (`Producto.js`, `Usuario.js`, `Pedido.js`, `Cliente.js`, `SolicitudArco.js`, `AuditLog.js`, etc.).
  - **Frontend (Abstracción de API):** Servicios de Angular en `src/app/services/` (`product.service.ts`, `auth.service.ts`, `pedido.service.ts`, `arco.service.ts`, etc.).
- **Descripción:** El patrón Repository actúa como una capa intermedia entre la capa de negocio y la capa de acceso a datos, abstraendo los detalles específicos de persistencia y presentando una interfaz limpia para las operaciones CRUD.
- **Justificación:** Abstrae la lógica de persistencia y desacopla el acceso a datos de la capa de negocio. En el backend, los controladores interactúan con los modelos de Mongoose sin necesidad de construir consultas de bajo nivel a la base de datos. En el frontend, los componentes de Angular invocan métodos de los servicios sin conocer detalles de la infraestructura HTTP/Fetch, facilitando las pruebas unitarias y el mantenimiento del código.