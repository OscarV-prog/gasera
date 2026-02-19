---
stepsCompleted:
  [
    "step-01-init",
    "step-02-discovery",
    "step-03-success",
    "step-04-journeys",
    "step-05-domain",
    "step-06-innovation",
    "step-07-project-type",
    "step-08-scoping",
    "step-09-functional",
    "step-10-nonfunctional",
    "step-11-polish",
  ]
inputDocuments: []
workflowType: "prd"
briefCount: 0
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
classification:
  projectType: "SaaS B2B / Platform"
  domain: "Energy / Logistics"
  complexity: "High"
  projectContext: "Greenfield"
---

# Documento de Requisitos del Producto (PRD) - Gasera

**Autor:** Petroil  
**Fecha:** 9 de febrero de 2026  
**Estado:** Listo para Implementación

## Resumen Ejecutivo

**Gasera** es una infraestructura digital operativa diseñada para centralizar y automatizar la distribución de gas. No es simplemente una aplicación, sino un ecosistema integral que orquesta la logística, el inventario y la administración desde un núcleo SaaS centralizado. El sistema garantiza una trazabilidad inmutable de cada cilindro, ruta y transacción, eliminando la ineficiencia de los procesos manuales y proporcionando control total a las empresas distribuidoras.

## Visión del Producto y Criterios de Éxito

### Visión

Transformar el caos operativo de las distribuidoras de gas tradicionales en una operación digital de alta precisión. Gasera busca ser el estándar tecnológico de la industria, donde la toma de decisiones se basa en datos reales y la ejecución logística es autónoma y eficiente.

### Criterios de Éxito (SMART)

- **Éxito del Usuario (Administrador):** Control total de la operación sin herramientas externas (WhatsApp/Excel). Visibilidad en tiempo real de toda la flota y los pedidos.
- **Éxito del Usuario (Chofer):** Autonomía completa en ruta guiada por la aplicación. Eliminación del 100% de las instrucciones manuales para entregas.
- **Éxito del Negocio:** Gestión automática del 70% de los pedidos en el primer año. Capacidad para administrar más de 20 choferes activos simultáneamente por empresa.
- **Éxito Técnico:** Trazabilidad persistente e inmutable de cada evento (ubicación, entrega, pago). Tiempos de asignación de pedidos inferiores a 2 minutos.

## Historias de Usuario (User Journeys)

### Ricardo — Administrador (Control Total)

1. **Inicio:** Ricardo abre el BackOffice y visualiza el estado consolidado de la planta: inventario actual, pedidos pendientes y ubicación de los choferes.
2. **Acción:** El sistema sugiere rutas óptimas. Ricardo valida y asigna pedidos masivamente con un solo clic.
3. **Monitoreo:** Supervisa el progreso en tiempo real. Si surge una excepción, puede reasignar un pedido sin interrumpir la operación.
4. **Cierre:** Al final de la jornada, el sistema genera automáticamente el reporte de liquidación e inventario.

### Mateo — Chofer (Eficiencia en Ruta)

1. **Inicio:** Mateo abre su aplicación y ve su ruta cargada con direcciones exactas y cantidades de productos.
2. **Operación:** El GPS lo guía punto a punto. Al realizar una entrega, registra la cantidad y el método de pago, incluso si pierde la conexión a internet.
3. **Sincronización:** Al recuperar señal, la aplicación sincroniza los datos automáticamente, asegurando que el BackOffice esté actualizado sin duplicidad de información.
4. **Resultado:** Mateo completa más entregas por jornada con menor consumo de combustible y sin errores administrativos.

### Sofía — Cliente (Experiencia Digital - Fase 2)

1. **Solicitud:** Sofía pide gas desde su aplicación móvil en segundos, con precio transparente.
2. **Seguimiento:** Recibe una notificación cuando el camión está cerca y puede rastrear la ubicación de Mateo en el mapa.
3. **Entrega:** Recibe su comprobante digital tras la entrega y califica el servicio recibido.

## Requisitos Funcionales (El Contrato de Capacidades)

### Gestión de Plataforma (SaaS Multi-Inquilino)

