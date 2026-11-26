// BLOQUE BACKEND — único punto de entrada del bloque.
//
// El resto de la aplicación NO importa archivos de este bloque: App.js (raíz de composición) lee `servicios`
// desde aquí y se lo inyecta al frontend. Para cambiar de base de datos solo hay que reemplazar los servicios
// de esta carpeta y mantener el contrato siguiente.
//
// CONTRATO `servicios.paciente`
//   iniciarRegistroYEnviarCorreo(correo, password) -> Promise<{ user, reanudado, verificado }>
//                                                     (si el correo tenía un registro a medias lo retoma con la misma contraseña;
//                                                      rechaza con error.code CORREO_EN_USO | CUENTA_YA_REGISTRADA | SIN_CONEXION | ...)
//   restaurarSesion()                              -> Promise<{ user, verificado, perfil|null, perfilNoDisponible } | null>
//                                                     (sesión guardada en el dispositivo; null si no hay ninguna)
//   comprobarVerificacionCorreo()                  -> Promise<boolean>
//   reenviarCorreoVerificacion()                   -> Promise<void>
//   registrarPacienteServidor(formulario, coordenadas) -> Promise<datosPaciente>
//   iniciarSesion(correo, password)                -> Promise<{ user, perfil|null }>
//                                                     (rechaza con error.code === 'EMAIL_NO_VERIFICADO' si falta verificar)
//   guardarTokenPush(token)                        -> Promise<void>   (token de notificaciones push del dispositivo)
//   recuperarPassword(correo)                      -> Promise<void>
//   cerrarSesion()                                 -> Promise<void>
//
// CONTRATO `servicios.turnos`
//   obtenerTurnosPaciente()                        -> Promise<Turno[]>
//   obtenerTurnosOcupados()                        -> Promise<Ocupado[]>
//   reservarTurno({ pacienteDni, profesionalId, profesionalNombre, especialidad, fecha, hora }) -> Promise<Turno>
//   cancelarTurno(idTurno)                         -> Promise<void>
//
// CONTRATO `servicios.solicitudCud`
//   obtenerMiSolicitud()                           -> Promise<Solicitud | null>
//   observarMiSolicitud(onData, onError)           -> () => void   (tiempo real; onData(Solicitud | null))
//   solicitar({ pacienteDni })                     -> Promise<Solicitud>
//                                                     (rechaza con Error si el paciente ya envió una solicitud)
//   Solicitud = { pacienteUid, pacienteDni, estado: 'pendiente'|'aprobada'|'rechazada', creadoEn,
//                 fechaJunta?: 'AAAA-MM-DD', horaJunta?: 'HH:MM', actualizadoEn? }
import { PacienteService } from './PacienteService';
import { TurnosService } from './TurnosService';
import { SolicitudCudService } from './SolicitudCudService';

export const servicios = {
  paciente: PacienteService,
  turnos: TurnosService,
  solicitudCud: SolicitudCudService
};
