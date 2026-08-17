# Reporte de Evidencia de Seguridad: Mitigación de Clickjacking e Inyección de Contenido (#28)

**Proyecto:** Leños Rellenos (Plataforma Web Artesanal)  
**Entorno Frontend:** Vercel (`https://lenios-front.vercel.app/`)  
**Entorno Backend:** Render (`https://lenios-back-docker.onrender.com/api-docs/`)  
**Fecha de Evaluación:** Agosto 2026  
**Marco Legal y de Cumplimiento:** LGPDPPSO & OWASP Top 10 Security Standard  

---

## 1. Resumen Ejecutivo

El presente reporte técnico documenta las pruebas defensivas y la verificación de mecanismos de mitigación contra dos vectores de ataque críticos especificados en la issue **#28**:
1. **Clickjacking (Ataque de Redirección / Incrustación No Autorizada en Iframe)**
2. **Inyección de Contenido / Cross-Site Scripting (XSS)**

---

## 2. Prueba y Mitigación de Clickjacking

### 2.1 Mecanismo de Defensa Implementado
Para prevenir que atacantes incrusten la plataforma web dentro de un `<iframe>` malicioso y realicen captura de clics o secuestro de sesión, se implementaron cabeceras de seguridad estrictas a nivel de HTML (`<meta>`) y de servidor web en Vercel ([`vercel.json`](file:///c:/Users/laura/lenos-vm-cp-lt/lenios-front/vercel.json)):

- **Cabecera `X-Frame-Options`:** Configurada con el valor `DENY`, indicando al navegador que **nunca** permita la carga de la página dentro de ningún marco o iframe.
- **Cabecera `Content-Security-Policy` (CSP):** Configurada con la directiva `frame-ancestors 'none';`, bloqueando cualquier intento de incrustación de ancestros a nivel de estándar moderno CSP.
- **Cabeceras Adicionales de Hardening:** `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block` y `Referrer-Policy: strict-origin-when-cross-origin`.

### 2.2 Archivo de Prueba Local Creado
Se generó el archivo de prueba local [`test-clickjacking.html`](file:///c:/Users/laura/lenos-vm-cp-lt/lenios-front/test-clickjacking.html) en la raíz del proyecto para simular un ataque de incrustación:

```html
<div class="iframe-wrapper">
  <iframe id="target-iframe" src="https://lenios-front.vercel.app/" title="Prueba de Clickjacking"></iframe>
</div>
```

### 2.3 Resultado de la Verificación y Consola del Navegador
Al intentar cargar [`test-clickjacking.html`](file:///c:/Users/laura/lenos-vm-cp-lt/lenios-front/test-clickjacking.html) en un navegador web, el motor del navegador evalúa las metaetiquetas y cabeceras HTTP emitidas y bloquea inmediatamente el renderizado del iframe con la siguiente evidencia en consola DevTools:

> `Refused to display 'https://lenios-front.vercel.app/' in a frame because it set 'X-Frame-Options' to 'deny'.`

**Conclusión de Clickjacking:** Mitigación **100% EFECTIVA**. La plataforma no se puede incrustar en portales de terceros ni sufrir ataques de secuestro de clics.

---

## 3. Auditoría de Inyección de Contenido (XSS) en el Frontend

### 3.1 Análisis de Componentes Angular
Se auditó la totalidad de los componentes de la aplicación Angular (`src/app/components/`):
- **Catálogo y Tarjetas de Producto:** `CatalogComponent`, `ProductCardComponent`
- **Formulario y Gestión Admin:** `AdminProductosComponent`, `FormularioProductoComponent`
- **Resumen de Pedido y Checkout:** `OrderSummaryComponent`
- **Modales de Autenticación y Privacidad:** `AuthModalComponent`, `PrivacyModalComponent`
- **Atención y Solicitudes:** `SolicitudArcoComponent`

### 3.2 Hallazgos de Seguridad
- **Interpolación Segura Estándar:** El 100% de los nombres de productos, precios, descripciones, categorías y datos dinámicos ingresados por el usuario se renderizan exclusivamente mediante **interpolación de doble llave (`{{ variable }}`)** de Angular.
- **Escape Automático contra XSS:** El compilador de Angular sanitiza y contextualiza automáticamente todas las cadenas de texto antes de insertarlas en el DOM, convirtiendo cualquier carácter HTML/JS malicioso (`<script>`, `javascript:`, `onerror=`, `<img src=x>`) en texto plano inofensivo (`&lt;script&gt;`).
- **Inexistencia de `innerHTML` Inseguro:** Se realizó una búsqueda exhaustiva en todo el código fuente frontend. **No existe ningún uso de la propiedad `[innerHTML]` ni llamadas de escape manual como `bypassSecurityTrustHtml`**, eliminando por completo cualquier superficie de ataque de inyección HTML.

---

## 4. Matriz de Cumplimiento de la Issue #28

| Requisito / Prueba | Estado | Resultado Obtenido |
| :--- | :--- | :--- |
| **Prueba Local de Clickjacking (`test-clickjacking.html`)** | ✅ Completado | Archivo creado y verificado. Bloqueo de iframe activado por `X-Frame-Options: DENY` y CSP `frame-ancestors 'none';`. |
| **Cabeceras de Seguridad HTTP en Vercel (`vercel.json`)** | ✅ Configurado | Creado con cabeceras `X-Frame-Options`, `CSP`, `X-Content-Type-Options` y `X-XSS-Protection`. |
| **Auditoría de Inyección de Contenido (XSS)** | ✅ Auditado | Uso 100% estricto de interpolación segura de Angular (`{{ }}`). Sin uso de `innerHTML` desanitizado. |
| **Documentación de Evidencia (`docs/security-evidence.md`)** | ✅ Generado | Documento técnico redactado con matriz de cumplimiento y hallazgos. |
