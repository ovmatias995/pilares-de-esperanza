/**
 * Catálogo clínico del Portal Web Administrativo.
 *
 * IMPORTANTE: debe mantenerse idéntico a `src/constants/DatosClinica.js` de la app móvil.
 * El ID determinístico de cada turno se calcula con profesionalId + especialidad + día + hora;
 * si estos valores difieren entre la App y la Web, la protección anti doble-reserva deja de funcionar.
 */

export const DIAS_HABILES_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

/** Bloques base en formato 24 h (la regla AM se aplica en `formatearHoraClinica`). */
export const BLOQUES_HORARIOS_BASE = ['09:00', '10:30', '11:00', '14:00', '15:30', '16:00'];

export const ESPECIALIDADES_CLINICA = [
  { id: 'kinesio', nombre: 'Kinesiología' },
  { id: 'fisio', nombre: 'Fisioterapia' },
  { id: 'hidro', nombre: 'Hidroterapia' },
  { id: 'terapiaoc', nombre: 'Terapia Ocupacional' },
];

export const PROFESIONALES_CLINICA = [
  { id: 'p1', nombre: 'Dr. Alejandro Soler' },
  { id: 'p2', nombre: 'Dra. Eliana Ríos' },
  { id: 'p3', nombre: 'Lic. Marcos Paz' },
];

export const ESTADOS_TURNO = ['reservado', 'completado', 'cancelado'];
