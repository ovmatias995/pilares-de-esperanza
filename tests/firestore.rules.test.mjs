// Pruebas de las reglas de Firestore (casos TC-042, TC-058 a TC-062 y concurrencia TC-032/TC-033 de docs/2-pruebas-y-trazabilidad/CASOS_DE_PRUEBA.md).
// No requieren credenciales reales: corren contra el Firebase Emulator con usuarios simulados.
// Ejecución (requiere Java 11+ instalado):  npm run test:rules
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';

let env;

const ID = 'p1_Kinesiolog_a_Lunes_09_00_AM';

const turno = (pacienteUid, extra = {}) => ({
  id: ID,
  pacienteUid,
  pacienteDni: '12345678',
  profesionalId: 'p1',
  profesional: 'Dr. Alejandro Soler',
  especialidad: 'Kinesiología',
  fecha: 'Lunes',
  hora: '09:00 AM',
  estado: 'reservado',
  creadoEn: new Date().toISOString(),
  ...extra,
});

const ocupado = (extra = {}) => ({
  id: ID,
  profesionalId: 'p1',
  profesional: 'Dr. Alejandro Soler',
  especialidad: 'Kinesiología',
  fecha: 'Lunes',
  hora: '09:00 AM',
  ...extra,
});

/** Alta de turno + ocupación en un único lote, como hacen la app y el portal. */
const reservar = (db, datosTurno, datosOcupado = ocupado(), id = ID) => {
  const lote = writeBatch(db);
  lote.set(doc(db, 'turnos', id), datosTurno);
  if (datosOcupado) lote.set(doc(db, 'ocupados', id), datosOcupado);
  return lote.commit();
};

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-pilares',
    firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') },
  });
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  // Datos base: un administrador, dos pacientes y un turno de A con su ocupación.
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'administradores', 'adm1'), { rol: 'admin' });
    await setDoc(doc(db, 'pacientes', 'pA'), { uid: 'pA', nombre: 'Paciente A' });
    await setDoc(doc(db, 'pacientes', 'pB'), { uid: 'pB', nombre: 'Paciente B' });
    await setDoc(doc(db, 'turnos', ID), turno('pA'));
    await setDoc(doc(db, 'ocupados', ID), ocupado());
  });
});

const comoAdmin = () => env.authenticatedContext('adm1').firestore();
const comoA = () => env.authenticatedContext('pA', { email_verified: true }).firestore();
const comoB = () => env.authenticatedContext('pB', { email_verified: true }).firestore();
const comoSinVerificar = () => env.authenticatedContext('pC', { email_verified: false }).firestore();
const sinSesion = () => env.unauthenticatedContext().firestore();

describe('administradores (TC-042, TC-059)', () => {
  it('un usuario lee su propio UID pero no el de otro', async () => {
    await assertSucceeds(getDoc(doc(comoA(), 'administradores', 'pA')));
    await assertFails(getDoc(doc(comoA(), 'administradores', 'adm1')));
  });
  it('el administrador lee solo su propio documento', async () => {
    await assertSucceeds(getDoc(doc(comoAdmin(), 'administradores', 'adm1')));
    await assertFails(getDoc(doc(comoAdmin(), 'administradores', 'pA')));
  });
  it('nadie escribe desde el cliente, ni siquiera un administrador', async () => {
    await assertFails(setDoc(doc(comoA(), 'administradores', 'pA'), { rol: 'admin' }));
    await assertFails(setDoc(doc(comoAdmin(), 'administradores', 'otro'), { rol: 'admin' }));
  });
});

describe('pacientes (TC-060)', () => {
  it('cada paciente accede solo a su ficha', async () => {
    await assertSucceeds(getDoc(doc(comoA(), 'pacientes', 'pA')));
    await assertFails(getDoc(doc(comoA(), 'pacientes', 'pB')));
    await assertFails(setDoc(doc(comoA(), 'pacientes', 'pB'), { nombre: 'x' }));
  });
  it('el administrador lee y escribe cualquier ficha', async () => {
    await assertSucceeds(getDoc(doc(comoAdmin(), 'pacientes', 'pB')));
    await assertSucceeds(updateDoc(doc(comoAdmin(), 'pacientes', 'pB'), { telefono: '1' }));
  });
  it('sin sesión no hay acceso', async () => {
    await assertFails(getDoc(doc(sinSesion(), 'pacientes', 'pA')));
  });
});

