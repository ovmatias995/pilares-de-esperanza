import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import {
  BLOQUES_HORARIOS_BASE,
  DIAS_HABILES_SEMANA,
  ESPECIALIDADES_CLINICA,
  ESTADOS_TURNO,
  PROFESIONALES_CLINICA,
} from '../compartido/catalogoClinica';
import { compararTurnos, formatearHoraClinica, generarIdTurno } from '../compartido/reglasTurnos';

/**
 * Servicio aislado del Portal Web Administrativo.
 * Es la ÚNICA capa que conoce Firebase; las vistas React solo consumen estas funciones.
 *
 * @typedef {'reservado' | 'completado' | 'cancelado'} EstadoTurno
 *
 * @typedef {Object} Ubicacion
 * @property {number} latitud
 * @property {number} longitud
 *
 * @typedef {Object} Paciente
 * @property {string} uid
 * @property {string} nombre
 * @property {string} correo
 * @property {string} dni
 * @property {string} telefono
 * @property {string} fechaNacimiento
 * @property {string} obraSocial
 * @property {Ubicacion | null} ubicacion
 * @property {boolean} emailVerificado
 * @property {string} fechaRegistro
 *
 * @typedef {Object} Turno
 * @property {string} id
 * @property {string} pacienteUid
 * @property {string} pacienteDni
 * @property {string} profesionalId
 * @property {string} profesional
 * @property {string} especialidad
 * @property {string} fecha
 * @property {string} hora
 * @property {EstadoTurno} estado
 * @property {string} creadoEn
 *
 * @typedef {Object} SolicitudCud
 * @property {string} pacienteUid   También es el ID del documento en `solicitudCUD`.
 * @property {string} pacienteDni
 * @property {'pendiente' | 'aprobada' | 'rechazada'} estado
 * @property {string} creadoEn
 * @property {string} [fechaJunta]  AAAA-MM-DD (solo si fue aprobada).
 * @property {string} [horaJunta]   HH:MM (solo si fue aprobada).
 * @property {string} [actualizadoEn]
 *
 * @typedef {Object} SesionAdmin
 * @property {'admin' | 'sin-sesion'} estado
 * @property {string} [correo]
 * @property {string} [motivo] Código de AdminServiceError cuando la sesión fue rechazada.
 */

export const ESTADOS_SOLICITUD_CUD = ['pendiente', 'aprobada', 'rechazada'];

export class AdminServiceError extends Error {
  /**
   * @param {'NO_ADMIN' | 'TURNO_DUPLICADO' | 'DATOS_INVALIDOS' | 'ESTADO_INVALIDO'} codigo
   * @param {string} mensaje
   */
  constructor(codigo, mensaje) {
    super(mensaje);
    this.name = 'AdminServiceError';
    this.codigo = codigo;
  }
}

/* Las reglas puras (formatearHoraClinica, generarIdTurno, diaHabilDeFecha, compararTurnos) viven en
   ../compartido/reglasTurnos.js para que la interfaz las use sin importar este módulo. */

/**
 * La app móvil guarda `ubicacion` con las claves de expo-location (latitude/longitude),
 * mientras que el valor inicial usa latitud/longitud. Se aceptan ambas.
 * @returns {Ubicacion | null}
 */
export function normalizarUbicacion(ubicacion) {
  if (!ubicacion || typeof ubicacion !== 'object') return null;
  const latitud = ubicacion.latitud ?? ubicacion.latitude;
  const longitud = ubicacion.longitud ?? ubicacion.longitude;
  return typeof latitud === 'number' && typeof longitud === 'number' ? { latitud, longitud } : null;
}

/** Traduce cualquier error del servicio o de Firebase a un mensaje legible para el operador. */
export function mensajeDeError(error) {
  if (error instanceof AdminServiceError) return error.message;
  switch (error?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Correo o contraseña incorrectos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Espere unos minutos e intente nuevamente.';
    case 'auth/user-disabled':
      return 'Esta cuenta fue deshabilitada.';
    case 'auth/network-request-failed':
    case 'unavailable':
      return 'Sin conexión con el servidor. Verifique su red.';
    case 'permission-denied':
      return 'Permisos insuficientes: la cuenta no está habilitada como administradora.';
    default:
      return 'Ocurrió un error inesperado. Intente nuevamente.';
  }
}

