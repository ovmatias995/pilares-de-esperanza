import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from './firebase/FirebaseConfig';

const MENSAJE_HORARIO_OCUPADO = 'Este horario ya fue reservado para este profesional y especialidad.';

// `turnos/{id}` guarda datos personales (solo lo leen su dueño y la administración).
// `ocupados/{id}` es su espejo público SIN datos personales: sirve para calcular los horarios libres.
// Ambos documentos se crean y se eliminan juntos en un writeBatch (lo exigen las reglas de Firestore).
export const TurnosService = {
  generarIdTurno(profesionalId, especialidad, fecha, hora) {
    const raw = `${profesionalId}_${especialidad}_${fecha}_${hora}`;
    return raw.replace(/[^a-zA-Z0-9_-]/g, '_');
  },

  async reservarTurno({ pacienteDni, profesionalId, profesionalNombre, especialidad, fecha, hora }) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Debe iniciar sesión para reservar un turno.');

    const turnoId = this.generarIdTurno(profesionalId, especialidad, fecha, hora);
    const turnoRef = doc(db, 'turnos', turnoId);
    const ocupadoRef = doc(db, 'ocupados', turnoId);

    const existente = await getDoc(ocupadoRef);
    if (existente.exists()) {
      throw new Error(MENSAJE_HORARIO_OCUPADO);
    }

    const nuevoTurno = {
      id: turnoId,
      pacienteUid: uid,
      pacienteDni: pacienteDni || 'Sin DNI',
      profesionalId,
      profesional: profesionalNombre,
      especialidad,
      fecha,
      hora,
      estado: 'reservado',
      creadoEn: new Date().toISOString()
    };
    const ocupado = { id: turnoId, profesionalId, profesional: profesionalNombre, especialidad, fecha, hora };

    try {
      const lote = writeBatch(db);
      lote.set(turnoRef, nuevoTurno);
      lote.set(ocupadoRef, ocupado);
      await lote.commit();
    } catch (error) {
      // Si otro cliente reservó el mismo horario entre la lectura y la escritura, las reglas rechazan el lote.
      if (error?.code === 'permission-denied') throw new Error(MENSAJE_HORARIO_OCUPADO);
      throw error;
    }
    return nuevoTurno;
  },

  async obtenerTurnosOcupados() {
    const snapshot = await getDocs(collection(db, 'ocupados'));
    return snapshot.docs.map(d => d.data());
  },

  async obtenerTurnosPaciente() {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    const q = query(collection(db, 'turnos'), where('pacienteUid', '==', uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data());
  },

  async cancelarTurno(turnoId) {
    const lote = writeBatch(db);
    lote.delete(doc(db, 'turnos', turnoId));
    lote.delete(doc(db, 'ocupados', turnoId));
    await lote.commit();
  }
};