- **FR1:** Aislamiento lógico de datos entre empresas mediante un identificador único de inquilino (`tenant_id`).
- **FR2:** Panel de Super-Administrador para la gestión de empresas distribuidoras, planes de suscripción y métricas globales.
- **FR3:** Control de acceso basado en roles (RBAC) con permisos jerárquicos: Super-Admin, Admin de Empresa, Supervisor, Chofer y Cliente.

### Operación de Flota y Activos

- **FR4:** Registro maestro de vehículos con control de capacidad nominal y carga actual de productos.
- **FR5:** Trazabilidad de activos físicos (cilindros/tanques) mediante códigos seriales o identificadores externos.
- **FR6:** Alertas de vigencia para licencias de conducir y certificaciones de seguridad industrial del personal.

### Logística e Inventario

- **FR7:** Registro de carga inicial del vehículo al inicio de cada jornada operativa.
- **FR8:** Conciliación automática de inventario al cierre de ruta (Carga vs. Ventas vs. Devoluciones).
- **FR9:** Detección y reporte automático de mermas o discrepancias inusuales durante la operación.

### Gestión de Pedidos y Rutas

- **FR10:** Creación manual y masiva de pedidos desde el BackOffice (Alcance MVP).
- **FR11:** Asignación inteligente de pedidos basada en la cercanía geográfica del chofer y su disponibilidad de inventario.
- **FR12:** Motor de estados de pedido inmutable (Pendiente -> En camino -> Entregado -> Cancelado).

### Ejecución Móvil (App del Chofer)

- **FR13:** Operación nativa con soporte fuera de línea (offline-first) y sincronización automática de datos.
- **FR14:** Validación de entrega vinculada a las coordenadas geográficas del dispositivo (GPS).
- **FR15:** Registro de métodos de pago (Efectivo/Digital) y captura de firma o confirmación digital de recepción.

## Requisitos No Funcionales (Estándares de Calidad)

### Rendimiento y Escalabilidad

- **Latencia:** Notificación de nuevos pedidos en la App del Chofer en menos de 5 segundos.
- **Resiliencia:** La aplicación móvil debe mantener su funcionalidad core (lectura y registro de entregas) sin dependencia del servidor central.
- **Carga:** Capacidad para soportar 100 empresas y 500 choferes activos simultáneamente en el primer año.

### Seguridad y Privacidad

- **Seguridad por Diseño:** Validación de permisos en cada punto final del API (Backend-enforced security).
- **Protección de Datos:** Cifrado de datos personales y sensibles tanto en reposo como en tránsito.
- **Integridad:** Logs de auditoría inmutables para todas las acciones que afecten al inventario o las finanzas.

### Integración y Geodatos

- **Cartografía:** Uso de **OpenStreetMap** (vía **Leaflet**) para garantizar independencia tecnológica y cero costos de licencia.
- **Localización:** Geoposicionamiento en tiempo real con frecuencia de actualización optimizada para el ahorro de batería en dispositivos móviles.

## Alcance y Fases de Desarrollo

### Fase 1 (MVP) - Motor Operativo y Control SaaS

- **Enfoque:** Establecer el motor logístico y la arquitectura multi-inquilino.
- **Roles:** Administrador y Chofer.
- **Canal:** Pedidos gestionados internamente desde el BackOffice.

### Fase 2 (Crecimiento) - Expansión B2C

- **Enfoque:** Apertura al cliente final y automatización.
- **Novedad:** Lanzamiento de la App Cliente, notificaciones automáticas y analítica de productividad avanzada.

### Fase 3 (Visión) - Inteligencia Operativa

- **Enfoque:** Optimización extrema mediante datos.
- **Novedad:** Predicción de demanda con IA, facturación fiscal automática integrada y telemetría vehicular avanzada.

## Restricciones del Dominio

- **Seguridad Industrial:** Cumplimiento con validaciones internas de inspección vehicular obligatorias antes de permitir el inicio de una ruta.
- **Normativa Energética:** Capacidad de adaptarse a modelos de precios regulados por regiones o periodos específicos.
