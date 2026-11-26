// Textos de las notificaciones push de la solicitud de CUD.
// Deben coincidir con `textoSolicitudActualizada` de src/compartido/reglasRecordatorios.js (lo verifica
// tests/recordatorios.test.mjs): la app y la Cloud Function son paquetes independientes.

const formatearFechaJunta = (iso) => {
  const fecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  return fecha ? `${fecha[3]}/${fecha[2]}/${fecha[1]}` : '';
};

/** Devuelve { titulo, cuerpo } para aprobada / rechazada y null mientras la solicitud siga pendiente. */
const armarMensajeSolicitud = (solicitud) => {
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

module.exports = { armarMensajeSolicitud, formatearFechaJunta };
