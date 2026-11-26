// Reglas de negocio puras (sin dependencias de UI ni de base de datos) compartidas por los tres bloques.
// El portal web mantiene una copia idéntica en AppWEB-claude/src/compartido/reglasTurnos.js.

// Agrega "AM" únicamente a horarios anteriores a las 12:00 (p. ej. "09:00" -> "09:00 AM", "14:00" -> "14:00").
export const formatearHoraClinica = (bloque24h) => {
  const horaNumerica = parseInt(bloque24h.split(':')[0], 10);
  return horaNumerica < 12 ? `${bloque24h} AM` : bloque24h;
};
