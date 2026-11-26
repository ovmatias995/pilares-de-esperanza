import { useEffect, useRef, useState } from 'react';

// BLOQUE FRONTEND — lógica de la solicitud del Certificado Único de Discapacidad (CUD).
// No importa Firebase ni UI: recibe sus dependencias por inyección desde useAppController.
//   solicitudCudService: servicios.solicitudCud (contrato en src/backend/index.js)
//   dialogos:            { aviso, confirmar }   (implementado en src/ui/dialogos/Dialogos.js)
//   notificaciones:      NotificacionesService  (src/frontend/dispositivo)

export const SOLICITUD_CUD_INICIAL = {
  cargando: true,
  enviada: false,
  estado: '',
  fecha: '',
  fechaJunta: '',
  horaJunta: ''
};

// Convierte la solicitud del backend (o null) en el estado que consume la interfaz.
const aEstadoPantalla = (solicitud) => ({
  cargando: false,
  enviada: Boolean(solicitud),
  estado: solicitud?.estado || '',
  fecha: solicitud?.creadoEn || '',
  fechaJunta: solicitud?.fechaJunta || '',
  horaJunta: solicitud?.horaJunta || ''
});

export const useSolicitudCud = ({
  solicitudCudService,
  dialogos,
  notificaciones,
  sesionIniciada,
  pushRemotoActivo,
  pacienteDni,
  mostrarCarga
}) => {
  const [solicitudCud, setSolicitudCud] = useState(SOLICITUD_CUD_INICIAL);
  const pushRemotoRef = useRef(pushRemotoActivo);
  pushRemotoRef.current = pushRemotoActivo;

  // Mientras hay sesión, escucha en tiempo real la solicitud: así el paciente ve el cambio de estado que hace
  // la administración sin recargar y se programa el recordatorio de la Junta Evaluadora.
  useEffect(() => {
    if (!sesionIniciada) {
      setSolicitudCud(SOLICITUD_CUD_INICIAL);
      return undefined;
    }

    let previa;
    const cancelar = solicitudCudService.observarMiSolicitud(
      (solicitud) => {
        setSolicitudCud(aEstadoPantalla(solicitud));
        notificaciones.sincronizarRecordatorioJunta(solicitud);
        // Si el dispositivo recibe push remoto, el aviso lo envía el servidor; si no (p. ej. Expo Go) se avisa
        // localmente, solo cuando el estado cambia mientras la app está abierta.
        const cambioDeEstado = previa && solicitud && previa.estado !== solicitud.estado;
        if (cambioDeEstado && !pushRemotoRef.current) notificaciones.avisarSolicitudActualizada(solicitud);
        previa = solicitud || null;
      },
      (error) => {
        console.log('Aviso al escuchar la solicitud de CUD:', error.message);
        setSolicitudCud(aEstadoPantalla(null));
      }
    );
    return cancelar;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesionIniciada]);

  // Pide confirmación y, si el paciente acepta, registra la solicitud (queda "pendiente").
  const solicitarCud = () => {
    if (solicitudCud.cargando || solicitudCud.enviada) return;
    dialogos.confirmar({
      titulo: '¿Desea enviar una solicitud de certificado?',
      textoCancelar: 'Cancelar',
      textoConfirmar: 'Aceptar',
      onConfirmar: async () => {
        mostrarCarga(true);
        try {
          await solicitudCudService.solicitar({ pacienteDni });
          dialogos.aviso('Solicitud enviada', 'Su solicitud de certificado fue registrada y será revisada por la administración de la clínica.');
        } catch (error) {
          dialogos.aviso('No se pudo enviar', error.message);
        }
        mostrarCarga(false);
      }
    });
  };

  return { solicitudCud, solicitarCud };
};
