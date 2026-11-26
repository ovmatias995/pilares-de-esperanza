# Matriz de trazabilidad (RTM) — Pilares de Esperanza

> Relaciona cada requerimiento de [REQUERIMIENTOS.md](../1-diseno-y-requerimientos/REQUERIMIENTOS.md) con los casos de [CASOS_DE_PRUEBA.md](CASOS_DE_PRUEBA.md) en ambos sentidos.
> Estado: **diseño de pruebas**. Ningún caso fue ejecutado todavía; los resultados esperados se derivaron del código fuente vigente.

## 1. Matriz de trazabilidad de requerimientos (RTM)

La **cobertura** es el porcentaje de criterios de aceptación (CA) del requerimiento que tienen al menos un caso de prueba. El **estado** es el grado de implementación observado en el código (los casos aún no se ejecutaron).

### 1.1 Requerimiento → casos de prueba

| ID Requerimiento | Descripción Breve | Módulo / Archivo(s) Fuente | Casos de Prueba Asociados (TC-IDs) | Cobertura (%) | Estado |
| --- | --- | --- | --- | --- | --- |
| RF-01 | Pantalla Splash | Móvil<br>`App.js`<br>`src/frontend/useAppController.js`<br>`src/ui/pantallas/PantallasAuth.js` | TC-001 | 100% | Implementado |
| RF-02 | Pantalla de Bienvenida | Móvil<br>`src/ui/pantallas/PantallasAuth.js`<br>`App.js` | TC-002 | 100% | Implementado |
| RF-03 | Inicio de sesión de paciente | Móvil<br>`src/ui/pantallas/PantallasAuth.js`<br>`src/frontend/useAppController.js`<br>`src/backend/PacienteService.js` | TC-003, TC-004, TC-005, TC-074 | 100% | Implementado con observaciones |
| RF-04 | Recuperación de contraseña | Móvil<br>`src/ui/pantallas/PantallasAuth.js`<br>`src/frontend/useAppController.js`<br>`src/backend/PacienteService.js` | TC-006, TC-007, TC-075 | 100% | Implementado |
| RF-05 | Registro de datos personales con formateo automático | Móvil<br>`src/ui/pantallas/PantallasAuth.js`<br>`src/frontend/useAppController.js` | TC-008, TC-009, TC-010, TC-011, TC-012 | 100% | Implementado con observaciones |
| RF-06 | Creación de cuenta y envío del enlace de verificación (onboarding paso 1 de 2) | Móvil<br>`src/frontend/useAppController.js`<br>`src/backend/PacienteService.js`<br>`src/ui/pantallas/PantallasAuth.js` | TC-010, TC-013, TC-067, TC-075, TC-107 | 100% | Implementado con observaciones |
| RF-07 | Verificación de correo y reenvío (onboarding paso 2 de 2) | Móvil<br>`src/frontend/useAppController.js`<br>`src/backend/PacienteService.js`<br>`src/ui/pantallas/PantallasAuth.js` | TC-014, TC-015, TC-016, TC-067, TC-074 | 100% | Implementado |
| RF-08 | Permiso y vista de cámara | Móvil<br>`src/ui/dispositivo/CamaraNativa.js` | TC-017, TC-018, TC-077, TC-108 | 100% | Implementado |
| RF-09 | Captura biométrica secuencial DNI frente / dorso / rostro | Móvil<br>`src/ui/dispositivo/CamaraNativa.js`<br>`src/frontend/useAppController.js`<br>`App.js` | TC-015, TC-018, TC-019 | 100% | Parcial |
| RF-10 | Ubicación GPS domiciliaria con validación de cobertura | Móvil<br>`src/ui/dispositivo/MapaReal.js`<br>`src/compartido/reglasMapa.js`<br>`src/frontend/dispositivo/GpsService.js`<br>`src/ui/pantallas/PantallasAuth.js`<br>`src/frontend/useAppController.js` | TC-020, TC-021, TC-070, TC-071, TC-109 | 100% | Implementado |
| RF-11 | Confirmación de ubicación y persistencia del perfil | Móvil<br>`src/frontend/useAppController.js`<br>`src/backend/PacienteService.js`<br>`src/ui/pantallas/PantallasAuth.js` | TC-022, TC-023, TC-067, TC-109 | 100% | Implementado |
| RF-12 | Dashboard con próximo turno | Móvil<br>`src/ui/pantallas/PantallasPaciente.js`<br>`src/frontend/useAppController.js` | TC-003, TC-024, TC-081 | 100% | Implementado con observaciones |
| RF-13 | Catálogo de especialidades | Móvil<br>`src/ui/pantallas/PantallasTurnos.js`<br>`src/compartido/DatosClinica.js` | TC-025 | 100% | Implementado |
| RF-14 | Selección de profesional | Móvil<br>`src/ui/pantallas/PantallasTurnos.js`<br>`src/compartido/DatosClinica.js`<br>`App.js` | TC-026 | 100% | Implementado |
| RF-15 | Selección de día hábil y horarios filtrados | Móvil<br>`src/ui/pantallas/PantallasTurnos.js`<br>`src/ui/componentes/SelectorHorarios.js`<br>`src/frontend/useAppController.js`<br>`src/compartido/DatosClinica.js` | TC-027 | 100% | Implementado con observaciones |
| RF-16 | Regla horaria AM / 24 h | Móvil<br>`src/frontend/useAppController.js`<br>`src/compartido/DatosClinica.js`<br>`AppWEB-claude/src/backend/adminService.js` | TC-028, TC-029 | 100% | Implementado |
| RF-17 | Reserva de turno con ID determinístico | Móvil<br>`src/frontend/useAppController.js`<br>`src/backend/TurnosService.js` | TC-030, TC-031, TC-032, TC-067 | 100% | Implementado |
| RF-18 | Confirmación de turno | Móvil<br>`src/ui/pantallas/PantallasTurnos.js` | TC-031 | 100% | Implementado |
| RF-19 | Mis Turnos | Móvil<br>`src/ui/pantallas/PantallasTurnos.js`<br>`src/backend/TurnosService.js`<br>`src/frontend/useAppController.js` | TC-034 | 100% | Implementado con observaciones |
| RF-20 | Cancelación de turno con liberación inmediata | Móvil<br>`src/ui/pantallas/PantallasTurnos.js`<br>`src/backend/TurnosService.js`<br>`src/frontend/useAppController.js` | TC-035, TC-067 | 100% | Implementado |
| RF-21 | Historial Clínico | Móvil<br>`src/ui/pantallas/PantallasPaciente.js` | TC-036 | 100% | Parcial |
| RF-22 | Perfil de Afiliado/a y cierre de sesión | Móvil<br>`src/ui/pantallas/PantallasPaciente.js`<br>`src/frontend/useAppController.js`<br>`src/backend/PacienteService.js` | TC-037 | 100% | Implementado con observaciones |
| RF-23 | Servicios Center (llamada de emergencia y recepción) | Móvil<br>`src/ui/pantallas/PantallasPaciente.js`<br>`src/compartido/DatosClinica.js` | TC-038 | 100% | Implementado |
| RF-24 | Soporte y Ayuda (FAQs y WhatsApp) | Móvil<br>`src/ui/pantallas/PantallasPaciente.js`<br>`src/ui/componentes/ComponentesClinica.js`<br>`src/compartido/DatosClinica.js` | TC-039 | 100% | Implementado |
| RF-38 | Información para solicitar el CUD (Certificado Único de Discapacidad) | Móvil<br>`src/ui/pantallas/PantallasPaciente.js`<br>`src/compartido/InfoCUD.js`<br>`App.js` | TC-081, TC-082 | 100% | Implementado |
| RF-39 | Envío de la solicitud de CUD con confirmación | Móvil<br>`src/ui/pantallas/PantallasPaciente.js`<br>`src/frontend/useAppController.js`<br>`src/ui/dialogos/Dialogos.js`<br>`src/backend/SolicitudCudService.js`<br>`src/backend/index.js`<br>`firestore.rules` | TC-083, TC-084, TC-085 | 100% | Implementado con observaciones |
| RF-40 | Solicitudes de CUD en el padrón y la ficha del paciente (portal) | Web<br>`AppWEB-claude/src/ui/App.tsx`<br>`AppWEB-claude/src/backend/adminService.js`<br>`AppWEB-claude/src/frontend/useDatosAdmin.ts`<br>`AppWEB-claude/src/servicios.ts` | TC-086, TC-087 | 100% | Implementado |
| RF-41 | Gestión del estado de la solicitud de CUD (portal) | Web<br>`AppWEB-claude/src/ui/PanelSolicitudCud.tsx`<br>`AppWEB-claude/src/ui/App.tsx`<br>`AppWEB-claude/src/backend/adminService.js`<br>`AppWEB-claude/src/servicios.ts`<br>`firestore.rules` | TC-088, TC-090 | 100% | Implementado |
| RF-42 | Estado de la solicitud de CUD reflejado en la app | Móvil<br>`src/ui/pantallas/PantallasPaciente.js`<br>`src/frontend/useSolicitudCud.js`<br>`src/backend/SolicitudCudService.js`<br>`App.js` | TC-092 | 100% | Implementado |
| RF-43 | Recordatorio de turno 3 horas antes (notificación local) | Móvil<br>`src/frontend/dispositivo/NotificacionesService.js`<br>`src/compartido/reglasRecordatorios.js`<br>`src/frontend/useAppController.js`<br>`app.json` | TC-091, TC-093, TC-097 | 100% | Implementado con observaciones |
| RF-44 | Avisos de la solicitud de CUD: confirmación y recordatorio de la Junta | Móvil<br>`src/frontend/useSolicitudCud.js`<br>`src/frontend/dispositivo/NotificacionesService.js`<br>`src/compartido/reglasRecordatorios.js` | TC-091, TC-094, TC-095 | 100% | Implementado con observaciones |
| RF-45 | Notificación push remota del cambio de estado (Cloud Function) | Móvil<br>`functions/index.js`<br>`functions/mensajes.js`<br>`src/backend/PacienteService.js`<br>`src/frontend/dispositivo/NotificacionesService.js`<br>`firebase.json` | TC-089, TC-096, TC-098 | 100% | Parcial |
| RF-46 | Fecha y hora de registro de la solicitud de CUD en la app | Móvil<br>`src/compartido/reglasRecordatorios.js`<br>`src/ui/pantallas/PantallasPaciente.js`<br>`src/backend/SolicitudCudService.js` | TC-099 | 100% | Implementado |
| RF-47 | Descarga de la app mediante código QR y página de descarga | Web<br>`AppWEB-claude/public/descargar/index.html`<br>`scripts/generar-qr.mjs`<br>`scripts/desplegar-web.mjs`<br>`docs/3-comercial/qr/` | TC-102, TC-103 | 100% | Parcial |
| RF-48 | Sesión persistente del paciente en el teléfono | Móvil<br>`src/backend/firebase/FirebaseConfig.js`<br>`src/backend/PacienteService.js`<br>`src/frontend/useAppController.js`<br>`package.json` | TC-106 | 100% | Implementado |
| RF-49 | Registro reanudable y sin bloqueo del correo | Móvil<br>`src/backend/PacienteService.js`<br>`src/frontend/dispositivo/BorradorRegistro.js`<br>`src/frontend/useAppController.js` | TC-107 | 100% | Implementado |
| RF-25 | Navegación interna con botón Volver | Móvil<br>`src/frontend/useAppController.js`<br>`App.js` | TC-002, TC-037 | 100% | Implementado |
| RF-26 | Sincronización de turnos propios y ocupados | Móvil<br>`src/frontend/useAppController.js`<br>`src/backend/TurnosService.js` | TC-003, TC-027, TC-032, TC-066, TC-072 | 100% | Implementado con observaciones |
| RF-27 | Login administrativo con verificación de rol | Web<br>`AppWEB-claude/src/ui/LoginAdmin.tsx`<br>`AppWEB-claude/src/backend/adminService.js`<br>`AppWEB-claude/src/ui/App.tsx` | TC-041, TC-042, TC-043, TC-044 | 100% | Implementado |
| RF-28 | Sesión persistente y cierre de sesión | Web<br>`AppWEB-claude/src/backend/adminService.js`<br>`AppWEB-claude/src/ui/App.tsx` | TC-045, TC-068 | 100% | Implementado |
| RF-29 | Agenda de turnos en tiempo real | Web<br>`AppWEB-claude/src/backend/adminService.js`<br>`AppWEB-claude/src/ui/App.tsx` | TC-041, TC-046, TC-047, TC-067 | 100% | Implementado |
| RF-30 | Alta de turno por administración | Web<br>`AppWEB-claude/src/backend/adminService.js`<br>`AppWEB-claude/src/ui/App.tsx`<br>`AppWEB-claude/src/compartido/catalogoClinica.js` | TC-033, TC-048, TC-049 | 100% | Implementado |
| RF-31 | Cambio de estado de turnos | Web<br>`AppWEB-claude/src/backend/adminService.js`<br>`AppWEB-claude/src/ui/App.tsx` | TC-050, TC-067 | 100% | Implementado |
| RF-32 | Liberación de horario (eliminación de turno) | Web<br>`AppWEB-claude/src/backend/adminService.js`<br>`AppWEB-claude/src/ui/App.tsx` | TC-051, TC-067 | 100% | Implementado |
| RF-33 | Padrón de pacientes en tiempo real | Web<br>`AppWEB-claude/src/backend/adminService.js`<br>`AppWEB-claude/src/ui/App.tsx` | TC-052, TC-067 | 100% | Implementado |
| RF-34 | Ficha de paciente: datos filiatorios, cobertura y GPS | Web<br>`AppWEB-claude/src/ui/App.tsx`<br>`AppWEB-claude/src/backend/adminService.js` | TC-053 | 100% | Implementado |
| RF-35 | Dashboard de métricas y alertas | Web<br>`AppWEB-claude/src/ui/App.tsx`<br>`AppWEB-claude/src/backend/adminService.js` | TC-054 | 100% | Implementado |
| RF-36 | Directorio de profesionales | Web<br>`AppWEB-claude/src/ui/App.tsx`<br>`AppWEB-claude/src/compartido/catalogoClinica.js` | TC-055 | 100% | Implementado |
| RF-37 | Panel de gestión de turnos | Web<br>`AppWEB-claude/src/ui/App.tsx` | TC-056 | 100% | Implementado |
| RNF-01 | Control de acceso basado en roles (RBAC) en Firestore | Seguridad<br>`firestore.rules`<br>`src/backend/TurnosService.js`<br>`src/backend/PacienteService.js` | TC-042, TC-050, TC-058, TC-059, TC-060, TC-061, TC-062, TC-073 | 100% | Implementado con observaciones |
| RNF-02 | Acceso exclusivo de administradores al portal web | Seguridad<br>`AppWEB-claude/src/backend/adminService.js`<br>`AppWEB-claude/src/ui/App.tsx`<br>`AppWEB-claude/src/ui/LoginAdmin.tsx` | TC-041, TC-042, TC-045, TC-062 | 100% | Implementado |
| RNF-03 | Integridad: unicidad del turno mediante ID determinístico | Integridad transaccional<br>`src/backend/TurnosService.js`<br>`src/frontend/useAppController.js`<br>`AppWEB-claude/src/backend/adminService.js` | TC-031, TC-032, TC-033, TC-035, TC-048, TC-049, TC-051, TC-058 | 100% | Implementado |
| RNF-04 | Concurrencia en reservas simultáneas | Integridad transaccional<br>`src/backend/TurnosService.js`<br>`AppWEB-claude/src/backend/adminService.js` | TC-032, TC-033, TC-049, TC-073 | 100% | Implementado |
| RNF-05 | Usabilidad clínica | Usabilidad (UX)<br>`src/ui/pantallas/PantallasAuth.js`<br>`src/frontend/useAppController.js`<br>`App.js`<br>`AppWEB-claude/src/ui/App.tsx` | TC-040, TC-057 | 100% | Implementado |
| RNF-06 | Accesibilidad | Usabilidad (UX)<br>`src/ui/componentes/SelectorHorarios.js`<br>`AppWEB-claude/src/ui/App.tsx`<br>`AppWEB-claude/src/ui/LoginAdmin.tsx` | TC-040, TC-057 | 100% | Parcial |
| RNF-07 | Sincronización en tiempo real | Rendimiento<br>`AppWEB-claude/src/backend/adminService.js`<br>`src/frontend/useAppController.js` | TC-046, TC-066 | 100% | Parcial |
| RNF-08 | Mantenibilidad y bajo acoplamiento | Mantenibilidad<br>`src/frontend/useAppController.js`<br>`src/backend/`<br>`src/ui/dispositivo/`<br>`src/compartido/DatosClinica.js`<br>`AppWEB-claude/src/backend/` | TC-065, TC-078, TC-080 | 100% | Implementado |
| RNF-14 | Separación en bloques Backend / Frontend / UX-UI con verificación automática | Mantenibilidad<br>`scripts/verificar-arquitectura.mjs`<br>`src/backend/index.js`<br>`App.js`<br>`src/frontend/useAppController.js`<br>`src/ui/dialogos/Dialogos.js`<br>`AppWEB-claude/src/servicios.ts`<br>`AppWEB-claude/src/frontend/useDatosAdmin.ts` | TC-078, TC-079, TC-080 | 100% | Implementado |
| RNF-09 | Compatibilidad de datos entre App y Web | Mantenibilidad<br>`AppWEB-claude/src/compartido/catalogoClinica.js`<br>`AppWEB-claude/src/backend/adminService.js`<br>`src/compartido/DatosClinica.js` | TC-048, TC-053, TC-065, TC-072 | 100% | Implementado con observaciones |
| RNF-10 | Protección de la configuración y de los archivos locales | Seguridad<br>`AppWEB-claude/src/backend/firebaseConfig.js`<br>`AppWEB-claude/.env.example`<br>`.gitignore`<br>`src/backend/firebase/FirebaseConfig.js`<br>`.env.example` | TC-063, TC-064 | 100% | Implementado |
| RNF-11 | Manejo de errores | Usabilidad (UX)<br>`AppWEB-claude/src/backend/adminService.js`<br>`src/frontend/useAppController.js` | TC-005, TC-013, TC-043, TC-068 | 100% | Implementado con observaciones |
| RNF-12 | Gestión de permisos de hardware | Usabilidad (UX)<br>`src/ui/dispositivo/CamaraNativa.js`<br>`src/ui/dispositivo/MapaReal.js` | TC-017, TC-020, TC-021, TC-069 | 100% | Implementado |
| RNF-13 | Identidad visual coherente y diseño atractivo | Usabilidad (UX)<br>`src/ui/tema/Tema.js`<br>`src/ui/componentes/ComponentesUI.js`<br>`src/ui/pantallas/`<br>`App.js` | TC-076, TC-077 | 100% | Implementado con observaciones |
| RNF-15 | Indicador de actividad discreto | Usabilidad (UX)<br>`src/ui/componentes/ComponentesUI.js`<br>`App.js`<br>`src/ui/tema/EstilosGlobales.js` | TC-100 | 100% | Implementado con observaciones |
| RNF-16 | Despliegue del portal y acceso en la clínica sin intervención manual | Mantenibilidad<br>`firebase.json`<br>`.firebaserc`<br>`scripts/desplegar-web.mjs`<br>`scripts/instalar-acceso-clinica.ps1`<br>`AppWEB-claude/public/manifest.webmanifest`<br>`AppWEB-claude/index.html` | TC-101, TC-104 | 100% | Parcial |
| RNF-17 | Mapa de ubicación sin clave de API ni cierres inesperados | Fiabilidad<br>`src/ui/dispositivo/MapaReal.js`<br>`src/compartido/reglasMapa.js`<br>`tests/mapa.test.mjs`<br>`package.json` | TC-105, TC-109 | 100% | Implementado |

