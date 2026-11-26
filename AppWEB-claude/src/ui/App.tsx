import { FormEvent, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, useEffect, useMemo, useState } from "react";
import LoginAdmin from "./LoginAdmin";
import PanelSolicitudCud from "./PanelSolicitudCud";
import type { CambioSolicitudCud } from "./PanelSolicitudCud";
// La UI no conoce Firebase: obtiene datos y acciones del frontend (hooks) y del puerto `../servicios`.
import { useDatosAdmin } from "../frontend/useDatosAdmin";
import {
  cambiarEstadoSolicitudCud,
  cambiarEstadoTurno,
  cerrarSesionAdmin,
  crearTurno,
  iniciarSesionAdmin,
  liberarTurno,
  mensajeDeError,
} from "../servicios";
import type { EstadoTurno, Paciente, Turno } from "../servicios";
import { diaHabilDeFecha, formatearHoraClinica, generarIdTurno } from "../compartido/reglasTurnos";
import {
  BLOQUES_HORARIOS_BASE,
  DIAS_HABILES_SEMANA,
  ESPECIALIDADES_CLINICA,
  PROFESIONALES_CLINICA,
} from "../compartido/catalogoClinica";

type Section = "dashboard" | "directory" | "patients" | "appointments" | "management";

const nav: { id: Section; label: string; icon: string }[] = [
  { id: "dashboard", label: "Inicio", icon: "grid" },
  { id: "directory", label: "Directorio", icon: "users" },
  { id: "patients", label: "Pacientes", icon: "users" },
  { id: "appointments", label: "Agenda", icon: "calendar" },
  { id: "management", label: "Gestión", icon: "grid" },
];

const doctorTones = ["sage", "blue", "amber"];
const etiquetaCud: Record<string, string> = { pendiente: "CUD pendiente", aprobada: "CUD aprobado", rechazada: "CUD rechazado" };
const estadoLabel: Record<EstadoTurno, string> = { reservado: "Reservado", completado: "Completado", cancelado: "Cancelado" };
const estadoTone: Record<EstadoTurno, string> = { reservado: "info", completado: "success", cancelado: "muted" };

function iniciales(nombre: string) {
  const letras = nombre.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0].toUpperCase());
  return letras.join("") || "?";
}

function formatFecha(iso: string, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? "—" : new Intl.DateTimeFormat("es-AR", options).format(fecha);
}

function enlaceMapa(latitud: number, longitud: number) {
  return `https://www.google.com/maps?q=${latitud},${longitud}`;
}

