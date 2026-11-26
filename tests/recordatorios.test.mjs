// Pruebas de las reglas puras de recordatorios (TC-091). No requieren Firebase ni dispositivo.
// Ejecución:  npm run test:logica
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// `src/` es código de la app (el package.json raíz es CommonJS y Metro lo empaqueta como ESM): se carga el
// módulo como ESM desde su texto, sin modificar la configuración del proyecto.
const origen = readFileSync(new URL('../src/compartido/reglasRecordatorios.js', import.meta.url), 'utf8');
const {
  calcularDisparoJunta,
  calcularDisparoSemanal,
  formatearFechaHora,
  formatearFechaJunta,
  parsearHora,
  textoRecordatorioTurno,
  textoSolicitudActualizada
} = await import('data:text/javascript;base64,' + Buffer.from(origen).toString('base64'));

const { armarMensajeSolicitud } = createRequire(import.meta.url)('../functions/mensajes.js');

describe('formatearFechaHora (TC-099: fecha y hora de registro de la solicitud)', () => {
  it('muestra DD/MM/AAAA HH:MM hs en hora local, con ceros a la izquierda', () => {
    assert.equal(formatearFechaHora(new Date(2026, 10, 5, 9, 7).toISOString()), '05/11/2026 09:07 hs');
    assert.equal(formatearFechaHora(new Date(2026, 11, 25, 23, 59).toISOString()), '25/12/2026 23:59 hs');
  });
  it('devuelve vacío ante una fecha inválida o ausente (nunca "//")', () => {
    assert.equal(formatearFechaHora('basura'), '');
    assert.equal(formatearFechaHora(''), '');
    assert.equal(formatearFechaHora(undefined), '');
  });
});

describe('parsearHora', () => {
  it('acepta HH:MM con o sin sufijo AM', () => {
    assert.deepEqual(parsearHora('09:00 AM'), { hora: 9, minuto: 0 });
    assert.deepEqual(parsearHora('14:30'), { hora: 14, minuto: 30 });
  });
  it('rechaza textos inválidos', () => {
    assert.equal(parsearHora('9am'), null);
    assert.equal(parsearHora('25:00'), null);
    assert.equal(parsearHora(undefined), null);
  });
});

describe('calcularDisparoSemanal (3 horas antes)', () => {
  it('turno del lunes 09:00 AM -> lunes 06:00 (expo: lunes = 2)', () => {
    assert.deepEqual(calcularDisparoSemanal('Lunes', '09:00 AM'), { weekday: 2, hour: 6, minute: 0, diaAnterior: false });
  });
  it('turno del viernes 16:00 -> viernes 13:00', () => {
    assert.deepEqual(calcularDisparoSemanal('Viernes', '16:00'), { weekday: 6, hour: 13, minute: 0, diaAnterior: false });
  });
  it('respeta los minutos', () => {
    assert.deepEqual(calcularDisparoSemanal('Miércoles', '10:30 AM'), { weekday: 4, hour: 7, minute: 30, diaAnterior: false });
  });
  it('turno de madrugada: el aviso cae el día anterior', () => {
    assert.deepEqual(calcularDisparoSemanal('Lunes', '02:00 AM'), { weekday: 1, hour: 23, minute: 0, diaAnterior: true });
  });
  it('día u hora inválidos -> null', () => {
    assert.equal(calcularDisparoSemanal('Sábado', '10:00 AM'), null);
    assert.equal(calcularDisparoSemanal('Lunes', 'mediodía'), null);
  });
});

describe('calcularDisparoJunta', () => {
  it('devuelve la fecha local tres horas antes', () => {
    const d = calcularDisparoJunta('2026-12-15', '10:30');
    assert.equal(d.getFullYear(), 2026);
    assert.equal(d.getMonth(), 11);
    assert.equal(d.getDate(), 15);
    assert.equal(d.getHours(), 7);
    assert.equal(d.getMinutes(), 30);
  });
  it('cruza el día cuando corresponde', () => {
    const d = calcularDisparoJunta('2026-12-15', '01:00');
    assert.equal(d.getDate(), 14);
    assert.equal(d.getHours(), 22);
  });
  it('datos inválidos -> null', () => {
    assert.equal(calcularDisparoJunta('15/12/2026', '10:30'), null);
    assert.equal(calcularDisparoJunta('2026-12-15', ''), null);
  });
});

describe('textos', () => {
  it('formatea la fecha de la junta', () => {
    assert.equal(formatearFechaJunta('2026-12-15'), '15/12/2026');
    assert.equal(formatearFechaJunta('basura'), '');
  });
  it('aviso de solicitud aprobada incluye fecha y hora', () => {
    const t = textoSolicitudActualizada({ estado: 'aprobada', fechaJunta: '2026-12-15', horaJunta: '10:30' });
    assert.equal(t.titulo, 'Solicitud de CUD aprobada');
    assert.match(t.cuerpo, /15\/12\/2026/);
    assert.match(t.cuerpo, /10:30 hs/);
  });
  it('aviso de rechazo y ausencia de aviso mientras está pendiente', () => {
    assert.equal(textoSolicitudActualizada({ estado: 'rechazada' }).titulo, 'Solicitud de CUD rechazada');
    assert.equal(textoSolicitudActualizada({ estado: 'pendiente' }), null);
  });
  it('recordatorio de turno menciona hora, especialidad y profesional', () => {
    const t = textoRecordatorioTurno({ hora: '09:00 AM', especialidad: 'Kinesiología', profesional: 'Dr. Alejandro Soler' });
    assert.match(t.cuerpo, /Hoy a las 09:00 AM/);
    assert.match(t.cuerpo, /Kinesiología/);
    assert.match(textoRecordatorioTurno({ hora: '02:00 AM', especialidad: 'x', profesional: 'y' }, true).cuerpo, /^Mañana/);
  });
});

describe('Cloud Function: mismos textos que la app', () => {
  const casos = [
    { estado: 'aprobada', fechaJunta: '2026-12-15', horaJunta: '10:30' },
    { estado: 'rechazada' },
    { estado: 'pendiente' }
  ];
  for (const solicitud of casos) {
    it(`coincide para el estado "${solicitud.estado}"`, () => {
      assert.deepEqual(armarMensajeSolicitud(solicitud), textoSolicitudActualizada(solicitud));
    });
  }
});