### 1.2 Caso de prueba → requerimientos (sentido inverso)

| TC-ID | Título | Requerimientos que verifica |
| --- | --- | --- |
| TC-001 | [Funcional] Splash y transición a Bienvenida | RF-01 |
| TC-002 | [Funcional] Accesos de Bienvenida | RF-02, RF-25 |
| TC-003 | [Funcional] Login exitoso de paciente | RF-03, RF-26, RF-12 |
| TC-004 | [Negativo] Login con campos vacíos | RF-03 |
| TC-005 | [Negativo] Login con credenciales inválidas | RF-03, RNF-11 |
| TC-006 | [Negativo] Recuperar contraseña sin correo | RF-04 |
| TC-007 | [Funcional] Recuperar contraseña con correo válido | RF-04 |
| TC-008 | [Validación] Registro con campo obligatorio vacío | RF-05 |
| TC-009 | [Valor límite] Contraseña de 5 caracteres | RF-05 |
| TC-010 | [Valor límite] Contraseña de 6 caracteres | RF-05, RF-06 |
| TC-011 | [Valor límite] Autoformato de fecha DD/MM/AAAA | RF-05 |
| TC-012 | [Validación] Capitalización automática | RF-05 |
| TC-013 | [Negativo] Registro con correo ya registrado | RF-06, RNF-11 |
| TC-014 | [Negativo] Verificar sin haber abierto el enlace | RF-07 |
| TC-015 | [Funcional] Verificar después de abrir el enlace | RF-07, RF-09 |
| TC-016 | [Funcional] Reenvío del enlace de verificación | RF-07 |
| TC-017 | [Hardware] Permiso de cámara denegado | RF-08, RNF-12 |
| TC-018 | [Hardware] Secuencia de captura frente, dorso y rostro | RF-08, RF-09 |
| TC-019 | [Hardware] Cancelar durante la captura | RF-09 |
| TC-020 | [Hardware] GPS con permiso concedido | RF-10, RNF-12 |
| TC-021 | [Hardware][Negativo] GPS con permiso denegado | RF-10, RNF-12 |
| TC-022 | [Funcional] Persistencia del perfil al finalizar el registro | RF-11 |
| TC-023 | [Negativo] Fallo al guardar el perfil se informa y permite reintentar | RF-11 |
| TC-024 | [Funcional] Dashboard con y sin próximo turno | RF-12 |
| TC-025 | [Funcional] Catálogo de especialidades y buscador | RF-13 |
| TC-026 | [Funcional] Selección de profesional | RF-14 |
| TC-027 | [Funcional] Horarios por día y filtrado de ocupados | RF-15, RF-26 |
| TC-028 | [Valor límite] Regla horaria AM / 24 h en la app | RF-16 |
| TC-029 | [Valor límite] Regla horaria en `formatearHoraClinica` (web) | RF-16 |
| TC-030 | [Negativo] Confirmar turno sin horario | RF-17 |
| TC-031 | [Funcional] Reserva exitosa con ID determinístico | RF-17, RF-18, RNF-03 |
| TC-032 | [Concurrencia] Reserva simultánea desde dos apps | RF-17, RNF-03, RNF-04, RF-26 |
| TC-033 | [Concurrencia] Reserva simultánea App y Web | RF-30, RNF-04, RNF-03 |
| TC-034 | [Funcional] Mis Turnos: listado, estado y estado vacío | RF-19 |
| TC-035 | [Funcional] Cancelación de turno por el paciente | RF-20, RNF-03 |
| TC-036 | [Funcional] Historial Clínico | RF-21 |
| TC-037 | [Funcional] Perfil de afiliado y cierre de sesión | RF-22, RF-25 |
| TC-038 | [Funcional] Servicios Center: emergencias y recepción | RF-23 |
| TC-039 | [Funcional] Soporte y Ayuda: FAQs y WhatsApp | RF-24 |
| TC-040 | [Usabilidad] Teclados, autoformato, carga y accesibilidad (app) | RNF-05, RNF-06 |
| TC-041 | [Funcional] Login de administrador | RF-27, RNF-02, RF-29 |
| TC-042 | [Seguridad][Negativo] Usuario no administrador intenta entrar a la web | RF-27, RNF-02, RNF-01 |
| TC-043 | [Negativo] Login web con credenciales inválidas | RF-27, RNF-11 |
| TC-044 | [Validación] Login web con campos vacíos | RF-27 |
| TC-045 | [Funcional] Sesión persistente y cierre de sesión | RF-28, RNF-02 |
| TC-046 | [Funcional] Agenda en tiempo real | RF-29, RNF-07 |
| TC-047 | [Funcional] Filtros y vista semanal de la agenda | RF-29 |
| TC-048 | [Funcional] Alta de turno por el administrador | RF-30, RNF-03, RNF-09 |
| TC-049 | [Concurrencia][Negativo] Alta duplicada en la web | RF-30, RNF-03, RNF-04 |
| TC-050 | [Funcional] Cambio de estado del turno | RF-31, RNF-01 |
| TC-051 | [Funcional] Liberar horario | RF-32, RNF-03 |
| TC-052 | [Funcional] Padrón en tiempo real con búsqueda y filtros | RF-33 |
| TC-053 | [Funcional] Ficha: datos filiatorios, cobertura y GPS | RF-34, RNF-09 |
| TC-054 | [Funcional] Dashboard: métricas, actividad y día hábil | RF-35 |
| TC-055 | [Funcional] Directorio de profesionales | RF-36 |
| TC-056 | [Funcional] Panel de gestión con filtros | RF-37 |
| TC-057 | [Usabilidad] Mensajes, estados de carga y accesibilidad (web) | RNF-05, RNF-06 |
| TC-058 | [Seguridad] Paciente intenta `update` sobre un turno | RNF-01, RNF-03 |
| TC-059 | [Seguridad] Paciente lee y escribe en `administradores` | RNF-01 |
| TC-060 | [Seguridad] Acceso cruzado a `pacientes` | RNF-01 |
| TC-061 | [Seguridad] Creación y eliminación de turnos con UID ajeno | RNF-01 |
| TC-062 | [Seguridad] Lectura de turnos y ocupados por sesión | RNF-01, RNF-02 |
| TC-063 | [Seguridad] Configuración de la web y exclusiones de Git | RNF-10 |
| TC-064 | [Seguridad] Credenciales literales en la app móvil | RNF-10 |
| TC-065 | [Estático] Aislamiento de capas y catálogo compartido | RNF-08, RNF-09 |
| TC-066 | [Concurrencia / Tiempo real] Cambios de la clínica en la app | RNF-07, RF-26 |
| TC-067 | [Regresión] Ciclo completo de punta a punta | RF-06, RF-07, RF-11, RF-17, RF-29, RF-31, RF-32, RF-33, RF-20 |
| TC-068 | [Negativo] Errores de red en la web | RNF-11, RF-28 |
| TC-069 | [Hardware] Manejo de permisos al reabrir la app | RNF-12 |
| TC-070 | [Hardware][Valor límite] Cobertura GPS a 99 km y 101 km del centro | RF-10 |
| TC-071 | [Funcional] Entrega de coordenadas válidas al controlador | RF-10 |
| TC-072 | [Funcional] Migración de ocupaciones de turnos anteriores | RNF-09, RF-26 |
| TC-073 | [Seguridad][Validación] Forma exacta del turno y vínculo con ocupados | RNF-01, RNF-04 |
| TC-074 | [Seguridad][Negativo] Login con correo sin verificar | RF-03, RF-07 |
| TC-075 | [Funcional] Correos de Firebase Auth en español | RF-06, RF-04 |
| TC-076 | [Usabilidad] Revisión visual del diseño en dispositivo | RNF-13 |
| TC-077 | [Hardware][UI] Alineación del marco de encuadre de la cámara | RF-08, RNF-13 |
| TC-078 | [Arquitectura] El código cumple las reglas de dependencia entre bloques | RNF-14, RNF-08 |
| TC-079 | [Arquitectura][Negativo] Se detecta un import prohibido entre bloques | RNF-14 |
| TC-080 | [Mantenibilidad] Cambiar la base de datos solo afecta al bloque backend | RNF-14, RNF-08 |
| TC-081 | [Funcional] Acceso a Solicitar CUD desde el Dashboard | RF-12, RF-38 |
| TC-082 | [Funcional][Contenido] Contenido y lenguaje formal de Solicitar CUD | RF-38 |
| TC-083 | [Funcional] Confirmar o cancelar el envío de la solicitud de CUD | RF-39 |
| TC-084 | [Funcional][Negativo] No se puede enviar una segunda solicitud de CUD | RF-39 |
| TC-085 | [Seguridad] Reglas de Firestore de solicitudCUD | RF-39 |
| TC-086 | [Funcional] La solicitud de CUD se ve en la ficha del paciente (portal) | RF-40 |
| TC-087 | [Funcional] Filtro, alerta y actualización en tiempo real de solicitudes de CUD | RF-40 |
| TC-088 | [Seguridad] Reglas de Firestore: gestión del estado de solicitudCUD | RF-41 |
| TC-089 | [Seguridad] Token push solo en la ficha propia | RF-45 |
| TC-090 | [Funcional] La administración aprueba una solicitud de CUD (portal) | RF-41 |
| TC-091 | [Unitaria] Reglas puras de recordatorios y textos de notificación | RF-43, RF-44 |
| TC-092 | [Funcional] La app refleja el cambio de estado en tiempo real | RF-42 |
| TC-093 | [Hardware] Permiso y recordatorio de turno 3 horas antes | RF-43 |
| TC-094 | [Funcional] Notificación al cambiar el estado con la app abierta | RF-44 |
| TC-095 | [Funcional] Recordatorio previo a la Junta Evaluadora | RF-44 |
| TC-096 | [Integración] Push remoto desde la Cloud Function | RF-45 |
| TC-097 | [Negativo] Permiso de notificaciones denegado | RF-43 |
| TC-098 | [Unitaria] Los textos de la Cloud Function coinciden con los de la app | RF-45 |
| TC-099 | [Unitaria][Funcional] Fecha y hora de registro de la solicitud de CUD | RF-46 |
| TC-100 | [Hardware][UI] Indicador "Procesando" discreto | RNF-15 |
| TC-101 | [Integración] Publicación del portal en Firebase Hosting | RNF-16 |
| TC-102 | [Integración] Descarga e instalación de la app desde el código QR | RF-47 |
| TC-103 | [Funcional][Negativo] Generación del código QR | RF-47 |
| TC-104 | [Funcional] Acceso automático al portal en la PC de la clínica | RNF-16 |
| TC-105 | [Unitaria] Cálculo de teselas del mapa sin clave de API | RNF-17 |
| TC-106 | [Hardware][Integración] Sesión persistente al cerrar y reabrir la app | RF-48 |
| TC-107 | [Hardware][Integración] Registro interrumpido: retomar sin bloquear el correo | RF-49, RF-06 |
| TC-108 | [Hardware][UI] Recuadro de la cámara centrado | RF-08 |
| TC-109 | [Hardware][Integración] Confirmar ubicación en el APK de release sin cierres | RNF-17, RF-10, RF-11 |

