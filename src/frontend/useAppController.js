import { useState, useEffect } from 'react';
import { BLOQUES_HORARIOS_BASE, DIAS_HABILES_SEMANA } from '../compartido/DatosClinica';
import { formatearHoraClinica } from '../compartido/reglasTurnos';
import { GpsService } from './dispositivo/GpsService';
import { NotificacionesService } from './dispositivo/NotificacionesService';
import { BorradorRegistro } from './dispositivo/BorradorRegistro';
import { useSolicitudCud } from './useSolicitudCud';

// BLOQUE FRONTEND (lógica de aplicación). No importa Firebase, ni React Native UI, ni nada de `backend/` o `ui/`:
// recibe sus dependencias por inyección desde App.js.
//   servicios: { paciente, turnos, solicitudCud }  -> contrato definido en src/backend/index.js
//   dialogos:  { aviso, confirmar, confirmarDestructivo } -> implementado por src/ui/dialogos/Dialogos.js

const FORMULARIO_INICIAL = {
  nombre: '',
  correo: '',
  password: '',
  dni: '',
  telefono: '',
  fecha: '',
  obraSocial: ''
};

const UBICACION_INICIAL = { cargando: true, error: '', region: null, distanciaKm: null };

export const useAppController = ({ servicios, dialogos }) => {
  const PacienteService = servicios.paciente;
  const TurnosService = servicios.turnos;
  const aviso = dialogos.aviso;

  const [mostrarSplash, setMostrarSplash] = useState(true);
  const [vista, setVista] = useState('bienvenida');
  const [historialVistas, setHistorialVistas] = useState(['bienvenida']);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);

  const [especialidadElegida, setEspecialidadElegida] = useState(null);
  const [profesionalElegido, setProfesionalElegido] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(DIAS_HABILES_SEMANA[0]);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);
  const [ultimaReservaConfirmada, setUltimaReservaConfirmada] = useState({ dia: '', hora: '' });
  // null hasta que GpsService valide una ubicación dentro del área de cobertura
  const [coordenadasGps, setCoordenadasGps] = useState(null);
  const [ubicacion, setUbicacion] = useState(UBICACION_INICIAL);
  // Sesión de paciente activa (login o registro completado) y si el dispositivo recibe push remoto.
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [pushRemotoActivo, setPushRemotoActivo] = useState(false);

  const [cifrandoDatos, setCifrandoDatos] = useState(false);
  const [pasoCamaraActivo, setPasoCamaraActivo] = useState(null);

  const [misTurnosGuardados, setMisTurnosGuardados] = useState([]);
  const [todosLosTurnosOcupados, setTodosLosTurnosOcupados] = useState([]);

  const { solicitudCud, solicitarCud } = useSolicitudCud({
    solicitudCudService: servicios.solicitudCud,
    dialogos,
    notificaciones: NotificacionesService,
    sesionIniciada,
    pushRemotoActivo,
    pacienteDni: formulario.dni,
    mostrarCarga: setCifrandoDatos
  });

  // Carga el perfil del paciente en el formulario (datos que muestran el escritorio y el perfil).
  const aplicarPerfil = (perfil, user) => {
    if (perfil) {
      setFormulario(prev => ({
        ...prev,
        nombre: perfil.nombre || '',
        correo: perfil.correo || user.email,
        dni: perfil.dni || '',
        telefono: perfil.telefono || '',
        fecha: perfil.fechaNacimiento || '',
        obraSocial: perfil.obraSocial || ''
      }));
    } else {
      setFormulario(prev => ({ ...prev, correo: user.email }));
    }
  };

  // Al abrir la app: si hay una sesión guardada en el teléfono entra directo (sin pedir contraseña) y si había un
  // registro a medias lo retoma en la verificación del correo. Nunca rechaza: ante cualquier fallo queda en Bienvenida.
  const restaurarSesionGuardada = async () => {
    try {
      const sesion = await PacienteService.restaurarSesion();
      if (!sesion) {
        await BorradorRegistro.borrar();
        return;
      }
      const { user, verificado, perfil, perfilNoDisponible } = sesion;
      if (verificado && (perfil || perfilNoDisponible)) {
        aplicarPerfil(perfil, user);
        setSesionIniciada(true);
        setHistorialVistas(['escritorio_principal']);
        setVista('escritorio_principal');
        sincronizarTurnos();
        await BorradorRegistro.borrar();
        return;
      }
      const borrador = await BorradorRegistro.leer();
      if (borrador) {
        setFormulario({ ...FORMULARIO_INICIAL, ...borrador, correo: user.email || borrador.correo });
        setHistorialVistas(['bienvenida', 'registro_formulario', 'verificacion_email']);
        setVista('verificacion_email');
      } else {
        await PacienteService.cerrarSesion();
      }
    } catch (error) {
      console.log('Aviso al restaurar la sesión:', error.message);
    }
  };

  // El splash dura lo mínimo necesario (1,5 s) y espera a saber si hay sesión guardada (máximo 8 s sin red).
  useEffect(() => {
    const minimo = new Promise(resolver => setTimeout(resolver, 1500));
    const limiteRed = new Promise(resolver => setTimeout(resolver, 8000));
    Promise.all([minimo, Promise.race([restaurarSesionGuardada(), limiteRed])]).then(() => setMostrarSplash(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notificaciones: al iniciar sesión pide el permiso y guarda el token push (si el dispositivo lo admite).
  useEffect(() => {
    if (!sesionIniciada) return;
    NotificacionesService.iniciar().then(({ token }) => {
      setPushRemotoActivo(Boolean(token));
      if (token) PacienteService.guardarTokenPush(token).catch((error) => console.log('Aviso al guardar el token push:', error.message));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesionIniciada]);

  // Recordatorio 3 horas antes de cada turno reservado; se reprograma cada vez que cambia la lista.
  useEffect(() => {
    if (sesionIniciada) NotificacionesService.sincronizarRecordatoriosTurnos(misTurnosGuardados);
  }, [sesionIniciada, misTurnosGuardados]);

  // Lee el GPS y valida el área de cobertura. Las coordenadas quedan en null mientras no sean válidas.
  const obtenerUbicacion = async () => {
    setUbicacion(UBICACION_INICIAL);
    setCoordenadasGps(null);
    const resultado = await GpsService.capturarYValidarCoordenadas();
    if (!resultado.exito) {
      setUbicacion({ cargando: false, error: resultado.mensaje, region: null, distanciaKm: null });
      return;
    }
    setCoordenadasGps({ latitud: resultado.latitud, longitud: resultado.longitud });
    setUbicacion({
      cargando: false,
      error: '',
      region: {
        latitude: resultado.latitud,
        longitude: resultado.longitud,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      },
      distanciaKm: resultado.distanciaKm
    });
  };

  useEffect(() => {
    if (vista === 'ubicacion_mapa') obtenerUbicacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista]);

  const navegarA = (nuevaVista) => {
    setHistorialVistas(prev => [...prev, nuevaVista]);
    setVista(nuevaVista);
  };

  const volverAtras = () => {
    if (historialVistas.length > 1) {
      const nuevoHistorial = [...historialVistas];
      nuevoHistorial.pop();
      setHistorialVistas(nuevoHistorial);
      setVista(nuevoHistorial[nuevoHistorial.length - 1]);
    }
  };

  const sincronizarTurnos = async () => {
    try {
      const [turnosUsuario, ocupadosGlobal] = await Promise.all([
        TurnosService.obtenerTurnosPaciente(),
        TurnosService.obtenerTurnosOcupados()
      ]);
      setMisTurnosGuardados(turnosUsuario);
      setTodosLosTurnosOcupados(ocupadosGlobal);
    } catch (error) {
      console.log('Aviso al sincronizar turnos:', error.message);
    }
  };

  const cambiarDiaSeleccionado = (nuevoDia) => {
    setDiaSeleccionado(nuevoDia);
    setBloqueSeleccionado(null);
  };

  const manejarLogin = async (credenciales) => {
    if (!credenciales.correo || !credenciales.password) {
      return aviso('Atención', 'Ingrese su correo electrónico y contraseña.');
    }
    setCifrandoDatos(true);
    try {
      const { user, perfil } = await PacienteService.iniciarSesion(credenciales.correo, credenciales.password);
      aplicarPerfil(perfil, user);
      setSesionIniciada(true);
      setCifrandoDatos(false);
      navegarA('escritorio_principal');
      // Los turnos se cargan en segundo plano: el paciente entra al escritorio sin esperar esas consultas.
      sincronizarTurnos();
    } catch (error) {
      setCifrandoDatos(false);
      if (error?.code === 'EMAIL_NO_VERIFICADO') {
        aviso(
          'Correo no verificado',
          `Le enviamos nuevamente un enlace de verificación a ${credenciales.correo.trim()}. Ábralo (revise también Spam) y luego vuelva a iniciar sesión.`
        );
      } else if (error?.code === 'SIN_CONEXION') {
        aviso('Sin conexión', error.message);
      } else {
        aviso('Error de acceso', 'Correo o contraseña incorrectos.');
      }
    }
  };

  const manejarRecuperarPassword = async (correo) => {
    if (!correo) {
      return aviso('Atención', 'Escriba su correo electrónico en el formulario antes de pulsar recuperar.');
    }
    try {
      await PacienteService.recuperarPassword(correo);
      aviso('Correo enviado', 'Revise su bandeja de entrada para restablecer su contraseña.');
    } catch (error) {
      aviso('Error', 'No se pudo enviar el correo de recuperación.');
    }
  };

  const iniciarVerificacionEmail = async () => {
    if (!formulario.nombre || !formulario.correo || !formulario.password || !formulario.dni || !formulario.telefono || !formulario.fecha) {
      return aviso('Atención', 'Complete todos los campos obligatorios, incluyendo correo y contraseña.');
    }
    if (formulario.password.length < 6) {
      return aviso('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
    }
    setCifrandoDatos(true);
    try {
      const registro = await PacienteService.iniciarRegistroYEnviarCorreo(formulario.correo, formulario.password);
      // Se guardan los datos (sin la contraseña) para retomar el registro si Android cierra la app mientras se abre el correo.
      await BorradorRegistro.guardar(formulario);
      setCifrandoDatos(false);
      if (registro.reanudado && registro.verificado) {
        aviso('Registro retomado', 'Su correo ya estaba verificado. Continuemos con la validación de su identidad.');
        setPasoCamaraActivo('DNI_FRENTE');
        return;
      }
      if (registro.reanudado) {
        aviso('Registro retomado', 'Encontramos un registro iniciado con este correo. Le reenviamos el enlace de verificación.');
      }
      navegarA('verificacion_email');
    } catch (error) {
      setCifrandoDatos(false);
      // Solo se muestran los mensajes propios del backend (código en mayúsculas); el resto se resume en uno genérico.
      const mensajePropio = /^[A-Z_]+$/.test(error?.code || '');
      aviso(
        'No se pudo registrar',
        mensajePropio ? error.message : 'No pudimos iniciar su registro. Revise su conexión e intente nuevamente.'
      );
    }
  };

  const validarEnlaceEmail = async () => {
    setCifrandoDatos(true);
    try {
      const verificado = await PacienteService.comprobarVerificacionCorreo();
      setCifrandoDatos(false);
      if (verificado) {
        setPasoCamaraActivo('DNI_FRENTE');
      } else {
        aviso(
          'Correo aún no verificado',
          'Por favor abra el enlace que enviamos a su casilla de correo y luego vuelva a intentar.'
        );
      }
    } catch (error) {
      setCifrandoDatos(false);
      aviso('Error', error.message);
    }
  };

  const reenviarEnlaceEmail = async () => {
    setCifrandoDatos(true);
    try {
      await PacienteService.reenviarCorreoVerificacion();
      setCifrandoDatos(false);
      aviso('Enlace reenviado', `Se envió nuevamente el correo a ${formulario.correo}.`);
    } catch (error) {
      setCifrandoDatos(false);
      aviso('Aviso', 'Espere unos segundos antes de solicitar otro reenvío.');
    }
  };

  const manejarCapturaCamera = () => {
    if (pasoCamaraActivo === 'DNI_FRENTE') {
      setPasoCamaraActivo('DNI_DORSO');
    } else if (pasoCamaraActivo === 'DNI_DORSO') {
      setPasoCamaraActivo('AUTENTICACION_FACIAL');
    } else if (pasoCamaraActivo === 'AUTENTICACION_FACIAL') {
      setPasoCamaraActivo(null);
      navegarA('ubicacion_mapa');
    }
  };

  const finalizarRegistro = async () => {
    if (!coordenadasGps) {
      return aviso(
        'Ubicación requerida',
        'Debe validar su ubicación dentro del área de cobertura antes de continuar.'
      );
    }
    setCifrandoDatos(true);
    try {
      await PacienteService.registrarPacienteServidor(formulario, coordenadasGps);
    } catch (error) {
      console.log('Aviso al guardar perfil:', error.message);
      setCifrandoDatos(false);
      return aviso('No se pudo guardar', 'No pudimos guardar sus datos. Revise su conexión e intente nuevamente.');
    }
    await BorradorRegistro.borrar();
    setSesionIniciada(true);
    setCifrandoDatos(false);
    navegarA('escritorio_principal');
    sincronizarTurnos();
  };

  const confirmarReservaTurno = async () => {
    if (!diaSeleccionado) return aviso('Atención', 'Seleccione un día hábil de la semana.');
    if (!bloqueSeleccionado) return aviso('Atención', 'Seleccione un horario disponible.');
    setCifrandoDatos(true);

    const horaFormateada = formatearHoraClinica(bloqueSeleccionado);
    try {
      const nuevoTurno = await TurnosService.reservarTurno({
        pacienteDni: formulario.dni,
        profesionalId: profesionalElegido?.id || 'p1',
        profesionalNombre: profesionalElegido?.nombre || 'Dr. Alejandro Soler',
        especialidad: especialidadElegida?.nombre || 'Kinesiología',
        fecha: diaSeleccionado,
        hora: horaFormateada
      });

      setMisTurnosGuardados(prev => [...prev, nuevoTurno]);
      setTodosLosTurnosOcupados(prev => [...prev, nuevoTurno]);
      setUltimaReservaConfirmada({ dia: diaSeleccionado, hora: horaFormateada });
      setBloqueSeleccionado(null);
      setCifrandoDatos(false);
      navegarA('confirmacion_turno');
    } catch (error) {
      setCifrandoDatos(false);
      aviso('No disponible', error.message);
      await sincronizarTurnos();
    }
  };

  const cancelarTurno = (idTurno) => {
    dialogos.confirmarDestructivo({
      titulo: '¿Desea cancelar el turno?',
      mensaje: 'Esta acción eliminará su reserva y liberará el horario para otro paciente.',
      textoCancelar: 'Volver Atrás',
      textoConfirmar: 'Cancelar Turno',
      onConfirmar: async () => {
        setCifrandoDatos(true);
        try {
          await TurnosService.cancelarTurno(idTurno);
          setMisTurnosGuardados(prev => prev.filter(t => t.id !== idTurno));
          setTodosLosTurnosOcupados(prev => prev.filter(t => t.id !== idTurno));
        } catch (error) {
          aviso('Error', 'No se pudo cancelar el turno.');
        }
        setCifrandoDatos(false);
      }
    });
  };

  // Vuelve a Bienvenida al instante; el cierre en el servidor y la limpieza de avisos siguen en segundo plano.
  const cerrarSesion = () => {
    setSesionIniciada(false);
    setPushRemotoActivo(false);
    setMisTurnosGuardados([]);
    setFormulario(FORMULARIO_INICIAL);
    setCoordenadasGps(null);
    setHistorialVistas(['bienvenida']);
    setVista('bienvenida');
    NotificacionesService.cancelarTodo().catch((error) => console.log('Aviso al cancelar recordatorios:', error.message));
    PacienteService.cerrarSesion().catch((error) => console.log('Aviso al cerrar sesión:', error.message));
    BorradorRegistro.borrar();
  };

  const bloquesDisponibles = BLOQUES_HORARIOS_BASE.filter(bloque => {
    const horaFormateada = formatearHoraClinica(bloque);
    return !todosLosTurnosOcupados.some(turno =>
      turno.profesional === (profesionalElegido?.nombre || 'Dr. Alejandro Soler') &&
      turno.especialidad === (especialidadElegida?.nombre || 'Kinesiología') &&
      turno.fecha === diaSeleccionado &&
      turno.hora === horaFormateada
    );
  });

  const perfilUsuario = {
    nombre: formulario.nombre || 'Paciente Registrado',
    dni: formulario.dni || 'Sin especificar',
    correo: formulario.correo || 'Sin especificar',
    telefono: formulario.telefono || 'Sin especificar',
    afiliado: '4582-120',
    cobertura: formulario.obraSocial ? `${formulario.obraSocial} - Cobertura Integral` : 'PAMI - Cobertura Integral',
    estadoCobertura: 'Activo • Copago Bonificado'
  };

  const proximoTurno = misTurnosGuardados.length > 0 ? misTurnosGuardados[0] : null;

  return {
    mostrarSplash,
    vista,
    formulario,
    setFormulario,
    especialidadElegida,
    setEspecialidadElegida,
    profesionalElegido,
    setProfesionalElegido,
    diasHabiles: DIAS_HABILES_SEMANA,
    diaSeleccionado,
    cambiarDiaSeleccionado,
    bloqueSeleccionado,
    setBloqueSeleccionado,
    ultimaReservaConfirmada,
    ubicacion,
    obtenerUbicacion,
    solicitudCud,
    solicitarCud,
    cifrandoDatos,
    pasoCamaraActivo,
    setPasoCamaraActivo,
    misTurnosGuardados,
    bloquesDisponibles,
    perfilUsuario,
    proximoTurno,
    navegarA,
    volverAtras,
    sincronizarTurnos,
    manejarLogin,
    manejarRecuperarPassword,
    iniciarVerificacionEmail,
    validarEnlaceEmail,
    reenviarEnlaceEmail,
    manejarCapturaCamera,
    finalizarRegistro,
    confirmarReservaTurno,
    cancelarTurno,
    cerrarSesion
  };
};