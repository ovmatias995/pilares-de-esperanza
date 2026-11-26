import { FormEvent, useEffect, useState } from "react";
import { mensajeDeError } from "../servicios";
import type { SolicitudCud } from "../servicios";

export type CambioSolicitudCud = { estado: SolicitudCud["estado"]; fechaJunta: string; horaJunta: string };

type Props = {
  solicitud: SolicitudCud;
  /** Debe lanzar una excepción si no se pudo guardar el cambio. */
  onGuardar: (cambio: CambioSolicitudCud) => Promise<void>;
};

const etiquetaEstado: Record<SolicitudCud["estado"], string> = {
  pendiente: "Pendiente de revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};
const tonoEstado: Record<SolicitudCud["estado"], string> = { pendiente: "warning", aprobada: "success", rechazada: "muted" };

function formatFecha(iso: string) {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? "—" : new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(fecha);
}

/** Datos de la solicitud de CUD de un paciente y formulario para que la administración cambie su estado. */
export default function PanelSolicitudCud({ solicitud, onGuardar }: Props) {
  const [estado, setEstado] = useState<SolicitudCud["estado"]>(solicitud.estado);
  const [fechaJunta, setFechaJunta] = useState(solicitud.fechaJunta ?? "");
  const [horaJunta, setHoraJunta] = useState(solicitud.horaJunta ?? "");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Si el estado cambia desde otra sesión, el formulario refleja el valor vigente.
  useEffect(() => {
    setEstado(solicitud.estado);
    setFechaJunta(solicitud.fechaJunta ?? "");
    setHoraJunta(solicitud.horaJunta ?? "");
  }, [solicitud.estado, solicitud.fechaJunta, solicitud.horaJunta]);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await onGuardar({ estado, fechaJunta: estado === "aprobada" ? fechaJunta : "", horaJunta: estado === "aprobada" ? horaJunta : "" });
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  }

  const sinCambios = estado === solicitud.estado && (estado !== "aprobada" || (fechaJunta === solicitud.fechaJunta && horaJunta === solicitud.horaJunta));

  return (
    <div>
      <div className="detail-grid">
        <div><span>Estado actual</span><strong><span className={`status-badge ${tonoEstado[solicitud.estado] ?? "muted"}`}>{etiquetaEstado[solicitud.estado] ?? solicitud.estado}</span></strong></div>
        <div><span>Fecha de solicitud</span><strong>{formatFecha(solicitud.creadoEn)}</strong></div>
        <div><span>DNI declarado</span><strong>{solicitud.pacienteDni || "No registrado"}</strong></div>
        {solicitud.estado === "aprobada" && <div><span>Junta Evaluadora</span><strong>{(solicitud.fechaJunta ?? "").split("-").reverse().join("/")} · {solicitud.horaJunta} hs</strong></div>}
        {solicitud.actualizadoEn && <div><span>Última actualización</span><strong>{formatFecha(solicitud.actualizadoEn)}</strong></div>}
      </div>

      <form onSubmit={guardar} style={{ marginTop: 20 }}>
        <p className="security-note"><strong>Gestión del trámite:</strong> al cambiar el estado, el paciente lo ve en la app y recibe una notificación. El aviso por correo con el detalle de la Junta Evaluadora lo gestiona la administración fuera del sistema.</p>
        <label className="field">
          <span>Nuevo estado</span>
          <select value={estado} onChange={(e) => setEstado(e.target.value as SolicitudCud["estado"])}>
            <option value="pendiente">Pendiente de revisión</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </label>
        {estado === "aprobada" && (
          <div className="form-grid">
            <label className="field"><span>Fecha de la Junta Evaluadora</span><input type="date" required value={fechaJunta} onChange={(e) => setFechaJunta(e.target.value)} /></label>
            <label className="field"><span>Hora (HH:MM)</span><input type="time" required value={horaJunta} onChange={(e) => setHoraJunta(e.target.value)} /></label>
          </div>
        )}
        {error && <p className="form-alert" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={guardando || sinCambios}>{guardando ? "Guardando..." : "Guardar estado"}</button>
      </form>
    </div>
  );
}