### 1.3 Verificación de cobertura

| Verificación | Resultado |
| --- | --- |
| RF con al menos un caso de prueba | 49 de 49 (100 %) |
| RNF con al menos un caso de prueba | 17 de 17 (100 %) |
| Criterios de aceptación con al menos un caso | 195 de 195 (100 %) |
| Casos de prueba huérfanos (sin requerimiento) | 0 |
| Casos con referencias a criterios inexistentes | 0 |

## 2. Defectos y riesgos conocidos que los casos deben confirmar

Estos puntos se desprenden del código y se verificarán al ejecutar los casos indicados:

| Hallazgo | Casos |
| --- | --- |
| Captura de DNI y rostro simulada (`mock_uri_foto`): no se almacena ni valida ninguna imagen. | TC-018 |
| Fallos al guardar el perfil se silencian y el flujo continúa. | TC-023 |
| Registros anteriores guardan `ubicacion` con claves `latitude/longitude` (objeto `coords` completo); el portal normaliza ambos formatos. | TC-053 |
| Quien esté a más de 100 km del centro no puede completar el registro (comportamiento de `GpsService`): confirmar que es la regla de negocio deseada. | TC-070 |
| `pacienteDni` del turno no se contrasta con la ficha del paciente (solo lo ven su dueño y la administración). | TC-073 |
| Configuración de Firebase de la app: ya externalizada a EXPO_PUBLIC_FIREBASE_*; confirmar que no queda ningún valor literal. | TC-064 |
| La app no se actualiza en tiempo real; un turno marcado "cancelado" por la clínica sigue ocupando el horario hasta ser liberado. | TC-050, TC-066 |
| El login de la app informa cualquier error de red como credenciales incorrectas. Las cuentas con el correo sin verificar quedan bloqueadas (y reciben un nuevo enlace). | TC-005, TC-068, TC-074 |
| El diseño visual de la app solo se comprobó por empaquetado; falta revisarlo en dispositivos. El marco de la cámara se rehízo con medidas del visor real y debe confirmarse en el dispositivo donde se observó el desalineado. | TC-076, TC-077 |
