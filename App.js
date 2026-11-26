import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Image, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// RAÍZ DE COMPOSICIÓN: único archivo que conoce a los tres bloques y los conecta entre sí.
//   backend  -> servicios de datos (Firebase)         -> se inyectan al frontend
//   frontend -> lógica de aplicación (hook controlador) -> entrega estado y acciones a la UI
//   ui       -> pantallas, componentes y tema            -> reciben todo por props
import { servicios } from './src/backend';
import { useAppController } from './src/frontend/useAppController';
import { Dialogos } from './src/ui/dialogos/Dialogos';
import { EstilosGlobales } from './src/ui/tema/EstilosGlobales';
import { IndicadorProcesando } from './src/ui/componentes/ComponentesUI';
import { CamaraNativa } from './src/ui/dispositivo/CamaraNativa';
import * as AuthViews from './src/ui/pantallas/PantallasAuth';
import * as TurnosViews from './src/ui/pantallas/PantallasTurnos';
import * as PacienteViews from './src/ui/pantallas/PantallasPaciente';

function Aplicacion() {
  const ctrl = useAppController({ servicios, dialogos: Dialogos });

  if (ctrl.mostrarSplash) {
    return <AuthViews.Splash />;
  }

  if (ctrl.pasoCamaraActivo) {
    return (
      <CamaraNativa
        tipoLente={ctrl.pasoCamaraActivo === 'AUTENTICACION_FACIAL' ? 'front' : 'back'}
        pasoActual={ctrl.pasoCamaraActivo}
        onCapturaExitosa={ctrl.manejarCapturaCamera}
        onCancelar={() => ctrl.setPasoCamaraActivo(null)}
      />
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={EstilosGlobales.contenedorRaiz}>
        <Image
          source={require('./assets/fondo-claro.png')}
          style={{ position: 'absolute', width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.08 }}
          pointerEvents="none"
        />

        {ctrl.cifrandoDatos && <IndicadorProcesando />}

        <ScrollView
          contentContainerStyle={EstilosGlobales.scrollContenedor}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {ctrl.vista === 'bienvenida' && (
            <AuthViews.Bienvenida
              onLogin={() => ctrl.navegarA('login')}
              onRegistro={() => ctrl.navegarA('registro_formulario')}
            />
          )}

          {ctrl.vista === 'login' && (
            <AuthViews.Login
              onIngresar={ctrl.manejarLogin}
              onRecuperar={ctrl.manejarRecuperarPassword}
              onRegistro={() => ctrl.navegarA('registro_formulario')}
              onVolver={ctrl.volverAtras}
            />
          )}

          {ctrl.vista === 'registro_formulario' && (
            <AuthViews.RegistroDatos
              estados={ctrl.formulario}
              setEstados={ctrl.setFormulario}
              onSiguiente={ctrl.iniciarVerificacionEmail}
              onVolver={ctrl.volverAtras}
            />
          )}

          {ctrl.vista === 'verificacion_email' && (
            <AuthViews.VerificacionEmail
              correo={ctrl.formulario.correo}
              onVerificar={ctrl.validarEnlaceEmail}
              onReenviar={ctrl.reenviarEnlaceEmail}
              onVolver={ctrl.volverAtras}
            />
          )}

          {ctrl.vista === 'ubicacion_mapa' && (
            <AuthViews.UbicacionMapa
              ubicacion={ctrl.ubicacion}
              onReintentar={ctrl.obtenerUbicacion}
              onConfirmar={ctrl.finalizarRegistro}
              onVolver={ctrl.volverAtras}
            />
          )}

          {ctrl.vista === 'escritorio_principal' && (
            <PacienteViews.Escritorio
              nombre={ctrl.formulario.nombre}
              proximoTurno={ctrl.proximoTurno}
              onNavegarEspecialidades={async () => {
                await ctrl.sincronizarTurnos();
                ctrl.navegarA('servicios_medicos');
              }}
              onNavegarMisTurnos={async () => {
                await ctrl.sincronizarTurnos();
                ctrl.navegarA('mis_turnos');
              }}
              onNavegarHistorial={() => ctrl.navegarA('historial_clinico')}
              onNavegarPerfil={() => ctrl.navegarA('perfil_usuario')}
              onNavegarServiciosCenter={() => ctrl.navegarA('servicios_center')}
              onNavegarSoporte={() => ctrl.navegarA('soporte_ayuda')}
              onNavegarCud={() => ctrl.navegarA('solicitar_cud')}
              estadoCud={ctrl.solicitudCud.estado}
            />
          )}

          {ctrl.vista === 'mis_turnos' && (
            <TurnosViews.MisTurnos
              turnos={ctrl.misTurnosGuardados}
              onVolver={ctrl.volverAtras}
              onCancelarTurno={ctrl.cancelarTurno}
            />
          )}

          {ctrl.vista === 'historial_clinico' && (
            <PacienteViews.HistorialClinico onVolver={ctrl.volverAtras} />
          )}

          {ctrl.vista === 'servicios_medicos' && (
            <TurnosViews.ServiciosMedicos
              onSeleccionarEspecialidad={(esp) => {
                ctrl.setEspecialidadElegida(esp);
                ctrl.navegarA('seleccionar_profesional');
              }}
              onVolver={ctrl.volverAtras}
            />
          )}

          {ctrl.vista === 'seleccionar_profesional' && (
            <TurnosViews.SeleccionarProfesional
              especialidad={ctrl.especialidadElegida}
              onSeleccionarProfesional={(prof) => {
                ctrl.setProfesionalElegido(prof);
                ctrl.navegarA('catalogo_horarios');
              }}
              onVolver={ctrl.volverAtras}
            />
          )}

          {ctrl.vista === 'catalogo_horarios' && (
            <TurnosViews.CatalogoHorarios
              especialidad={ctrl.especialidadElegida}
              profesional={ctrl.profesionalElegido}
              diasHabiles={ctrl.diasHabiles}
              diaSeleccionado={ctrl.diaSeleccionado}
              onCambioDia={ctrl.cambiarDiaSeleccionado}
              bloquesDisponibles={ctrl.bloquesDisponibles}
              bloqueSeleccionado={ctrl.bloqueSeleccionado}
              onCambioBloque={ctrl.setBloqueSeleccionado}
              onConfirmar={ctrl.confirmarReservaTurno}
              onVolver={ctrl.volverAtras}
            />
          )}

          {ctrl.vista === 'confirmacion_turno' && (
            <TurnosViews.ConfirmacionTurno
              especialidad={ctrl.especialidadElegida}
              profesional={ctrl.profesionalElegido}
              dia={ctrl.ultimaReservaConfirmada.dia}
              hora={ctrl.ultimaReservaConfirmada.hora}
              onVolverInicio={() => ctrl.navegarA('escritorio_principal')}
            />
          )}

          {ctrl.vista === 'perfil_usuario' && (
            <PacienteViews.Perfil
              datos={ctrl.perfilUsuario}
              onCerrarSesion={ctrl.cerrarSesion}
              onVolver={ctrl.volverAtras}
            />
          )}

          {ctrl.vista === 'servicios_center' && (
            <PacienteViews.ServiciosCenter onVolver={ctrl.volverAtras} />
          )}

          {ctrl.vista === 'solicitar_cud' && (
            <PacienteViews.SolicitarCUD solicitud={ctrl.solicitudCud} onSolicitar={ctrl.solicitarCud} onVolver={ctrl.volverAtras} />
          )}

          {ctrl.vista === 'soporte_ayuda' && (
            <PacienteViews.SoporteAyuda onVolver={ctrl.volverAtras} />
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Aplicacion />
    </SafeAreaProvider>
  );
}
