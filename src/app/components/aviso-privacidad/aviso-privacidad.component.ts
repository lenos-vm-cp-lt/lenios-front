import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-aviso-privacidad',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="privacy-container">
      <header class="privacy-header">
        <a routerLink="/" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Volver al Inicio
        </a>
        <h1>Aviso de Privacidad Integral</h1>
      </header>
      
      <div class="privacy-content">
        <p><strong>Última actualización:</strong> Agosto 2026</p>
        
        <section>
          <h2>1. Identidad y domicilio del responsable</h2>
          <p>Leños Rellenos, con domicilio en México, es responsable del tratamiento y protección de sus datos personales.</p>
        </section>

        <section>
          <h2>2. Datos personales que se recaban</h2>
          <p>Para llevar a cabo las finalidades descritas en el presente aviso, recabaremos los siguientes datos personales: Nombre completo, número telefónico y domicilio o ubicación de entrega.</p>
        </section>

        <section>
          <h2>3. Finalidades del tratamiento de datos</h2>
          <p>Los datos personales que recabamos de usted, los utilizaremos para las siguientes finalidades primarias que son necesarias para el servicio solicitado:</p>
          <ul>
            <li>Procesamiento, gestión y entrega de pedidos a domicilio.</li>
            <li>Contacto directo a través de WhatsApp o llamada telefónica para confirmación de pedidos.</li>
            <li>Atención al cliente y resolución de dudas o problemas con su orden.</li>
          </ul>
        </section>

        <section>
          <h2>4. Transferencia de Datos a Terceros</h2>
          <p>En estricto cumplimiento con la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO) y normativas aplicables, Leños Rellenos realiza transferencias de datos personales únicamente a los proveedores indispensables para la operación del servicio y la entrega de pedidos. Todas las transferencias ocurren mediante comunicaciones cifradas sobre protocolo <strong>HTTPS/TLS</strong> y aplican el principio de minimización de datos:</p>
          <ul>
            <li><strong>WhatsApp (Meta Platforms, Inc.):</strong> Envío de notificaciones de confirmación de pedido y comunicación directa para la entrega. Se transfieren exclusivamente los datos mínimos indispensables para la logística (nombre del cliente, número telefónico, dirección de entrega y detalle de productos).</li>
            <li><strong>Cloudinary Inc.:</strong> Almacenamiento, distribución y optimización de recursos multimedia e imágenes del catálogo y la plataforma bajo conexiones HTTPS seguras.</li>
            <li><strong>Proveedor de Nube (Infraestructura y Base de Datos):</strong> Alojamiento de la infraestructura del servidor API (Render) y la base de datos (MongoDB Atlas), garantizando cifrado TLS v1.3 en tránsito y cifrado AES-256 en reposo.</li>
          </ul>
          <p>Leños Rellenos no vende, alquila ni comercializa sus datos personales con ningún tercero para fines publicitarios o ajenos al servicio contratado.</p>
        </section>

        <section>
          <h2>5. Medios para ejercer los Derechos ARCO</h2>
          <p>Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal (Rectificación); que la eliminemos de nuestros registros (Cancelación); así como oponerse al uso de sus datos (Oposición).</p>
          <p>Para ejercer estos derechos, puede visitar nuestra sección de <a routerLink="/derechos-arco" class="inline-link">Solicitud de Derechos ARCO</a>.</p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .privacy-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: #ffffff;
      min-height: 100vh;
      color: var(--color-text-main);
    }
    .privacy-header {
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    .privacy-header h1 {
      color: var(--color-brown-darkest);
      margin-top: 1rem;
      font-size: 2rem;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-orange-primary);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .back-link:hover {
      color: var(--color-orange-bright);
    }
    .privacy-content section {
      margin-bottom: 2rem;
    }
    .privacy-content h2 {
      color: var(--color-orange-primary);
      font-size: 1.3rem;
      margin-bottom: 0.75rem;
    }
    .privacy-content p, .privacy-content ul {
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .privacy-content ul {
      padding-left: 1.5rem;
    }
    .inline-link {
      color: var(--color-orange-primary);
      text-decoration: underline;
    }
  `]
})
export class AvisoPrivacidadComponent {}
