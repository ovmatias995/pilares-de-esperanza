import { useEffect, useState } from "react";
import { mensajeDeError, observarSesionAdmin, repararOcupados, suscribirPacientes, suscribirSolicitudesCud, suscribirTurnos } from "../servicios";
import type { Paciente, SesionAdmin, SolicitudCud, Turno } from "../servicios";

// BLOQUE FRONTEND (lógica): sesión del administrador y datos en tiempo real.
// No contiene JSX ni importa nada de `ui/` o `backend/`; accede a los datos solo a través de `../servicios`.
export function useDatosAdmin() {
  const [sesion, setSesion] = useState<SesionAdmin | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [solicitudesCud, setSolicitudesCud] = useState<SolicitudCud[]>([]);
  const [datosError, setDatosError] = useState("");

  const esAdmin = sesion?.estado === "admin";

  useEffect(() => observarSesionAdmin(setSesion), []);

  useEffect(() => {
    if (!esAdmin) {
      setPacientes([]);
      setTurnos([]);
      setSolicitudesCud([]);
      return;
    }
    setDatosError("");
    const alFallar = (error: Error) => setDatosError(mensajeDeError(error));
    const cancelarTurnos = suscribirTurnos(setTurnos, alFallar);
    const cancelarPacientes = suscribirPacientes(setPacientes, alFallar);
    const cancelarSolicitudes = suscribirSolicitudesCud(setSolicitudesCud, alFallar);
    // Migración silenciosa: genera los documentos públicos de ocupación de turnos anteriores.
    repararOcupados().catch((error) => console.warn("No se pudo sincronizar la ocupación de horarios:", error));
    return () => {
      cancelarTurnos();
      cancelarPacientes();
      cancelarSolicitudes();
    };
  }, [esAdmin]);

  return { sesion, pacientes, turnos, solicitudesCud, datosError };
}
