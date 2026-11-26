import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/FirebaseConfig';

const errorConCodigo = (codigo, mensaje) => {
  const error = new Error(mensaje);
  error.code = codigo;
  return error;
};

// Traduce los errores propios de Firebase Auth a mensajes en español con un código neutro (el frontend no conoce Firebase).
const traducirErrorAuth = (error) => {
  switch (error?.code) {
    case 'auth/invalid-email':
      return errorConCodigo('CORREO_INVALIDO', 'El correo electrónico no tiene un formato válido.');
    case 'auth/weak-password':
      return errorConCodigo('PASSWORD_DEBIL', 'La contraseña debe tener al menos 6 caracteres.');
    case 'auth/network-request-failed':
      return errorConCodigo('SIN_CONEXION', 'No hay conexión a internet. Revise su red e intente nuevamente.');
    case 'auth/too-many-requests':
      return errorConCodigo('DEMASIADOS_INTENTOS', 'Demasiados intentos seguidos. Espere unos minutos e intente nuevamente.');
    default:
      return error;
  }
};

// Códigos con los que Firebase indica que la cuenta guardada en el dispositivo ya no existe o no es válida.
const CUENTA_INVALIDA = ['auth/user-not-found', 'auth/user-token-expired', 'auth/user-disabled', 'auth/invalid-user-token'];

export const PacienteService = {
  // Crea la cuenta y envía el correo de verificación. Si el correo ya fue usado en un registro que quedó a medias
  // (la app se cerró antes de terminar), retoma ese registro con la misma contraseña en lugar de bloquear al paciente.
  // Devuelve { user, reanudado, verificado }.
  async iniciarRegistroYEnviarCorreo(correo, password) {
    const correoLimpio = correo.trim();
    try {
      const credenciales = await createUserWithEmailAndPassword(auth, correoLimpio, password);
      await sendEmailVerification(credenciales.user);
      return { user: credenciales.user, reanudado: false, verificado: false };
    } catch (error) {
      if (error?.code !== 'auth/email-already-in-use') throw traducirErrorAuth(error);
    }

    let credenciales;
    try {
      credenciales = await signInWithEmailAndPassword(auth, correoLimpio, password);
    } catch (error) {
      if (error?.code === 'auth/network-request-failed') throw traducirErrorAuth(error);
      throw errorConCodigo(
        'CORREO_EN_USO',
        'Este correo ya tiene un registro iniciado. Si es suyo, escriba la misma contraseña con la que lo comenzó o use "¿Olvidó su contraseña?" en Iniciar Sesión.'
      );
    }

    try {
      await credenciales.user.reload();
      if (credenciales.user.emailVerified) await credenciales.user.getIdToken(true);
    } catch (error) {
      // Sin conexión momentánea: se continúa con los datos locales.
    }
    let tienePerfil = false;
    try {
      tienePerfil = (await getDoc(doc(db, 'pacientes', credenciales.user.uid))).exists();
    } catch (error) {
      // Si no se puede consultar, se asume que el registro quedó incompleto.
    }
    if (tienePerfil) {
      await signOut(auth);
      throw errorConCodigo('CUENTA_YA_REGISTRADA', 'Este correo ya tiene una cuenta completa. Use "Iniciar Sesión".');
    }
    if (!credenciales.user.emailVerified) {
      try {
        await sendEmailVerification(credenciales.user);
      } catch (error) {
        // Firebase limita la frecuencia de reenvíos; sirve el enlace ya recibido.
      }
    }
    return { user: credenciales.user, reanudado: true, verificado: credenciales.user.emailVerified };
  },

  // Al abrir la app: devuelve la sesión guardada en el dispositivo (o null) con el estado de verificación y el perfil.
  async restaurarSesion() {
    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user) return null;
    try {
      await user.reload();
    } catch (error) {
      if (CUENTA_INVALIDA.includes(error?.code)) {
        await signOut(auth);
        return null;
      }
      // Sin conexión: se usan los datos guardados.
    }
    if (user.emailVerified) {
      try {
        // Renueva el token: si el correo se verificó con la app cerrada, el token guardado aún dice "no verificado"
        // y las reglas de Firestore rechazarían la reserva de turnos hasta que venza.
        await user.getIdToken(true);
      } catch (error) {
        // Sin conexión: se usa el token guardado.
      }
    }
    let perfil = null;
    let perfilNoDisponible = false;
    try {
      const docSnap = await getDoc(doc(db, 'pacientes', user.uid));
      perfil = docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      perfilNoDisponible = true;
    }
    return { user, verificado: user.emailVerified, perfil, perfilNoDisponible };
  },

  async comprobarVerificacionCorreo() {
    if (!auth.currentUser) throw new Error('No hay una sesión de registro activa.');
    await auth.currentUser.reload();
    if (auth.currentUser.emailVerified) {
      // Renueva el token para que las reglas de Firestore vean `email_verified = true` de inmediato.
      await auth.currentUser.getIdToken(true);
    }
    return auth.currentUser.emailVerified;
  },

  async reenviarCorreoVerificacion() {
    if (!auth.currentUser) throw new Error('No hay un usuario activo para reenviar el correo.');
    await sendEmailVerification(auth.currentUser);
  },

  async registrarPacienteServidor(formulario, coordenadas) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado.');

    const datosPaciente = {
      uid: user.uid,
      nombre: formulario.nombre,
      correo: formulario.correo.trim(),
      dni: formulario.dni,
      telefono: formulario.telefono,
      fechaNacimiento: formulario.fecha,
      obraSocial: formulario.obraSocial || 'Particular',
      ubicacion: coordenadas,
      emailVerificado: user.emailVerified,
      fechaRegistro: new Date().toISOString()
    };

    await setDoc(doc(db, 'pacientes', user.uid), datosPaciente);
    return datosPaciente;
  },

  async iniciarSesion(correo, password) {
    let credenciales;
    try {
      credenciales = await signInWithEmailAndPassword(auth, correo.trim(), password);
    } catch (error) {
      throw error?.code === 'auth/network-request-failed' ? traducirErrorAuth(error) : error;
    }

    // Solo ingresan cuentas con el correo verificado: si no lo está, se reenvía el enlace y se cierra la sesión.
    if (!credenciales.user.emailVerified) {
      try {
        await sendEmailVerification(credenciales.user);
      } catch (error) {
        // Firebase limita la frecuencia de reenvíos; el usuario puede usar el enlace ya recibido.
      }
      await signOut(auth);
      const errorVerificacion = new Error('El correo electrónico aún no fue verificado.');
      errorVerificacion.code = 'EMAIL_NO_VERIFICADO';
      throw errorVerificacion;
    }

    const docSnap = await getDoc(doc(db, 'pacientes', credenciales.user.uid));
    return {
      user: credenciales.user,
      perfil: docSnap.exists() ? docSnap.data() : null
    };
  },

  // Guarda el token de notificaciones push del dispositivo en la ficha del paciente (lo usa la Cloud Function).
  async guardarTokenPush(token) {
    const user = auth.currentUser;
    if (!user || !token) return;
    await setDoc(doc(db, 'pacientes', user.uid), { pushToken: token, pushTokenActualizadoEn: new Date().toISOString() }, { merge: true });
  },

  async recuperarPassword(correo) {
    await sendPasswordResetEmail(auth, correo.trim());
  },

  async cerrarSesion() {
    await signOut(auth);
  }
};