function Icon({ name, className = "size-5" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    activity: <path d="M3 12h4l2-7 4 14 2-7h6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="field"><span>{label}</span><input {...props} /></label>;
}

function SelectField({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span><select {...props}>{children}</select></label>;
}

function Empty({ text }: { text: string }) {
  return <div className="empty"><span className="empty-icon"><Icon name="file" /></span><p>{text}</p></div>;
}

export default function App() {
  // --- Sesión y datos en tiempo real (hook del bloque frontend) ---
  const { sesion, pacientes, turnos, solicitudesCud, datosError } = useDatosAdmin();

  // --- Estado de interfaz ---
  const [section, setSection] = useState<Section>("dashboard");
  const [bookingPatient, setBookingPatient] = useState("");
  const [bookingSpecialty, setBookingSpecialty] = useState("");
  const [bookingDoctor, setBookingDoctor] = useState("");
  const [bookingDay, setBookingDay] = useState("");
  const [bookingBlock, setBookingBlock] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [receipt, setReceipt] = useState<Turno | null>(null);
  const [managementDay, setManagementDay] = useState("");
  const [managementDoctor, setManagementDoctor] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [patientStatus, setPatientStatus] = useState("Todos");
  const [selectedPatientUid, setSelectedPatientUid] = useState<string | null>(null);
  const [patientTab, setPatientTab] = useState("Datos personales");
  const [agendaView, setAgendaView] = useState("Lista");
  const [agendaDoctor, setAgendaDoctor] = useState("");
  const [agendaStatus, setAgendaStatus] = useState("");
  const [agendaSpecialty, setAgendaSpecialty] = useState("");
  const [agendaPatient, setAgendaPatient] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const hoy = diaHabilDeFecha(new Date());
  const pacientePorUid = useMemo(() => new Map(pacientes.map((paciente) => [paciente.uid, paciente])), [pacientes]);
  const solicitudPorUid = useMemo(() => new Map(solicitudesCud.map((solicitud) => [solicitud.pacienteUid, solicitud])), [solicitudesCud]);
  const idsOcupados = useMemo(() => new Set(turnos.map((turno) => turno.id)), [turnos]);
  const selectedPatient = selectedPatientUid ? pacientePorUid.get(selectedPatientUid) ?? null : null;

  const nombrePaciente = (turno: Turno) => pacientePorUid.get(turno.pacienteUid)?.nombre || `DNI ${turno.pacienteDni}`;

  const especialidadElegida = ESPECIALIDADES_CLINICA.find((item) => item.id === bookingSpecialty);
  const bloquesLibres = especialidadElegida && bookingDoctor && bookingDay
    ? BLOQUES_HORARIOS_BASE.filter((bloque) => !idsOcupados.has(generarIdTurno(bookingDoctor, especialidadElegida.nombre, bookingDay, formatearHoraClinica(bloque))))
    : [];

  const agendaTurnos = turnos.filter((turno) =>
    (!agendaDoctor || turno.profesionalId === agendaDoctor) &&
    (!agendaSpecialty || turno.especialidad === agendaSpecialty) &&
    (!agendaPatient || turno.pacienteUid === agendaPatient) &&
    (!agendaStatus || turno.estado === agendaStatus));

  const gestionTurnos = turnos.filter((turno) =>
    (!managementDay || turno.fecha === managementDay) &&
    (!managementDoctor || turno.profesionalId === managementDoctor));

  const pacientesFiltrados = pacientes.filter((paciente) => {
    const coincide = `${paciente.nombre} ${paciente.dni} ${paciente.correo}`.toLowerCase().includes(patientQuery.toLowerCase());
    const estado =
      patientStatus === "Todos" ||
      (patientStatus === "Correo verificado" && paciente.emailVerificado) ||
      (patientStatus === "Correo sin verificar" && !paciente.emailVerificado) ||
      (patientStatus === "Con ubicación GPS" && paciente.ubicacion !== null) ||
      (patientStatus === "Sin ubicación GPS" && paciente.ubicacion === null) ||
      (patientStatus === "Con solicitud de CUD" && solicitudPorUid.has(paciente.uid)) ||
      (patientStatus === "CUD pendiente de revisión" && solicitudPorUid.get(paciente.uid)?.estado === "pendiente");
    return coincide && estado;
  });

  const turnosHoy = hoy ? turnos.filter((turno) => turno.fecha === hoy) : [];
  const sinVerificar = pacientes.filter((paciente) => !paciente.emailVerificado).length;
  const sinGps = pacientes.filter((paciente) => paciente.ubicacion === null).length;
  const reservadosHoy = turnosHoy.filter((turno) => turno.estado === "reservado").length;
  const actividadReciente = [...turnos].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)).slice(0, 5);
  const cudPendientes = solicitudesCud.filter((solicitud) => solicitud.estado === "pendiente").length;
  const alertasActivas = [reservadosHoy, sinVerificar, sinGps, cudPendientes].filter((cantidad) => cantidad > 0).length;

  // --- Acciones ---
  async function cerrarSesion() {
    await cerrarSesionAdmin();
    setSection("dashboard");
    setReceipt(null);
    setSelectedPatientUid(null);
  }

  function resetBooking() {
    setBookingPatient("");
    setBookingSpecialty("");
    setBookingDoctor("");
    setBookingDay("");
    setBookingBlock("");
    setBookingError("");
  }

  async function addAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const paciente = pacientePorUid.get(bookingPatient);
    if (!paciente) {
      setBookingError("Seleccioná un paciente del padrón.");
      return;
    }
    setGuardando(true);
    setBookingError("");
    try {
      const turno = await crearTurno({
        paciente: { uid: paciente.uid, dni: paciente.dni },
        profesionalId: bookingDoctor,
        especialidadId: bookingSpecialty,
        dia: bookingDay,
        bloque: bookingBlock,
      });
      setReceipt(turno);
      resetBooking();
      setToast("Turno confirmado y agregado a la agenda.");
    } catch (error) {
      setBookingError(mensajeDeError(error));
      setBookingBlock("");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(turno: Turno, estado: EstadoTurno) {
    try {
      await cambiarEstadoTurno(turno.id, estado);
      setToast(`Turno de ${nombrePaciente(turno)} marcado como ${estadoLabel[estado].toLowerCase()}.`);
    } catch (error) {
      setToast(mensajeDeError(error));
    }
  }

  async function guardarEstadoCud(pacienteUid: string, cambio: CambioSolicitudCud) {
    await cambiarEstadoSolicitudCud(pacienteUid, cambio);
    setToast("Estado de la solicitud de CUD actualizado.");
  }

  async function liberar(turno: Turno) {
    if (!window.confirm(`¿Liberar el horario ${turno.fecha} ${turno.hora} de ${turno.profesional}? Se eliminará el turno de ${nombrePaciente(turno)}.`)) return;
    try {
      await liberarTurno(turno.id);
      setToast("Horario liberado. Ya está disponible para nuevas reservas.");
    } catch (error) {
      setToast(mensajeDeError(error));
    }
  }

  // --- Puerta de acceso: solo administradores ---
  if (sesion === null) {
    return <div className="empty" style={{ minHeight: "100vh" }}><p>Verificando sesión...</p></div>;
  }
  if (sesion.estado !== "admin") {
    return (
      <LoginAdmin
        onLogin={iniciarSesionAdmin}
        aviso={sesion.motivo === "NO_ADMIN" ? "Esta cuenta no tiene permisos de administración para acceder al portal." : undefined}
      />
    );
  }

  const headings: Record<Section, [string, string]> = {
    dashboard: ["Panel principal", "Estado en tiempo real de pacientes y turnos."],
    directory: ["Directorio médico", "Profesionales y disponibilidad de atención domiciliaria."],
    patients: ["Padrón de pacientes", "Datos filiatorios, cobertura médica y ubicación GPS."],
    appointments: ["Agenda de turnos", "Reservá según la disponibilidad real de cada profesional."],
    management: ["Panel de gestión", "Consultá y filtrá todos los turnos agendados."],
  };

  const filaTurno = (turno: Turno) => (
    <article key={turno.id}>
      <div className="appointment-date"><strong>{turno.fecha.slice(0, 3)}</strong><small>{turno.hora.slice(0, 5)}</small></div>
      <div><strong>{nombrePaciente(turno)}</strong><p>{turno.profesional} · {turno.especialidad}</p><small className="source-label">DNI {turno.pacienteDni}</small></div>
      <span className={`status-badge ${estadoTone[turno.estado] ?? "muted"}`}>{estadoLabel[turno.estado] ?? turno.estado}</span>
      <span className="time"><Icon name="clock" />{turno.hora}</span>
      <div className="card-actions">
        {turno.estado !== "completado" && <button onClick={() => cambiarEstado(turno, "completado")}>Completar</button>}
        {turno.estado !== "cancelado" && <button className="danger-text" onClick={() => cambiarEstado(turno, "cancelado")}>Cancelar</button>}
        {turno.estado !== "reservado" && <button onClick={() => cambiarEstado(turno, "reservado")}>Reactivar</button>}
        <button className="danger-text" onClick={() => liberar(turno)}>Liberar horario</button>
      </div>
    </article>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Icon name="activity" className="size-6" /></span>
          <span><strong>Pilares</strong><small>de Esperanza</small></span>
        </div>
        <nav>
          {nav.map((item) => (
            <button key={item.id} className={section === item.id ? "nav-item active" : "nav-item"} onClick={() => setSection(item.id)}>
              <Icon name={item.icon} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="avatar">PE</span>
          <span><strong>Centro de rehabilitación</strong><small>Gestión institucional</small></span>
        </div>
      </aside>

      <main>
        <header>
          <div><p className="eyebrow">CENTRO DE REHABILITACIÓN</p><h1>{headings[section][0]}</h1><p className="subtitle">{headings[section][1]}</p></div>
          <div className="header-actions">
            <label className="role-switch"><span>Sesión</span><strong style={{ fontSize: 11, color: "#295e54" }}>{sesion.correo}</strong></label>
            <button className="secondary-button" onClick={cerrarSesion}>Cerrar sesión</button>
            <div className="date-chip"><Icon name="calendar" /><span>{new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date())}</span></div>
          </div>
        </header>
        {toast && <div className="toast" role="status"><Icon name="check" />{toast}</div>}
        {datosError && <p className="form-alert" role="alert" style={{ marginBottom: 20 }}>No se pudo sincronizar con Firestore: {datosError}</p>}

        {section === "dashboard" && (
          <div className="dashboard">
            <section className="hero">
              <div><span className="hero-kicker">BIENVENIDOS</span><h2>Cuidamos cada paso<br />hacia una vida mejor.</h2><p>Una gestión más simple para que el equipo pueda enfocarse en lo esencial: las personas.</p></div>
              <span className="hero-symbol"><Icon name="activity" className="size-16" /></span>
            </section>
            <div className="metrics-grid">
              {[
                ["Pacientes registrados", pacientes.length, "users", "mint"],
                ["Correo verificado", pacientes.length - sinVerificar, "users", "amber"],
                ["Con ubicación GPS", pacientes.length - sinGps, "activity", "mint"],
                ["Turnos reservados", turnos.filter((item) => item.estado === "reservado").length, "calendar", "amber"],
                [`Turnos para hoy${hoy ? ` (${hoy})` : ""}`, turnosHoy.length, "calendar", "mint"],
                ["Turnos completados", turnos.filter((item) => item.estado === "completado").length, "check", "amber"],
                ["Turnos cancelados", turnos.filter((item) => item.estado === "cancelado").length, "file", "mint"],
                ["Total de turnos", turnos.length, "clock", "amber"],
              ].map(([label, value, icon, tone]) => <article className="metric-card" key={String(label)}><span className={`stat-icon ${tone}`}><Icon name={String(icon)} /></span><div><strong>{value}</strong><p>{label}</p></div></article>)}
            </div>
            <div className="dashboard-columns">
              <section className="panel"><div className="panel-title"><div><h2>Actividad reciente</h2><p>Últimos turnos registrados</p></div></div><div className="activity-list">
                {actividadReciente.length === 0 ? <Empty text="Todavía no hay turnos registrados." /> : actividadReciente.map((turno) => <article key={turno.id}><span className="activity-dot" /><div><strong>Turno {turno.estado}</strong><p>{nombrePaciente(turno)} · {turno.especialidad} · {turno.fecha} {turno.hora}</p></div><time>{formatFecha(turno.creadoEn, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time></article>)}
              </div></section>
              <section className="panel alerts-panel"><div className="panel-title"><div><h2>Alertas administrativas</h2><p>Requieren atención</p></div><span className="alert-count">{alertasActivas}</span></div><div className="alert-list">
                <button onClick={() => { if (hoy) setAgendaStatus("reservado"); setSection("appointments"); }}><span className="alert-mark info">i</span><div><strong>Turnos reservados para hoy</strong><small>{hoy ? `${reservadosHoy} turnos · ${hoy}` : "Hoy no es día hábil"}</small></div><Icon name="arrow" /></button>
                <button onClick={() => { setPatientStatus("Correo sin verificar"); setSection("patients"); }}><span className="alert-mark warning">!</span><div><strong>Correo sin verificar</strong><small>{sinVerificar} pacientes</small></div><Icon name="arrow" /></button>
                <button onClick={() => { setPatientStatus("Sin ubicación GPS"); setSection("patients"); }}><span className="alert-mark danger">!</span><div><strong>Sin ubicación GPS</strong><small>{sinGps} pacientes</small></div><Icon name="arrow" /></button>
                <button onClick={() => { setPatientStatus("CUD pendiente de revisión"); setSection("patients"); }}><span className="alert-mark info">i</span><div><strong>Solicitudes de CUD</strong><small>{cudPendientes} pendientes de revisión</small></div><Icon name="arrow" /></button>
              </div></section>
            </div>
            <section className="panel quick-panel">
              <div className="panel-title"><div><h2>Accesos rápidos</h2><p>Comenzá una tarea frecuente</p></div></div>
              <div className="quick-grid">
                <button onClick={() => setSection("patients")}><span><Icon name="users" /></span><div><strong>Padrón de pacientes</strong><small>Consultar datos y ubicación</small></div><Icon name="arrow" /></button>
                <button onClick={() => setSection("appointments")}><span><Icon name="calendar" /></span><div><strong>Agendar turno</strong><small>Programar una nueva cita</small></div><Icon name="arrow" /></button>
                <button onClick={() => setSection("management")}><span><Icon name="file" /></span><div><strong>Panel de gestión</strong><small>Filtrar turnos agendados</small></div><Icon name="arrow" /></button>
              </div>
            </section>
          </div>
        )}

        {section === "directory" && (
          <div className="content-grid">
            <div className="section-toolbar"><div><strong>{PROFESIONALES_CLINICA.length} profesionales</strong><span>{ESPECIALIDADES_CLINICA.length} especialidades disponibles</span></div></div>
            <section className="doctor-grid">
              {PROFESIONALES_CLINICA.map((doctor, index) => {
                const reservados = turnos.filter((turno) => turno.profesionalId === doctor.id && turno.estado === "reservado").length;
                return (
                  <article className="doctor-card" key={doctor.id}>
                    <div className={`doctor-avatar ${doctorTones[index % doctorTones.length]}`} role="img" aria-label={`Avatar de ${doctor.nombre}`}>{iniciales(doctor.nombre.replace(/^(Dr\.|Dra\.|Lic\.)\s*/, ""))}</div>
                    <div className="doctor-info"><div className="doctor-heading"><span className="specialty">Atención domiciliaria</span><span className="status-badge success">{reservados} reservados</span></div><h2>{doctor.nombre}</h2><p className="doctor-meta">ID {doctor.id}<br />{ESPECIALIDADES_CLINICA.map((item) => item.nombre).join(" · ")}</p><div className="availability"><Icon name="calendar" /><span><strong>Lunes a Viernes</strong><small>{BLOQUES_HORARIOS_BASE[0]} a {BLOQUES_HORARIOS_BASE[BLOQUES_HORARIOS_BASE.length - 1]} hs</small></span></div></div>
                    <div className="card-actions"><button onClick={() => { setAgendaDoctor(doctor.id); setAgendaView("Lista"); setSection("appointments"); }}>Ver turnos</button><button onClick={() => { setBookingDoctor(doctor.id); setSection("appointments"); }}>Disponibilidad</button></div>
                  </article>
                );
              })}
            </section>
          </div>
        )}

        {section === "patients" && (
          <div className="content-grid">
            <div className="section-toolbar"><div><strong>{pacientes.length} pacientes registrados</strong><span>Padrón sincronizado en tiempo real desde la app móvil</span></div></div>
            <section className="panel"><div className="list-controls"><label className="search-box"><Icon name="users" /><input aria-label="Buscar paciente" placeholder="Buscar por nombre, DNI o correo..." value={patientQuery} onChange={(event) => setPatientQuery(event.target.value)} /></label><select aria-label="Filtrar por estado" value={patientStatus} onChange={(event) => setPatientStatus(event.target.value)}><option>Todos</option><option>Correo verificado</option><option>Correo sin verificar</option><option>Con ubicación GPS</option><option>Sin ubicación GPS</option><option>Con solicitud de CUD</option><option>CUD pendiente de revisión</option></select></div>
              {pacientesFiltrados.length === 0 ? <Empty text="No hay pacientes que coincidan con la búsqueda." /> : <div className="table-wrap"><table><thead><tr><th>Paciente</th><th>DNI / Nacimiento</th><th>Contacto</th><th>Estados</th><th>Cobertura</th><th></th></tr></thead><tbody>{pacientesFiltrados.map((paciente) => <tr className="clickable-row" key={paciente.uid} onClick={() => { setSelectedPatientUid(paciente.uid); setPatientTab("Datos personales"); }}><td><strong>{paciente.nombre || "Sin nombre"}</strong><small className="cell-detail">{paciente.correo}</small></td><td>{paciente.dni}<small className="cell-detail">{paciente.fechaNacimiento || "Sin fecha registrada"}</small></td><td>{paciente.telefono ? `+54 9 ${paciente.telefono}` : "Sin teléfono"}<small className="cell-detail">{paciente.ubicacion ? `${paciente.ubicacion.latitud.toFixed(5)}, ${paciente.ubicacion.longitud.toFixed(5)}` : "Sin ubicación GPS"}</small></td><td><div className="status-stack"><span className={`status-badge ${paciente.emailVerificado ? "success" : "warning"}`}>{paciente.emailVerificado ? "Correo verificado" : "Correo sin verificar"}</span>{solicitudPorUid.has(paciente.uid) && <span className={`status-badge ${solicitudPorUid.get(paciente.uid)?.estado === "aprobada" ? "success" : solicitudPorUid.get(paciente.uid)?.estado === "rechazada" ? "muted" : "info"}`}>{etiquetaCud[solicitudPorUid.get(paciente.uid)?.estado ?? "pendiente"]}</span>}</div></td><td><span className="tag">{paciente.obraSocial || "Sin datos"}</span><small className="cell-detail">Registro {formatFecha(paciente.fechaRegistro)}</small></td><td><button className="row-action" aria-label={`Abrir ficha de ${paciente.nombre}`}>Ver ficha</button></td></tr>)}</tbody></table></div>}
            </section>
            {selectedPatient && <section className="patient-profile panel"><div className="profile-head"><div className="profile-avatar">{iniciales(selectedPatient.nombre)}</div><div><span className="eyebrow">FICHA DEL PACIENTE</span><h2>{selectedPatient.nombre}</h2><p>DNI {selectedPatient.dni} · UID {selectedPatient.uid}</p></div><button className="icon-button" aria-label="Cerrar ficha" onClick={() => setSelectedPatientUid(null)}>×</button></div><div className="internal-tabs">{["Datos personales", "Cobertura médica", "Ubicación GPS", "Turnos", "Solicitud de CUD"].map((tab) => <button key={tab} className={patientTab === tab ? "active" : ""} onClick={() => setPatientTab(tab)}>{tab}</button>)}</div><div className="tab-content">
              {patientTab === "Datos personales" && <div className="detail-grid"><div><span>Fecha de nacimiento</span><strong>{selectedPatient.fechaNacimiento || "No registrada"}</strong></div><div><span>Teléfono</span><strong>{selectedPatient.telefono ? `+54 9 ${selectedPatient.telefono}` : "No registrado"}</strong></div><div><span>Correo electrónico</span><strong>{selectedPatient.correo || "No registrado"}</strong></div><div><span>DNI</span><strong>{selectedPatient.dni}</strong></div><div><span>Correo verificado</span><strong>{selectedPatient.emailVerificado ? "Sí" : "No"}</strong></div><div><span>Fecha de registro</span><strong>{formatFecha(selectedPatient.fechaRegistro, { dateStyle: "medium", timeStyle: "short" })}</strong></div></div>}
              {patientTab === "Cobertura médica" && <div className="process-card"><div><span className="status-badge info">Obra social / prepaga</span><h3>{selectedPatient.obraSocial || "Sin datos"}</h3><p>Dato declarado por el paciente durante el registro en la app móvil.</p></div></div>}
              {patientTab === "Ubicación GPS" && (selectedPatient.ubicacion
                ? <div className="detail-grid"><div><span>Latitud</span><strong>{selectedPatient.ubicacion.latitud}</strong></div><div><span>Longitud</span><strong>{selectedPatient.ubicacion.longitud}</strong></div><div><span>Mapa</span><strong><a href={enlaceMapa(selectedPatient.ubicacion.latitud, selectedPatient.ubicacion.longitud)} target="_blank" rel="noopener noreferrer">Abrir en Google Maps</a></strong></div></div>
                : <Empty text="El paciente no registró coordenadas GPS." />)}
              {patientTab === "Solicitud de CUD" && (() => {
                const solicitud = solicitudPorUid.get(selectedPatient.uid);
                return solicitud
                  ? <PanelSolicitudCud key={selectedPatient.uid} solicitud={solicitud} onGuardar={(cambio) => guardarEstadoCud(selectedPatient.uid, cambio)} />
                  : <Empty text="El paciente no solicitó el Certificado Único de Discapacidad." />;
              })()}
              {patientTab === "Turnos" && (() => {
                const delPaciente = turnos.filter((turno) => turno.pacienteUid === selectedPatient.uid);
                return delPaciente.length === 0 ? <Empty text="El paciente no tiene turnos registrados." /> : <div className="appointment-list">{delPaciente.map((turno) => <article key={turno.id}><div className="appointment-date"><strong>{turno.fecha.slice(0, 3)}</strong><small>{turno.hora.slice(0, 5)}</small></div><div><strong>{turno.especialidad}</strong><p>{turno.profesional}</p></div><span className={`status-badge ${estadoTone[turno.estado] ?? "muted"}`}>{estadoLabel[turno.estado] ?? turno.estado}</span></article>)}</div>;
              })()}
            </div></section>}
          </div>
        )}

        {section === "appointments" && (
          <div className="content-grid">
            <div className="section-toolbar"><div className="view-toggle">{["Semana", "Lista"].map((view) => <button key={view} className={agendaView === view ? "active" : ""} onClick={() => setAgendaView(view)}>{view}</button>)}</div><button className="primary-button" onClick={() => document.querySelector(".form-panel")?.scrollIntoView({ behavior: "smooth" })}><Icon name="plus" />Nuevo turno</button></div>
            <section className="panel compact-filters"><div className="agenda-filter-grid"><SelectField label="Filtrar profesional" value={agendaDoctor} onChange={(event) => setAgendaDoctor(event.target.value)}><option value="">Todos</option>{PROFESIONALES_CLINICA.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.nombre}</option>)}</SelectField><SelectField label="Filtrar especialidad" value={agendaSpecialty} onChange={(event) => setAgendaSpecialty(event.target.value)}><option value="">Todas</option>{ESPECIALIDADES_CLINICA.map((item) => <option key={item.id}>{item.nombre}</option>)}</SelectField><SelectField label="Filtrar paciente" value={agendaPatient} onChange={(event) => setAgendaPatient(event.target.value)}><option value="">Todos</option>{pacientes.map((paciente) => <option key={paciente.uid} value={paciente.uid}>{paciente.nombre}</option>)}</SelectField><SelectField label="Filtrar estado" value={agendaStatus} onChange={(event) => setAgendaStatus(event.target.value)}><option value="">Todos</option><option value="reservado">Reservado</option><option value="completado">Completado</option><option value="cancelado">Cancelado</option></SelectField></div></section>
            {agendaView === "Semana" && <section className="panel calendar-preview"><div className="calendar-head" style={{ justifyContent: "center" }}><div><strong>Semana hábil</strong><span>Turnos por día en tiempo real (los turnos se repiten semanalmente por día hábil)</span></div></div><div className="calendar-days">{DIAS_HABILES_SEMANA.map((dia) => { const delDia = agendaTurnos.filter((turno) => turno.fecha === dia); return <article key={dia}><strong>{dia.slice(0, 3)}</strong><span>{delDia.length}</span>{delDia.map((turno) => <div className="calendar-event" style={{ marginBottom: 4 }} key={turno.id}>{turno.hora} · {turno.especialidad}<br />{nombrePaciente(turno)}</div>)}</article>; })}</div></section>}
            <section className="panel form-panel"><div className="panel-title"><div><h2>Agendar una cita</h2><p>El horario se identifica por profesional, especialidad, día y hora: no admite doble reserva</p></div><span className="panel-icon"><Icon name="calendar" /></span></div>
              <form onSubmit={addAppointment}>
                <SelectField label="Paciente del padrón" required value={bookingPatient} onChange={(event) => setBookingPatient(event.target.value)}><option value="" disabled>Seleccionar paciente</option>{pacientes.map((paciente) => <option key={paciente.uid} value={paciente.uid}>{paciente.nombre} · {paciente.dni}</option>)}</SelectField>
                <div className="form-grid">
                  <SelectField label="Especialidad" value={bookingSpecialty} onChange={(event) => { setBookingSpecialty(event.target.value); setBookingBlock(""); }} required><option value="" disabled>Seleccionar especialidad</option>{ESPECIALIDADES_CLINICA.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</SelectField>
                  <SelectField label="Profesional" value={bookingDoctor} onChange={(event) => { setBookingDoctor(event.target.value); setBookingBlock(""); }} required><option value="" disabled>Seleccionar profesional</option>{PROFESIONALES_CLINICA.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.nombre}</option>)}</SelectField>
                </div>
                <div className="form-grid">
                  <SelectField label="Día hábil" value={bookingDay} onChange={(event) => { setBookingDay(event.target.value); setBookingBlock(""); }} required><option value="" disabled>Seleccionar día</option>{DIAS_HABILES_SEMANA.map((dia) => <option key={dia}>{dia}</option>)}</SelectField>
                  <SelectField label="Horario disponible" required disabled={!especialidadElegida || !bookingDoctor || !bookingDay} value={bookingBlock} onChange={(event) => setBookingBlock(event.target.value)}><option value="" disabled>{bookingDay && bloquesLibres.length === 0 ? "Sin horarios libres" : "Seleccionar horario"}</option>{bloquesLibres.map((bloque) => <option key={bloque} value={bloque}>{formatearHoraClinica(bloque)}</option>)}</SelectField>
                </div>
                {bookingError && <p className="form-alert" role="alert">{bookingError}</p>}
                <p className="security-note"><strong>Liberación de horarios:</strong> un turno cancelado conserva su horario ocupado en el sistema. Para dejarlo disponible nuevamente use «Liberar horario» en la lista de turnos.</p>
                <button className="primary-button" type="submit" disabled={!bookingPatient || !bookingBlock || guardando}><Icon name="check" />{guardando ? "Guardando..." : "Confirmar turno"}</button>
              </form>
            </section>
            {receipt && <section className="receipt" aria-live="polite"><span className="receipt-check"><Icon name="check" /></span><div><p>Turno confirmado</p><h2>{pacientePorUid.get(receipt.pacienteUid)?.nombre || `DNI ${receipt.pacienteDni}`}</h2><span>{receipt.profesional} · {receipt.especialidad}</span><strong>{receipt.fecha} · {receipt.hora} hs</strong><small>Comprobante {receipt.id}</small></div><button onClick={() => window.print()}>Imprimir comprobante</button></section>}
            <section className="panel"><div className="panel-title"><div><h2>Próximos turnos</h2><p>Agenda ordenada por día y horario · {agendaTurnos.length} resultados</p></div></div>
              {agendaTurnos.length === 0 ? <Empty text="No hay turnos que coincidan con los filtros." /> : <div className="appointment-list">{agendaTurnos.map(filaTurno)}</div>}
            </section>
          </div>
        )}

        {section === "management" && (
          <div className="content-grid">
            <section className="panel management-filters"><div className="panel-title"><div><h2>Filtros de agenda</h2><p>Combiná filtros para encontrar un turno</p></div></div><div className="form-grid"><SelectField label="Día hábil" value={managementDay} onChange={(event) => setManagementDay(event.target.value)}><option value="">Todos los días</option>{DIAS_HABILES_SEMANA.map((dia) => <option key={dia}>{dia}</option>)}</SelectField><SelectField label="Médico" value={managementDoctor} onChange={(event) => setManagementDoctor(event.target.value)}><option value="">Todos los profesionales</option>{PROFESIONALES_CLINICA.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.nombre}</option>)}</SelectField></div></section>
            <section className="panel"><div className="panel-title"><div><h2>Turnos agendados</h2><p>{gestionTurnos.length} resultados</p></div></div>
              {gestionTurnos.length === 0 ? <Empty text="No hay turnos que coincidan con los filtros." /> : <div className="table-wrap"><table><thead><tr><th>Día y hora</th><th>Paciente</th><th>Profesional</th><th>Especialidad / estado</th><th>Cobertura</th></tr></thead><tbody>{gestionTurnos.map((turno) => <tr key={turno.id}><td><strong>{turno.fecha} · {turno.hora}</strong></td><td>{nombrePaciente(turno)}<small className="cell-detail">DNI {turno.pacienteDni}</small></td><td>{turno.profesional}</td><td>{turno.especialidad}<small className="cell-detail">{estadoLabel[turno.estado] ?? turno.estado}</small></td><td><span className="tag">{pacientePorUid.get(turno.pacienteUid)?.obraSocial || "Sin datos"}</span></td></tr>)}</tbody></table></div>}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
