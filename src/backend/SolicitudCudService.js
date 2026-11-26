import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase/FirebaseConfig';

const COLECCION = 'solicitudCUD';
const MENSAJE_DUPLICADA = 'Ya envió una solicitud de certificado. La administración de la clínica la está revisando.';

// `solicitudCUD/{uid}`: una única solicitud por paciente (el ID del documento es el UID del paciente),
// por lo que no puede enviarse dos veces. Las reglas de Firestore lo garantizan además del cliente.
export const SolicitudCudService = {
  /** Devuelve la solicitud del paciente autenticado o `null` si todavía no envió ninguna. */
  async obtenerMiSolicitud() {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Debe iniciar sesión para consultar su solicitud.');
    const snap = await getDoc(doc(db, COLECCION, uid));
    return snap.exists() ? snap.data() : null;
  },

  /**
   * Escucha en tiempo real la solicitud del paciente autenticado (la administración cambia su estado).
   * Llama a onData con la solicitud o con null si no existe. Devuelve la función para cancelar la suscripción.
   */
  observarMiSolicitud(onData, onError) {
    const uid = auth.currentUser?.uid;
    if (!uid) return () => {};
    return onSnapshot(
      doc(db, COLECCION, uid),
      (snap) => onData(snap.exists() ? snap.data() : null),
      onError
    );
  },

  /** Registra la solicitud con estado "pendiente". Rechaza si el paciente ya tiene una. */
  async solicitar({ pacienteDni }) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Debe iniciar sesión para enviar la solicitud.');

    const referencia = doc(db, COLECCION, uid);
    if ((await getDoc(referencia)).exists()) throw new Error(MENSAJE_DUPLICADA);

    const solicitud = {
      pacienteUid: uid,
      pacienteDni: String(pacienteDni || ''),
      estado: 'pendiente',
      creadoEn: new Date().toISOString()
    };

    try {
      await setDoc(referencia, solicitud);
    } catch (error) {
      // Si otra sesión la creó entre la lectura y la escritura, las reglas (update: false) rechazan el segundo intento.
      if (error?.code === 'permission-denied') throw new Error(MENSAJE_DUPLICADA);
      throw error;
    }
    return solicitud;
  }
};