describe('turnos: lectura (TC-062)', () => {
  it('el paciente lee sus turnos y consulta por su UID', async () => {
    await assertSucceeds(getDoc(doc(comoA(), 'turnos', ID)));
    await assertSucceeds(getDocs(query(collection(comoA(), 'turnos'), where('pacienteUid', '==', 'pA'))));
  });
  it('el paciente NO lee turnos ajenos ni la colección completa', async () => {
    await assertFails(getDoc(doc(comoB(), 'turnos', ID)));
    await assertFails(getDocs(collection(comoB(), 'turnos')));
  });
  it('el administrador lee todos los turnos', async () => {
    await assertSucceeds(getDocs(collection(comoAdmin(), 'turnos')));
  });
  it('sin sesión no se lee nada', async () => {
    await assertFails(getDocs(collection(sinSesion(), 'turnos')));
    await assertFails(getDocs(collection(sinSesion(), 'ocupados')));
  });
});

describe('turnos: creación (TC-031, TC-061)', () => {
  const NUEVO = 'p2_Fisioterapia_Martes_14_00';
  const t = (uid, extra) => turno(uid, { id: NUEVO, fecha: 'Martes', hora: '14:00', especialidad: 'Fisioterapia', profesionalId: 'p2', ...extra });
  const o = (extra) => ocupado({ id: NUEVO, fecha: 'Martes', hora: '14:00', especialidad: 'Fisioterapia', profesionalId: 'p2', ...extra });

  it('el paciente reserva a su propio UID con turno y ocupación', async () => {
    await assertSucceeds(reservar(comoB(), t('pB'), o(), NUEVO));
  });
  it('un paciente con el correo sin verificar no puede reservar', async () => {
    await assertFails(reservar(comoSinVerificar(), t('pC'), o(), NUEVO));
  });
  it('el administrador agenda para cualquier paciente', async () => {
    await assertSucceeds(reservar(comoAdmin(), t('pB'), o(), NUEVO));
  });
  it('el paciente NO crea turnos a nombre de otro', async () => {
    await assertFails(reservar(comoB(), t('pA'), o(), NUEVO));
  });
  it('rechaza estado distinto de "reservado"', async () => {
    await assertFails(reservar(comoB(), t('pB', { estado: 'completado' }), o(), NUEVO));
  });
  it('rechaza campos adicionales o faltantes', async () => {
    await assertFails(reservar(comoB(), t('pB', { admin: true }), o(), NUEVO));
    const incompleto = t('pB');
    delete incompleto.pacienteDni;
    await assertFails(reservar(comoB(), incompleto, o(), NUEVO));
  });
  it('rechaza día no hábil, hora con formato inválido e id distinto del documento', async () => {
    await assertFails(reservar(comoB(), t('pB', { fecha: 'Sábado' }), o({ fecha: 'Sábado' }), NUEVO));
    await assertFails(reservar(comoB(), t('pB', { hora: '2pm' }), o({ hora: '2pm' }), NUEVO));
    await assertFails(reservar(comoB(), t('pB', { id: 'otro' }), o(), NUEVO));
  });
  it('rechaza un turno sin su documento de ocupación', async () => {
    await assertFails(reservar(comoB(), t('pB'), null, NUEVO));
  });
  it('rechaza una ocupación que no coincide con el turno o que incluye datos personales', async () => {
    await assertFails(reservar(comoB(), t('pB'), o({ hora: '16:00' }), NUEVO));
    await assertFails(reservar(comoB(), t('pB'), { ...o(), pacienteDni: '123' }, NUEVO));
  });
  it('sin sesión no se crean turnos', async () => {
    await assertFails(reservar(sinSesion(), t('pB'), o(), NUEVO));
  });
});

describe('turnos: concurrencia e integridad (TC-032, TC-033, TC-058)', () => {
  it('un segundo paciente no puede reservar un horario ya ocupado', async () => {
    await assertFails(reservar(comoB(), turno('pB')));
  });
  it('el paciente no puede sobrescribir ni actualizar un turno (ni el propio)', async () => {
    await assertFails(setDoc(doc(comoA(), 'turnos', ID), turno('pA', { estado: 'completado' })));
    await assertFails(updateDoc(doc(comoA(), 'turnos', ID), { estado: 'completado' }));
    await assertFails(updateDoc(doc(comoB(), 'turnos', ID), { estado: 'cancelado' }));
  });
  it('el administrador cambia únicamente el estado, a un valor válido', async () => {
    await assertSucceeds(updateDoc(doc(comoAdmin(), 'turnos', ID), { estado: 'completado' }));
    await assertFails(updateDoc(doc(comoAdmin(), 'turnos', ID), { estado: 'inventado' }));
    await assertFails(updateDoc(doc(comoAdmin(), 'turnos', ID), { pacienteUid: 'pB' }));
  });
});

