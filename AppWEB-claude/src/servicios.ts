// RAÍZ DE COMPOSICIÓN del portal web — único módulo (junto con main.tsx) autorizado a importar `backend/`.
//
// El frontend y la UI consumen el backend exclusivamente a través de este archivo. Si mañana se cambia la base
// de datos, se reemplaza `src/backend/` y solo se ajustan las líneas `from "./backend/..."` de abajo; ninguna
// pantalla ni hook cambia.
export {
  cambiarEstadoSolicitudCud,
  cambiarEstadoTurno,
  cerrarSesionAdmin,
  crearTurno,
  iniciarSesionAdmin,
  liberarTurno,
  mensajeDeError,
  observarSesionAdmin,
  repararOcupados,
  suscribirPacientes,
  suscribirSolicitudesCud,
  suscribirTurnos,
} from "./backend/adminService";
export type { EstadoTurno, Paciente, SesionAdmin, SolicitudCud, Turno } from "./backend/adminService";
