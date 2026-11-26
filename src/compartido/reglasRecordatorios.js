// Reglas puras de notificaciones y recordatorios (sin Expo, sin Firebase, sin UI).
// Las usa el bloque frontend para programar avisos y el bloque UX/UI para mostrar fechas.
// La Cloud Function (functions/mensajes.js) mantiene una copia de los textos de la solicitud de CUD.

export const HORAS_ANTICIPACION = 3;

// Numeración de días de expo-notifications: 1 = domingo ... 7 = sábado.
const DIA_EXPO = { Lunes: 2, Martes: 3, 'Miércoles': 4, Jueves: 5, Viernes: 6 };

/** "09:00 AM" | "14:00" | "09:00" -> { hora: 9, minuto: 0 } (null si no tiene formato HH:MM). */
export const parsearHora = (texto) => {
  const coincidencia = /^(\d{2}):(\d{2})/.exec(String(texto || ''));
  if (!coincidencia) return null;
  const hora = Number(coincidencia[1]);
  const minuto = Number(coincidencia[2]);
  return hora < 24 && minuto < 60 ? { hora, minuto } : null;
};

/**
 * Disparo semanal del recordatorio de un turno, 3 horas antes (los turnos se repiten cada semana).
 * Devuelve { weekday, hour, minute, diaAnterior } o null si el día u hora no son válidos.
 * `diaAnterior` es true cuando el aviso cae el día previo (turnos de la madrugada).
 */
export const calcularDisparoSemanal = (dia, hora) => {
  const weekday = DIA_EXPO[dia];
  const parsed = parsearHora(hora);
  if (!weekday || !parsed) return null;

  let minutos = parsed.hora * 60 + parsed.minuto - HORAS_ANTICIPACION * 60;
  let diaDisparo = weekday;
  let diaAnterior = false;
  if (minutos < 0) {
    minutos += 24 * 60;
    diaDisparo = weekday === 1 ? 7 : weekday - 1;
    diaAnterior = true;
  }
  return { weekday: diaDisparo, hour: Math.floor(minutos / 60), minute: minutos % 60, diaAnterior };
};

/** Fecha y hora (local) del aviso previo a la Junta Evaluadora: 3 h antes. null si los datos no son válidos. */
export const calcularDisparoJunta = (fechaJunta, horaJunta) => {
  const fecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(fechaJunta || ''));
  const parsed = parsearHora(horaJunta);
  if (!fecha || !parsed) return null;
  return new Date(Number(fecha[1]), Number(fecha[2]) - 1, Number(fecha[3]), parsed.hora, parsed.minuto - HORAS_ANTICIPACION * 60);
};

/** "2026-12-15" -> "15/12/2026" (vacío si no es una fecha AAAA-MM-DD). */
export const formatearFechaJunta = (iso) => {
  const fecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  return fecha ? `${fecha[3]}/${fecha[2]}/${fecha[1]}` : '';
};

/** ISO 8601 -> "25/11/2026 13:48 hs" en hora local del dispositivo (vacío si la fecha no es válida). Sin Intl por compatibilidad con Hermes. */
export const formatearFechaHora = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dos = (n) => String(n).padStart(2, '0');
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()} ${dos(d.getHours())}:${dos(d.getMinutes())} hs`;
};

export const textoRecordatorioTurno =(turno, diaAnterior = false) => ({
  titulo: 'Recordatorio de turno',
  cuerpo: `${diaAnterior ? 'Mañana' : 'Hoy'} a las ${turno.hora} tiene su turno de ${turno.especialidad} con ${turno.profesional}.`
});

export const textoRecordatorioJunta = (solicitud) => ({
  titulo: 'Recordatorio: Junta Evaluadora del CUD',
  cuerpo: `Hoy a las ${solicitud.horaJunta} hs debe presentarse ante la Junta Evaluadora Interdisciplinaria.`
});

/** Texto del aviso cuando la administración cambia el estado de la solicitud. null si sigue pendiente. */
export const textoSolicitudActualizada = (solicitud) => {
  if (solicitud.estado === 'aprobada') {
    return {
      titulo: 'Solicitud de CUD aprobada',
      cuerpo: `Debe presentarse ante la Junta Evaluadora el ${formatearFechaJunta(solicitud.fechaJunta)} a las ${solicitud.horaJunta} hs.`
    };
  }
  if (solicitud.estado === 'rechazada') {
    return {
      titulo: 'Solicitud de CUD rechazada',
      cuerpo: 'Comuníquese con la administración de la clínica para más información.'
    };
  }
  return null;
};