/* ------------------------------------------------------------------ */
/* Autenticación administrativa                                        */
/* ------------------------------------------------------------------ */

/** Verifica que el UID exista en `administradores` con rol "admin". */
async function verificarAdministrador(uid) {
  try {
    const snap = await getDoc(doc(db, 'administradores', uid));
    return snap.exists() && snap.data()?.rol === 'admin';
  } catch (error) {
    // Las reglas permiten leer solo el propio documento; un rechazo equivale a "no es admin".
    if (error?.code === 'permission-denied') return false;
    throw error;
  }
}

/**
 * Inicia sesión y habilita el panel solo si el UID está en `administradores`.
 * Si no lo está, cierra la sesión inmediatamente y lanza AdminServiceError('NO_ADMIN').
 */
export async function iniciarSesionAdmin(correo, password) {
  if (!correo?.trim() || !password) {
    throw new AdminServiceError('DATOS_INVALIDOS', 'Ingrese su correo electrónico y contraseña.');
  }
  const { user } = await signInWithEmailAndPassword(auth, correo.trim(), password);
  if (!(await verificarAdministrador(user.uid))) {
    await signOut(auth);
    throw new AdminServiceError(
      'NO_ADMIN',
      'Esta cuenta no tiene permisos de administración para acceder al portal.'
    );
  }
  return { uid: user.uid, correo: user.email ?? '' };
}

/**
 * Observa la sesión de Firebase Auth. Emite `{estado: 'admin'}` solo si el usuario es administrador;
 * en cualquier otro caso emite `{estado: 'sin-sesion'}` (y cierra sesión si no era admin).
 * @param {(sesion: SesionAdmin) => void} callback
 * @returns {() => void} función para cancelar la suscripción
 */
export function observarSesionAdmin(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return callback({ estado: 'sin-sesion' });
    try {
      if (await verificarAdministrador(user.uid)) {
        return callback({ estado: 'admin', correo: user.email ?? '' });
      }
      await signOut(auth);
      return callback({ estado: 'sin-sesion', motivo: 'NO_ADMIN' });
    } catch (error) {
      return callback({ estado: 'sin-sesion', motivo: error?.code || 'ERROR' });
    }
  });
}

export async function cerrarSesionAdmin() {
  await signOut(auth);
}

/* ------------------------------------------------------------------ */
/* Turnos                                                              */
/* ------------------------------------------------------------------ */

/**
 * Suscripción en tiempo real a la colección `turnos`.
 * @param {(turnos: Turno[]) => void} onData
 * @param {(error: Error) => void} [onError]
 * @returns {() => void}
 */
export function suscribirTurnos(onData, onError) {
  return onSnapshot(
    collection(db, 'turnos'),
    (snapshot) => {
      /** @type {Turno[]} */
      const turnos = snapshot.docs.map((d) => /** @type {Turno} */ ({ ...d.data(), id: d.id }));
      onData(turnos.sort(compararTurnos));
    },
    onError
  );
}

/**
 * Alta de un turno con ID determinístico. La verificación de existencia y la escritura ocurren
 * dentro de una transacción, de modo que un alta simultánea (App móvil o segundo administrador)
 * no puede sobrescribir un turno existente.
 *
 * @param {Object} datos
 * @param {{ uid: string, dni: string }} datos.paciente
 * @param {string} datos.profesionalId   Ej.: 'p1'
 * @param {string} datos.especialidadId  Ej.: 'kinesio'
 * @param {string} datos.dia             'Lunes' ... 'Viernes'
 * @param {string} datos.bloque          Hora 24 h base, ej.: '09:00'
 * @returns {Promise<Turno>}
 */
