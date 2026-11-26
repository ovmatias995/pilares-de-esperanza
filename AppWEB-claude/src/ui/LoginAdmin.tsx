import { FormEvent, useState } from "react";
import { mensajeDeError } from "../servicios";

type LoginAdminProps = {
  /** Debe lanzar una excepción si las credenciales son inválidas o la cuenta no es administradora. */
  onLogin: (correo: string, password: string) => Promise<unknown>;
  /** Mensaje previo (por ejemplo, sesión restaurada de una cuenta sin rol administrador). */
  aviso?: string;
};

export default function LoginAdmin({ onLogin, aviso }: LoginAdminProps) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await onLogin(correo, password);
    } catch (e) {
      setError(mensajeDeError(e));
      setPassword("");
    } finally {
      setEnviando(false);
    }
  }

  const mensaje = error || aviso;

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section className="panel form-panel" style={{ width: "min(420px, 100%)" }}>
        <p className="eyebrow">CENTRO DE REHABILITACIÓN</p>
        <h1>Pilares de Esperanza</h1>
        <p className="subtitle" style={{ marginBottom: 22 }}>Acceso exclusivo para personal administrativo.</p>
        <form onSubmit={enviar}>
          <label className="field">
            <span>Correo electrónico</span>
            <input type="email" autoComplete="username" required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="admin@pilares.org" />
          </label>
          <label className="field">
            <span>Contraseña</span>
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {mensaje && <p className="form-alert" role="alert">{mensaje}</p>}
          <button className="primary-button" type="submit" disabled={enviando || !correo || !password}>
            {enviando ? "Verificando..." : "Ingresar al portal"}
          </button>
        </form>
      </section>
    </div>
  );
}