describe('turnos: eliminación y liberación (TC-035, TC-051, TC-061)', () => {
  const liberar = (db) => {
    const lote = writeBatch(db);
    lote.delete(doc(db, 'turnos', ID));
    lote.delete(doc(db, 'ocupados', ID));
    return lote.commit();
  };
  it('el paciente cancela su turno (turno + ocupación en un lote)', async () => {
    await assertSucceeds(liberar(comoA()));
  });
  it('el administrador libera cualquier horario', async () => {
    await assertSucceeds(liberar(comoAdmin()));
  });
  it('un paciente no elimina turnos ajenos', async () => {
    await assertFails(liberar(comoB()));
  });
  it('no se puede eliminar el turno sin su ocupación (ni al revés)', async () => {
    await assertFails(deleteDoc(doc(comoA(), 'turnos', ID)));
    await assertFails(deleteDoc(doc(comoA(), 'ocupados', ID)));
  });
});

describe('solicitudCUD (TC-085)', () => {
  const solicitud = (uid, extra = {}) => ({
    pacienteUid: uid,
    pacienteDni: '12345678',
    estado: 'pendiente',
    creadoEn: new Date().toISOString(),
    ...extra,
  });

  it('el paciente crea su propia solicitud con estado "pendiente"', async () => {
    await assertSucceeds(setDoc(doc(comoA(), 'solicitudCUD', 'pA'), solicitud('pA')));
  });
  it('un paciente con el correo sin verificar no puede solicitar', async () => {
    await assertFails(setDoc(doc(comoSinVerificar(), 'solicitudCUD', 'pC'), solicitud('pC')));
  });
  it('no se crea una solicitud a nombre de otro paciente', async () => {
    await assertFails(setDoc(doc(comoB(), 'solicitudCUD', 'pA'), solicitud('pA')));
    await assertFails(setDoc(doc(comoB(), 'solicitudCUD', 'pB'), solicitud('pA')));
  });
  it('rechaza estado distinto de "pendiente", campos extra o faltantes', async () => {
    await assertFails(setDoc(doc(comoA(), 'solicitudCUD', 'pA'), solicitud('pA', { estado: 'aprobada' })));
    await assertFails(setDoc(doc(comoA(), 'solicitudCUD', 'pA'), solicitud('pA', { admin: true })));
    const incompleta = solicitud('pA');
    delete incompleta.pacienteDni;
    await assertFails(setDoc(doc(comoA(), 'solicitudCUD', 'pA'), incompleta));
  });
  it('no se puede enviar una segunda solicitud (el documento ya existe)', async () => {
    await assertSucceeds(setDoc(doc(comoA(), 'solicitudCUD', 'pA'), solicitud('pA')));
    await assertFails(setDoc(doc(comoA(), 'solicitudCUD', 'pA'), solicitud('pA')));
  });
  it('el paciente no modifica su solicitud y nadie la elimina, ni siquiera un administrador', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'solicitudCUD', 'pA'), solicitud('pA'));
    });
    await assertFails(updateDoc(doc(comoA(), 'solicitudCUD', 'pA'), { estado: 'aprobada', fechaJunta: '2026-12-15', horaJunta: '10:30' }));
    await assertFails(deleteDoc(doc(comoA(), 'solicitudCUD', 'pA')));
    await assertFails(deleteDoc(doc(comoAdmin(), 'solicitudCUD', 'pA')));
  });
  it('el paciente lee solo la suya; el administrador lee todas; sin sesión no se lee', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'solicitudCUD', 'pA'), solicitud('pA'));
    });
    await assertSucceeds(getDoc(doc(comoA(), 'solicitudCUD', 'pA')));
    await assertFails(getDoc(doc(comoB(), 'solicitudCUD', 'pA')));
    await assertFails(getDocs(collection(comoB(), 'solicitudCUD')));
    await assertSucceeds(getDocs(collection(comoAdmin(), 'solicitudCUD')));
    await assertFails(getDoc(doc(sinSesion(), 'solicitudCUD', 'pA')));
  });
});