export async function crearTurno({ paciente, profesionalId, especialidadId, dia, bloque }) {
  const profesional = PROFESIONALES_CLINICA.find((p) => p.id === profesionalId);
  const especialidad = ESPECIALIDADES_CLINICA.find((e) => e.id === especialidadId);

  if (!paciente?.uid) throw new AdminServiceError('DATOS_INVALIDOS', 'Seleccione un paciente.');
  if (!profesional) throw new AdminServiceError('DATOS_INVALIDOS', 'Seleccione un profesional.');
  if (!especialidad) throw new AdminServiceError('DATOS_INVALIDOS', 'Seleccione una especialidad.');
  if (!DIAS_HABILES_SEMANA.includes(dia)) {
    throw new AdminServiceError('DATOS_INVALIDOS', 'Seleccione un día hábil (lunes a viernes).');
  }
  if (!BLOQUES_HORARIOS_BASE.includes(bloque)) {
    throw new AdminServiceError('DATOS_INVALIDOS', 'Seleccione un horario válido.');
  }

  const hora = formatearHoraClinica(bloque);
  const turnoId = generarIdTurno(profesional.id, especialidad.nombre, dia, hora);
  const turnoRef = doc(db, 'turnos', turnoId);

  /** @type {Turno} */
  const nuevoTurno = {
    id: turnoId,
    pacienteUid: paciente.uid,
    pacienteDni: paciente.dni || 'Sin DNI',
    profesionalId: profesional.id,
    profesional: profesional.nombre,
    especialidad: especialidad.nombre,
    fecha: dia,
    hora,
    estado: 'reservado',
    creadoEn: new Date().toISOString(),
  };

  // Espejo público sin datos personales (lo leen los pacientes para calcular horarios libres).
  const ocupadoRef = doc(db, 'ocupados', turnoId);
  const ocupado = {
    id: turnoId,
    profesionalId: profesional.id,
    profesional: profesional.nombre,
    especialidad: especialidad.nombre,
    fecha: dia,
    hora,
  };

  await runTransaction(db, async (transaccion) => {
    const [turnoExistente, ocupadoExistente] = await Promise.all([
      transaccion.get(turnoRef),
      transaccion.get(ocupadoRef),
    ]);
    if (turnoExistente.exists() || ocupadoExistente.exists()) {
      throw new AdminServiceError(
        'TURNO_DUPLICADO',
        'Este horario ya fue reservado para este profesional y especialidad.'
      );
    }
    transaccion.set(turnoRef, nuevoTurno);
    transaccion.set(ocupadoRef, ocupado);
  });

  return nuevoTurno;
}

/** Cambia el estado de un turno (solo administradores según firestore.rules). */
export async function cambiarEstadoTurno(turnoId, estado) {
  if (!ESTADOS_TURNO.includes(estado)) {
    throw new AdminServiceError('ESTADO_INVALIDO', `Estado de turno no válido: ${estado}`);
  }
  await updateDoc(doc(db, 'turnos', turnoId), { estado });
}

/**
 * Elimina el turno y su documento de ocupación en un único lote (lo exigen las reglas de Firestore);
 * el ID determinístico vuelve a estar disponible.
 */
export async function liberarTurno(turnoId) {
  const lote = writeBatch(db);
  lote.delete(doc(db, 'turnos', turnoId));
  lote.delete(doc(db, 'ocupados', turnoId));
  await lote.commit();
}

/**
 * Crea los documentos `ocupados/{id}` que falten para turnos anteriores a la separación de datos
 * personales. Es idempotente y solo la pueden ejecutar los administradores.
 * @returns {Promise<number>} cantidad de documentos creados
 */
export async function repararOcupados() {
  const [turnosSnap, ocupadosSnap] = await Promise.all([
    getDocs(collection(db, 'turnos')),
    getDocs(collection(db, 'ocupados')),
  ]);
  const existentes = new Set(ocupadosSnap.docs.map((d) => d.id));
  const faltantes = turnosSnap.docs.filter((d) => !existentes.has(d.id));

  for (let i = 0; i < faltantes.length; i += 400) {
    const lote = writeBatch(db);
    faltantes.slice(i, i + 400).forEach((d) => {
      const t = d.data();
      lote.set(doc(db, 'ocupados', d.id), {
        id: d.id,
        profesionalId: t.profesionalId,
        profesional: t.profesional,
        especialidad: t.especialidad,
        fecha: t.fecha,
        hora: t.hora,
      });
    });
    await lote.commit();
  }
  return faltantes.length;
}

