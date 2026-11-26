# Tarifa mensual de mantenimiento — Pilares de Esperanza

> Valores en **dólares estadounidenses (USD)**. Es una **propuesta comercial basada en estimaciones**: los precios de los
> proveedores se tomaron de sus páginas públicas (consultadas en noviembre de 2026) y cambian con frecuencia; la tarifa por
> hora es un supuesto que **el equipo debe ajustar** a su propia realidad. Verificar los precios vigentes antes de firmar.

## 1. Qué cubre la tarifa

La tarifa mensual tiene **dos componentes**:

1. **Mano de obra** del equipo (3 desarrolladores: Backend, Frontend/lógica, UX/UI): corrección de errores, actualizaciones de
   seguridad y de dependencias, soporte a la administración, ajustes menores, monitoreo y copias de seguridad.
2. **Infraestructura y suscripciones**: base de datos, autenticación, notificaciones, alojamiento del portal, compilación y
   distribución de la app, monitoreo y dominio.

No incluye: desarrollo de funcionalidades nuevas (se cotizan aparte), el costo de las notificaciones por correo que la
administración envía desde su propio correo, ni asesoramiento legal.

## 2. Costos de infraestructura (qué se paga y por qué)

| Servicio | Para qué se usa | Precio de referencia (USD) | A partir de cuándo se paga |
|---|---|---|---|
| Firebase **Blaze** (pago por uso) | Plan obligatorio para Cloud Functions (notificaciones push con la app cerrada) | $0 fijo + uso | Siempre requiere tarjeta; cuesta solo si se supera la cuota gratuita |
| Cloud Firestore (base de datos) | Pacientes, turnos, solicitudes de CUD | ≈ $0,03–0,06 por 100.000 lecturas · ≈ $0,09–0,18 por 100.000 escrituras · ≈ $0,18 por GiB/mes | Cuota gratuita **diaria**: 50.000 lecturas, 20.000 escrituras, 1 GiB |
| Firebase Authentication | Inicio de sesión y verificación de correo | $0 hasta 50.000 usuarios activos/mes; luego ≈ $0,0055 por usuario | Más de 50.000 usuarios activos por mes |
| Cloud Functions | Aviso push cuando la administración cambia el estado del CUD | ≈ $0,40 por millón de invocaciones (2 M gratis) | Prácticamente nunca para una clínica |
| Firebase Hosting | Portal administrativo y página de descarga | Gratis hasta 10 GiB de almacenamiento y 10 GiB/mes de tráfico | Solo con mucho tráfico |
| Notificaciones push (Expo Push) | Entrega del aviso al teléfono | $0 | — |
| Notificaciones locales (recordatorio de turno 3 h antes, Junta) | Las programa el propio teléfono | $0 | — |
| Expo **EAS** (compilación de la app) | Generar el instalable Android/iOS | Free $0 · Starter ≈ $19/mes · Production ≈ $199/mes | Free alcanza al inicio; Starter/Production si se compila seguido o se necesita prioridad |
| Cuenta Google Play | Publicar en Play Store | $25 **una sola vez** | Al publicar en la tienda |
| Cuenta Apple Developer | App para iPhone (App Store/TestFlight) | $99 **por año** (≈ $8,25/mes) | Solo si se ofrece versión iOS |
| Dominio propio | Dirección del portal (ej. `portal.clinica.com.ar`) | ≈ $15–25 por año | Opcional (sin dominio se usa `*.web.app`, gratis) |
| Monitoreo de errores (Sentry u otro) | Detectar fallas de la app en producción | Gratis → ≈ $26/mes | Cuando se requiera historial y alertas |
| Copias de seguridad programadas de Firestore | Recuperación ante errores o borrados | Costo de almacenamiento (≈ $0,18/GiB/mes) | Desde el inicio (recomendado) |

> **Dato clave de diseño:** hoy el portal administrativo se suscribe a colecciones completas. Con pocos pacientes es gratis,
> pero a escala (decenas de miles de documentos y varios administradores conectados) las lecturas crecen rápido. Por eso el
> plan **Escalable** incluye implementar **paginación y consultas acotadas** en el portal: con eso el costo de base de datos
> se mantiene en decenas de dólares aun con 100.000 pacientes.

