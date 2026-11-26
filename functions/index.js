// BLOQUE BACKEND — Cloud Function que envía la notificación push cuando la administración cambia el estado
// de una solicitud de CUD. Lee el token del dispositivo guardado en `pacientes/{uid}.pushToken` y lo envía
// por el servicio de Expo. No contiene lógica de interfaz ni de la app.
//
// Requiere el plan Blaze de Firebase y una compilación de desarrollo / producción de la app (Expo Go ya no
// recibe notificaciones push remotas en Android). Despliegue:  firebase deploy --only functions
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { logger } = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { armarMensajeSolicitud } = require('./mensajes');

initializeApp();

const URL_PUSH_EXPO = 'https://exp.host/--/api/v2/push/send';

exports.notificarCambioSolicitudCud = onDocumentUpdated('solicitudCUD/{pacienteUid}', async (evento) => {
  const antes = evento.data.before.data();
  const despues = evento.data.after.data();
  if (antes.estado === despues.estado) return; // solo importa el cambio de estado

  const mensaje = armarMensajeSolicitud(despues);
  if (!mensaje) return; // volvió a "pendiente": no se avisa

  const paciente = await getFirestore().doc(`pacientes/${evento.params.pacienteUid}`).get();
  const token = paciente.exists ? paciente.data().pushToken : null;
  if (!token) {
    logger.info('El paciente no tiene token de notificaciones; no se envía el push.', { pacienteUid: evento.params.pacienteUid });
    return;
  }

  const respuesta = await fetch(URL_PUSH_EXPO, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      to: token,
      title: mensaje.titulo,
      body: mensaje.cuerpo,
      sound: 'default',
      channelId: 'default',
      data: { tipo: 'solicitudCud', estado: despues.estado }
    })
  });
  logger.info('Push enviado', { estado: despues.estado, http: respuesta.status, cuerpo: await respuesta.text() });
});