/* ------------------------------------------------------------------ */
/* Padrón de pacientes                                                 */
/* ------------------------------------------------------------------ */

/**
 * Suscripción en tiempo real al padrón `pacientes` (datos filiatorios, cobertura y GPS).
 * @param {(pacientes: Paciente[]) => void} onData
 * @param {(error: Error) => void} [onError]
 * @returns {() => void}
 */
export function suscribirPacientes(onData, onError) {
  return onSnapshot(
    collection(db, 'pacientes'),
    (snapshot) => {
      /** @type {Paciente[]} */
      const pacientes = snapshot.docs.map((d) => {
        const datos = d.data();
        return {
          uid: d.id,
          nombre: datos.nombre ?? '',
          correo: datos.correo ?? '',
          dni: datos.dni ?? '',
          telefono: datos.telefono ?? '',
          fechaNacimiento: datos.fechaNacimiento ?? '',
          obraSocial: datos.obraSocial ?? '',
          ubicacion: normalizarUbicacion(datos.ubicacion),
          emailVerificado: Boolean(datos.emailVerificado),
          fechaRegistro: datos.fechaRegistro ?? '',
        };
      });
      onData(pacientes.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
    },
    onError
  );
}

/* ------------------------------------------------------------------ */
/* Solicitudes de Certificado Único de Discapacidad (CUD)              */
/* ------------------------------------------------------------------ */

/**
 * Suscripción en tiempo real a `solicitudCUD` (una por paciente; el ID del documento es el UID del paciente).
 * @param {(solicitudes: SolicitudCud[]) => void} onData
 * @param {(error: Error) => void} [onError]
 * @returns {() => void}
 */
export function suscribirSolicitudesCud(onData, onError) {
  return onSnapshot(
    collection(db, 'solicitudCUD'),
    (snapshot) => {
      /** @type {SolicitudCud[]} */
      const solicitudes = snapshot.docs.map((d) => {
        const datos = d.data();
        return {
          pacienteUid: d.id,
          pacienteDni: datos.pacienteDni ?? '',
          estado: datos.estado ?? 'pendiente',
          creadoEn: datos.creadoEn ?? '',
          fechaJunta: datos.fechaJunta ?? '',
          horaJunta: datos.horaJunta ?? '',
          actualizadoEn: datos.actualizadoEn ?? '',
        };
      });
      onData(solicitudes.sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)));
    },
    onError
  );
}
/**
 * Cambia el estado de la solicitud de CUD de un paciente (solo administradores según firestore.rules).
 * Al aprobar es obligatorio indicar la fecha (AAAA-MM-DD) y la hora (HH:MM) de la Junta Evaluadora.
 * @param {string} pacienteUid
 * @param {{ estado: 'pendiente' | 'aprobada' | 'rechazada', fechaJunta?: string, horaJunta?: string }} cambio
 */
export async function cambiarEstadoSolicitudCud(pacienteUid, { estado, fechaJunta = '', horaJunta = '' }) {
  if (!ESTADOS_SOLICITUD_CUD.includes(estado)) {
    throw new AdminServiceError('ESTADO_INVALIDO', `Estado de solicitud no válido: ${estado}`);
  }
  const datos = { estado, actualizadoEn: new Date().toISOString() };
  if (estado === 'aprobada') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaJunta) || !/^\d{2}:\d{2}$/.test(horaJunta)) {
      throw new AdminServiceError('DATOS_INVALIDOS', 'Para aprobar la solicitud indique la fecha y la hora de la Junta Evaluadora.');
    }
    datos.fechaJunta = fechaJunta;
    datos.horaJunta = horaJunta;
  }
  await updateDoc(doc(db, 'solicitudCUD', pacienteUid), datos);
}