describe('solicitudCUD: gestión del estado por la administración (TC-088)', () => {
  const base = { pacienteUid: 'pA', pacienteDni: '12345678', estado: 'pendiente', creadoEn: new Date().toISOString() };
  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'solicitudCUD', 'pA'), base);
    });
  });
  const ref = (db) => doc(db, 'solicitudCUD', 'pA');
  const ahora = () => new Date().toISOString();

  it('el administrador aprueba indicando fecha y hora de la junta', async () => {
    await assertSucceeds(updateDoc(ref(comoAdmin()), { estado: 'aprobada', fechaJunta: '2026-12-15', horaJunta: '10:30', actualizadoEn: ahora() }));
  });
  it('rechaza aprobar sin fecha/hora o con formato inválido', async () => {
    await assertFails(updateDoc(ref(comoAdmin()), { estado: 'aprobada', actualizadoEn: ahora() }));
    await assertFails(updateDoc(ref(comoAdmin()), { estado: 'aprobada', fechaJunta: '15/12/2026', horaJunta: '10:30', actualizadoEn: ahora() }));
    await assertFails(updateDoc(ref(comoAdmin()), { estado: 'aprobada', fechaJunta: '2026-12-15', horaJunta: '10am', actualizadoEn: ahora() }));
  });
  it('el administrador puede rechazar y volver a pendiente', async () => {
    await assertSucceeds(updateDoc(ref(comoAdmin()), { estado: 'rechazada', actualizadoEn: ahora() }));
    await assertSucceeds(updateDoc(ref(comoAdmin()), { estado: 'pendiente', actualizadoEn: ahora() }));
  });
  it('rechaza estados inventados y cambios en otros campos', async () => {
    await assertFails(updateDoc(ref(comoAdmin()), { estado: 'inventada' }));
    await assertFails(updateDoc(ref(comoAdmin()), { pacienteDni: '999' }));
    await assertFails(updateDoc(ref(comoAdmin()), { pacienteUid: 'pB' }));
  });
  it('un paciente no cambia el estado, ni de la propia solicitud ni de otra', async () => {
    await assertFails(updateDoc(ref(comoA()), { estado: 'aprobada', fechaJunta: '2026-12-15', horaJunta: '10:30' }));
    await assertFails(updateDoc(ref(comoB()), { estado: 'rechazada' }));
  });
  it('el paciente lee el cambio de estado de su solicitud', async () => {
    await updateDoc(ref(comoAdmin()), { estado: 'aprobada', fechaJunta: '2026-12-15', horaJunta: '10:30', actualizadoEn: ahora() });
    const snap = await getDoc(ref(comoA()));
    if (snap.data().estado !== 'aprobada') throw new Error('El paciente no ve el nuevo estado');
  });
});

describe('pacientes: token de notificaciones push (TC-089)', () => {
  it('el paciente guarda su token en su propia ficha y no en la de otro', async () => {
    await assertSucceeds(setDoc(doc(comoA(), 'pacientes', 'pA'), { pushToken: 'ExponentPushToken[abc]' }, { merge: true }));
    await assertFails(setDoc(doc(comoB(), 'pacientes', 'pA'), { pushToken: 'ExponentPushToken[robado]' }, { merge: true }));
  });
});

describe('ocupados (sin datos personales)', () => {
  it('cualquier autenticado lee la ocupación; sin sesión no', async () => {
    await assertSucceeds(getDocs(collection(comoB(), 'ocupados')));
    await assertFails(getDocs(collection(sinSesion(), 'ocupados')));
  });
  it('la ocupación no se actualiza', async () => {
    await assertFails(updateDoc(doc(comoA(), 'ocupados', ID), { hora: '10:30 AM' }));
    await assertFails(updateDoc(doc(comoAdmin(), 'ocupados', ID), { hora: '10:30 AM' }));
  });
  it('no se crea una ocupación sin turno asociado', async () => {
    await assertFails(setDoc(doc(comoB(), 'ocupados', 'p3_Hidroterapia_Jueves_11_00_AM'), ocupado({ id: 'p3_Hidroterapia_Jueves_11_00_AM' })));
  });
  it('el administrador repara una ocupación faltante de un turno existente', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await deleteDoc(doc(ctx.firestore(), 'ocupados', ID));
    });
    const db = comoAdmin(); // una única instancia: las referencias no se pueden mezclar entre instancias
    const lote = writeBatch(db);
    lote.set(doc(db, 'ocupados', ID), ocupado());
    await assertSucceeds(lote.commit());
  });
});
