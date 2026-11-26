// Reglas de negocio puras (sin Firebase ni React) compartidas por backend, frontend y UI del portal.
// Deben mantenerse idénticas a src/compartido/reglasTurnos.js y src/backend/TurnosService.js de la app móvil.
import { DIAS_HABILES_SEMANA } from './catalogoClinica';

/** Agrega "AM" únicamente a horarios anteriores a las 12:00 (p. ej. "09:00" -> "09:00 AM"). */
export function formatearHoraClinica(bloque24h) {
  const horaNumerica = parseInt(bloque24h.split(':')[0], 10);
  return horaNumerica < 12 ? `${bloque24h} AM` : bloque24h;
}

/** ID determinístico del turno (mismo algoritmo que TurnosService.generarIdTurno de la app móvil). */
export function generarIdTurno(profesionalId, especialidad, fecha, hora) {
  const raw = `${profesionalId}_${especialidad}_${fecha}_${hora}`;
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/** Devuelve el nombre del día hábil de una fecha (Lunes a Viernes) o null si es fin de semana. */
export function diaHabilDeFecha(fecha) {
  const indice = fecha.getDay(); // 0 = domingo
  return indice >= 1 && indice <= 5 ? DIAS_HABILES_SEMANA[indice - 1] : null;
}

function horaAMinutos(hora) {
  const [h, m] = String(hora).slice(0, 5).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Orden de agenda: día hábil de la semana y luego hora. */
export function compararTurnos(a, b) {
  const dia = DIAS_HABILES_SEMANA.indexOf(a.fecha) - DIAS_HABILES_SEMANA.indexOf(b.fecha);
  return dia !== 0 ? dia : horaAMinutos(a.hora) - horaAMinutos(b.hora);
}