### Estimación de uso mensual por escala

| | Esencial | Profesional | Escalable |
|---|---|---|---|
| Pacientes registrados | hasta 1.000 | hasta 10.000 | hasta 100.000 |
| Pacientes activos por mes | ~300 | ~3.000 | ~30.000 |
| Administradores simultáneos | 1–3 | hasta 10 | hasta 30 |
| Lecturas Firestore / mes (estimado) | < 1,5 M (dentro de la cuota gratuita) | ≈ 10 M | ≈ 60 M (con paginación) |
| Escrituras Firestore / mes (estimado) | < 0,6 M (gratis) | ≈ 1 M | ≈ 8 M |
| **Costo Firebase estimado** | **$0–5** | **$5–25** | **$40–120** |

## 3. Mano de obra

Supuesto de cálculo (**editable**): **USD 20 por hora por integrante**. Es un valor intermedio para desarrolladores
junior/semi-senior que trabajan de forma independiente; ajustarlo según experiencia y mercado.

| | Esencial | Profesional | Escalable |
|---|---|---|---|
| Horas/mes de todo el equipo (3 integrantes) | 18 h (6 h c/u) | 36 h (12 h c/u) | 72 h (24 h c/u) |
| Atención | Correo, respuesta en 2 días hábiles | Correo y mensajería, 1 día hábil | Prioritaria, 4 h hábiles, guardia por incidentes |
| **Mano de obra (USD)** | **360** | **720** | **1.440** |

## 4. Tarifa final propuesta

| Concepto (USD/mes) | Esencial | Profesional | Escalable |
|---|---|---|---|
| Mano de obra | 360 | 720 | 1.440 |
| Infraestructura y suscripciones (reserva)¹ | 40 | 120 | 400 |
| **Subtotal** | **400** | **840** | **1.840** |
| Gestión de cobro, comisiones e impuestos (8 %)² | 32 | 67 | 147 |
| **TARIFA MENSUAL** | **≈ USD 430** | **≈ USD 910** | **≈ USD 1.990** |

¹ Reserva que cubre Firebase, EAS, monitoreo, dominio, copias de seguridad y un margen para picos. Si el consumo real es
menor, la diferencia se puede acreditar al cliente o dejar como reserva; si el cliente prefiere, la infraestructura puede
**facturarse a costo real** (con su propia tarjeta en Firebase) y la tarifa baja al valor de mano de obra más el 8 %.
² Estimación de comisiones de cobro internacional e impuestos; ajustar según el régimen fiscal del equipo.

**Cargos únicos (no mensuales):**
- Alta e implementación (configuración de Firebase, carga inicial de profesionales, capacitación a la administración): **USD 600**.
- Cuenta Google Play (USD 25) y, si se pide iOS, Apple Developer (USD 99/año): a cargo del cliente o trasladados a costo.

## 5. Cómo recalcular

```
Tarifa = ( horas_equipo × tarifa_hora  +  infraestructura ) × 1,08
```

Ejemplo Esencial: `(18 × 20 + 40) × 1,08 = 432` → se redondea a USD 430.

## 6. Aspectos a considerar antes de vender

- **Datos de salud:** son datos personales sensibles. En Argentina rige la Ley 25.326 de Protección de Datos Personales; el
  cliente debe contar con consentimiento informado de los pacientes e inscribir la base en el registro de la AAIP. Conviene
  validarlo con un profesional del derecho.
- **Ubicación de los datos:** Firestore se configura en una región (por ejemplo `southamerica-east1`, São Paulo); el precio
  por operación varía según la región elegida.
- **Continuidad:** la tarifa incluye copias de seguridad, pero el contrato debe definir el tiempo máximo de recuperación.
- **Tarjeta del cliente o del equipo:** Firebase Blaze y los servicios en la nube se facturan a la tarjeta de la cuenta
  titular. Definir de quién es la cuenta (se recomienda que sea del cliente y el equipo actúe como administrador).
