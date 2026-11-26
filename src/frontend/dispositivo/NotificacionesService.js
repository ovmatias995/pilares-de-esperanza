import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import {
  calcularDisparoJunta,
  calcularDisparoSemanal,
  textoRecordatorioJunta,
  textoRecordatorioTurno,
  textoSolicitudActualizada
} from '../../compartido/reglasRecordatorios';

// BLOQUE FRONTEND — acceso a las notificaciones del dispositivo (expo-notifications).
// Los textos y los horarios los calculan las reglas puras de `compartido/reglasRecordatorios.js`.
// Ninguna función lanza excepciones: si las notificaciones no están disponibles (permiso denegado, Expo Go,
// emulador) la app sigue funcionando sin avisos.

const CANAL = 'default';
const PREFIJO_TURNO = 'turno-';
const ID_JUNTA = 'junta-cud';

let configurado = false;
let permiso = false;
let inicio = null; // promesa memoizada: el permiso y el token se piden una sola vez por sesión

const configurar = async () => {
  if (configurado) return;
  configurado = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false })
  });
  try {
    // En iOS no hace nada; en Android crea el canal con el que se muestran los avisos.
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Avisos de la clínica',
      importance: Notifications.AndroidImportance.HIGH
    });
  } catch (error) {
    console.log('Aviso al crear el canal de notificaciones:', error.message);
  }
};

const solicitarPermiso = async () => {
  const actual = await Notifications.getPermissionsAsync();
  if (actual.granted) return true;
  if (actual.canAskAgain === false) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
};

const cancelarProgramadas = async (coincide) => {
  const programadas = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    programadas.filter((n) => coincide(n.identifier)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
};

const iniciarNotificaciones = async () => {
  try {
    await configurar();
    permiso = await solicitarPermiso();
    if (!permiso) return { permiso: false, token: null };

    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) return { permiso: true, token: null };
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { permiso: true, token: data };
  } catch (error) {
    console.log('Aviso al iniciar las notificaciones:', error.message);
    return { permiso, token: null };
  }
};

const iniciarUnaVez = () => {
  if (!inicio) inicio = iniciarNotificaciones();
  return inicio;
};

export const NotificacionesService = {
  /**
   * Configura las notificaciones, pide el permiso y obtiene el token de notificaciones push remotas.
   * Devuelve { permiso: boolean, token: string | null }. El token es null cuando no hay permiso, cuando la app
   * corre en Expo Go o cuando el proyecto no tiene un `projectId` de EAS configurado.
   */
  iniciar() {
    return iniciarUnaVez();
  },

  /**
   * Programa, para cada turno reservado, un recordatorio semanal 3 horas antes (los turnos se repiten cada
   * semana en el mismo día y horario). Reemplaza los recordatorios anteriores: es idempotente.
   */
  async sincronizarRecordatoriosTurnos(turnos) {
    try {
      await iniciarUnaVez();
      await cancelarProgramadas((id) => id.startsWith(PREFIJO_TURNO));
      if (!permiso) return 0;

      let programados = 0;
      for (const turno of turnos.filter((t) => t.estado === 'reservado')) {
        const disparo = calcularDisparoSemanal(turno.fecha, turno.hora);
        if (!disparo) continue;
        const { titulo, cuerpo } = textoRecordatorioTurno(turno, disparo.diaAnterior);
        await Notifications.scheduleNotificationAsync({
          identifier: `${PREFIJO_TURNO}${turno.id}`,
          content: { title: titulo, body: cuerpo, sound: true, data: { tipo: 'turno', turnoId: turno.id } },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: disparo.weekday,
            hour: disparo.hour,
            minute: disparo.minute,
            channelId: CANAL
          }
        });
        programados += 1;
      }
      return programados;
    } catch (error) {
      console.log('Aviso al programar los recordatorios de turnos:', error.message);
      return 0;
    }
  },

  async cancelarRecordatoriosTurnos() {
    try {
      await cancelarProgramadas((id) => id.startsWith(PREFIJO_TURNO));
    } catch (error) {
      console.log('Aviso al cancelar los recordatorios de turnos:', error.message);
    }
  },

  /** Recordatorio único 3 horas antes de la Junta Evaluadora del CUD (solo si la solicitud está aprobada y la fecha es futura). */
  async sincronizarRecordatorioJunta(solicitud) {
    try {
      await iniciarUnaVez();
      await cancelarProgramadas((id) => id === ID_JUNTA);
      if (!permiso || !solicitud || solicitud.estado !== 'aprobada') return false;

      const disparo = calcularDisparoJunta(solicitud.fechaJunta, solicitud.horaJunta);
      if (!disparo || disparo.getTime() <= Date.now()) return false;

      const { titulo, cuerpo } = textoRecordatorioJunta(solicitud);
      await Notifications.scheduleNotificationAsync({
        identifier: ID_JUNTA,
        content: { title: titulo, body: cuerpo, sound: true, data: { tipo: 'junta' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: disparo, channelId: CANAL }
      });
      return true;
    } catch (error) {
      console.log('Aviso al programar el recordatorio de la junta:', error.message);
      return false;
    }
  },

  /** Aviso inmediato en el dispositivo cuando cambia el estado de la solicitud (aprobada o rechazada). */
  async avisarSolicitudActualizada(solicitud) {
    try {
      await iniciarUnaVez();
      const texto = textoSolicitudActualizada(solicitud);
      if (!permiso || !texto) return false;
      await Notifications.scheduleNotificationAsync({
        content: { title: texto.titulo, body: texto.cuerpo, sound: true, data: { tipo: 'solicitudCud', estado: solicitud.estado } },
        trigger: null
      });
      return true;
    } catch (error) {
      console.log('Aviso al notificar la solicitud:', error.message);
      return false;
    }
  },

  /** Cancela todos los avisos programados (al cerrar sesión). */
  async cancelarTodo() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      inicio = null; // el próximo inicio de sesión vuelve a registrar el token del nuevo usuario
    } catch (error) {
      console.log('Aviso al cancelar las notificaciones:', error.message);
    }
  }
};
