import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SelectorHorarios from '../componentes/SelectorHorarios';
import {
  Aparecer,
  Boton,
  CabeceraPantalla,
  CampoTexto,
  EstadoVacio,
  Icono,
  Insignia,
  Tarjeta
} from '../componentes/ComponentesUI';
import { ESPECIALIDADES_CLINICA, PROFESIONALES_CLINICA } from '../../compartido/DatosClinica';
import { Colores, Gradientes, iniciales, Radios, Sombras } from '../tema/Tema';

const Contenido = ({ children }) => <View style={estilos.contenido}>{children}</View>;

export const ServiciosMedicos = ({ onSeleccionarEspecialidad, onVolver }) => {
  const [busqueda, setBusqueda] = useState('');
  const termino = busqueda.trim().toLowerCase();
  const especialidades = ESPECIALIDADES_CLINICA.filter((e) => e.nombre.toLowerCase().includes(termino));

  return (
    <View style={estilos.pantalla}>
      <CabeceraPantalla titulo="Servicios Médicos" subtitulo="Especialidades para su recuperación" onVolver={onVolver} />
      <Contenido>
        <CampoTexto
          icono="search-outline"
          placeholder="Buscar especialidad..."
          autoCapitalize="none"
          value={busqueda}
          onChangeText={setBusqueda}
          style={{ marginBottom: 6 }}
        />
        {especialidades.length === 0 && (
          <EstadoVacio icono="search-outline" titulo="Sin resultados" descripcion="Pruebe con otro nombre de especialidad." />
        )}
        {especialidades.map((esp, i) => (
          <Aparecer key={esp.id} retraso={i * 70}>
            <Tarjeta style={estilos.tarjetaEspecialidad}>
              <View style={estilos.filaEspecialidad}>
                <View style={estilos.iconoEspecialidad}>
                  <Text style={{ fontSize: 28 }}>{esp.icono}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.tituloEspecialidad}>{esp.nombre}</Text>
                  <Text style={estilos.descEspecialidad}>{esp.desc}</Text>
                </View>
              </View>
              <Boton titulo="Ver Turnos Disponibles" icono="calendar-outline" compacto onPress={() => onSeleccionarEspecialidad(esp)} />
            </Tarjeta>
          </Aparecer>
        ))}
      </Contenido>
    </View>
  );
};

export const SeleccionarProfesional = ({ especialidad, onSeleccionarProfesional, onVolver }) => (
  <View style={estilos.pantalla}>
    <CabeceraPantalla
      titulo="Reservar Turno"
      subtitulo={`${especialidad?.nombre || 'Especialidad'} Domiciliaria`}
      onVolver={onVolver}
    />
    <Contenido>
      <Text style={estilos.seccion}>Seleccione profesional</Text>
      {PROFESIONALES_CLINICA.map((prof, i) => (
        <Aparecer key={prof.id} retraso={i * 80}>
          <TouchableOpacity
            style={estilos.tarjetaProfesional}
            onPress={() => onSeleccionarProfesional(prof)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Seleccionar a ${prof.nombre}`}
          >
            <LinearGradient colors={Gradientes.principal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={estilos.avatar}>
              <Text style={estilos.avatarTexto}>{iniciales(prof.nombre.replace(/^(Dr\.|Dra\.|Lic\.)\s*/, ''))}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={estilos.nombreProfesional}>{prof.nombre}</Text>
              <Insignia texto="Atención domiciliaria" tono="exito" icono="home-outline" />
            </View>
            <Icono nombre="chevron-forward" tamano={22} color={Colores.textoTenue} />
          </TouchableOpacity>
        </Aparecer>
      ))}
    </Contenido>
  </View>
);

export const CatalogoHorarios = ({
  especialidad,
  profesional,
  diasHabiles,
  diaSeleccionado,
  onCambioDia,
  bloquesDisponibles,
  bloqueSeleccionado,
  onCambioBloque,
  onConfirmar,
  onVolver
}) => {
  const nombreProfesional = profesional?.nombre || 'Dr. Alejandro Soler';
  return (
    <View style={estilos.pantalla}>
      <CabeceraPantalla
        titulo="Reservar Turno"
        subtitulo={`${especialidad?.nombre || 'Especialidad'} Domiciliaria`}
        onVolver={onVolver}
        extraAbajo={30}
      >
        <View style={estilos.resumenProfesional}>
          <View style={estilos.avatarPequeno}>
            <Text style={estilos.avatarPequenoTexto}>{iniciales(nombreProfesional.replace(/^(Dr\.|Dra\.|Lic\.)\s*/, ''))}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={estilos.resumenEtiqueta}>Profesional seleccionado</Text>
            <Text style={estilos.resumenNombre}>{nombreProfesional}</Text>
          </View>
        </View>
      </CabeceraPantalla>

      <Contenido>
        <Text style={estilos.seccion}>Seleccione el día hábil</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.dias}>
          {diasHabiles.map((dia) => {
            const activo = diaSeleccionado === dia;
            return (
              <TouchableOpacity
                key={dia}
                onPress={() => onCambioDia(dia)}
                activeOpacity={0.85}
                style={[estilos.chipDia, activo && estilos.chipDiaActivo]}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
              >
                <Text style={[estilos.chipDiaTexto, activo && estilos.chipDiaTextoActivo]}>{dia}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={estilos.seccion}>Horarios disponibles · {diaSeleccionado}</Text>
        {bloquesDisponibles.length > 0 ? (
          <SelectorHorarios
            bloquesDisponibles={bloquesDisponibles}
            bloqueSeleccionado={bloqueSeleccionado}
            onCambioBloque={onCambioBloque}
          />
        ) : (
          <View style={estilos.sinHorarios}>
            <Icono nombre="calendar-clear-outline" tamano={26} color={Colores.peligro} />
            <Text style={estilos.sinHorariosTexto}>No quedan horarios disponibles para el día {diaSeleccionado}.</Text>
          </View>
        )}

        <Boton
          titulo="Confirmar Turno"
          icono="checkmark-circle-outline"
          variante="acento"
          deshabilitado={bloquesDisponibles.length === 0}
          onPress={onConfirmar}
          style={{ marginTop: 10 }}
        />
      </Contenido>
    </View>
  );
};

const FilaDetalle = ({ icono, etiqueta, valor }) => (
  <View style={estilos.filaDetalle}>
    <View style={estilos.iconoDetalle}>
      <Icono nombre={icono} tamano={18} color={Colores.primarioMedio} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={estilos.detalleEtiqueta}>{etiqueta}</Text>
      <Text style={estilos.detalleValor}>{valor}</Text>
    </View>
  </View>
);

export const ConfirmacionTurno = ({ especialidad, profesional, dia, hora, onVolverInicio }) => {
  const insets = useSafeAreaInsets();
  const resorte = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(resorte, { toValue: 1, useNativeDriver: true, speed: 6, bounciness: 14 }).start();
  }, [resorte]);

  return (
    <View style={{ flex: 1, backgroundColor: Colores.fondo }}>
      <LinearGradient
        colors={Gradientes.principal}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[estilos.heroConfirmacion, { paddingTop: insets.top + 40 }]}
      >
        <Animated.View style={[estilos.circuloExito, { transform: [{ scale: resorte }] }]}>
          <Icono nombre="checkmark" tamano={56} color={Colores.primario} />
        </Animated.View>
        <Text style={estilos.confirmacionTitulo}>¡Turno Confirmado!</Text>
        <Text style={estilos.confirmacionTexto}>
          Su solicitud ha sido procesada con éxito. El profesional lo visitará en el horario pautado.
        </Text>
      </LinearGradient>

      <Aparecer retraso={250} style={estilos.ticket}>
        <FilaDetalle icono="medkit-outline" etiqueta="ESPECIALIDAD" valor={`${especialidad?.nombre || 'Especialidad'} Domiciliaria`} />
        <View style={estilos.separador} />
        <FilaDetalle icono="person-outline" etiqueta="PROFESIONAL" valor={profesional?.nombre || 'Dr. No Asignado'} />
        <View style={estilos.separador} />
        <FilaDetalle icono="calendar-outline" etiqueta="DÍA Y HORA" valor={`${dia || 'Día asignado'} • ${hora || '--:--'}`} />
      </Aparecer>

      <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
        <Boton titulo="Volver a Inicio" icono="home-outline" onPress={onVolverInicio} />
      </View>
    </View>
  );
};

const ESTADOS = {
  reservado: { texto: 'Reservado', tono: 'info', icono: 'time-outline' },
  completado: { texto: 'Completado', tono: 'exito', icono: 'checkmark-circle-outline' },
  cancelado: { texto: 'Cancelado', tono: 'neutro', icono: 'close-circle-outline' }
};

export const MisTurnos = ({ turnos, onVolver, onCancelarTurno }) => (
  <View style={estilos.pantalla}>
    <CabeceraPantalla
      titulo="Mis Turnos"
      subtitulo={turnos && turnos.length > 0 ? `${turnos.length} ${turnos.length === 1 ? 'turno' : 'turnos'} reservado${turnos.length === 1 ? '' : 's'}` : 'Sin turnos reservados'}
      onVolver={onVolver}
    />
    <Contenido>
      {turnos && turnos.length > 0 ? (
        turnos.map((t, index) => {
          const destacado = index === 0;
          const estado = ESTADOS[t.estado];
          const tarjeta = (
            <View style={estilos.turnoInterior}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={estilos.turnoFila}>
                  <Icono nombre="calendar" tamano={18} color={destacado ? Colores.acento : Colores.primarioMedio} />
                  <Text style={[estilos.turnoFecha, destacado && { color: '#FFFFFF' }]}>{t.fecha} • {t.hora}</Text>
                </View>
                <Text style={[estilos.turnoDetalle, destacado && { color: 'rgba(255,255,255,0.82)' }]}>
                  {t.especialidad} • {t.profesional}
                </Text>
                {estado ? (
                  <View style={{ marginTop: 10 }}>
                    <Insignia texto={estado.texto} tono={destacado ? 'acento' : estado.tono} icono={estado.icono} />
                  </View>
                ) : null}
              </View>
              <TouchableOpacity
                style={[estilos.botonCancelar, destacado && { backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.4)' }]}
                onPress={() => onCancelarTurno(t.id)}
                accessibilityRole="button"
                accessibilityLabel="Cancelar turno"
              >
                <Icono nombre="trash-outline" tamano={16} color={destacado ? '#FFFFFF' : Colores.peligro} />
                <Text style={[estilos.botonCancelarTexto, destacado && { color: '#FFFFFF' }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          );
          return (
            <Aparecer key={t.id} retraso={index * 70}>
              {destacado ? (
                <LinearGradient colors={Gradientes.principal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[estilos.turno, Sombras.fuerte]}>
                  {tarjeta}
                </LinearGradient>
              ) : (
                <View style={[estilos.turno, estilos.turnoClaro]}>{tarjeta}</View>
              )}
            </Aparecer>
          );
        })
      ) : (
        <EstadoVacio icono="calendar-outline" titulo="No hay turnos reservados todavía" descripcion="Reserve su primer turno desde el inicio." />
      )}
    </Contenido>
  </View>
);

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { padding: 18, paddingBottom: 40 },
  seccion: { fontSize: 13, fontWeight: '800', color: Colores.textoSuave, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 8, marginBottom: 12 },

  tarjetaEspecialidad: { marginBottom: 14 },
  filaEspecialidad: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconoEspecialidad: { width: 58, height: 58, borderRadius: 18, backgroundColor: Colores.menta, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  tituloEspecialidad: { fontSize: 18, fontWeight: '800', color: Colores.texto },
  descEspecialidad: { fontSize: 13, color: Colores.textoSuave, lineHeight: 19, marginTop: 3 },

  tarjetaProfesional: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colores.superficie,
    padding: 16,
    borderRadius: Radios.lg,
    marginBottom: 12,
    gap: 14,
    ...Sombras.suave
  },
  avatar: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { color: Colores.acento, fontWeight: '800', fontSize: 18 },
  nombreProfesional: { fontSize: 16, fontWeight: '800', color: Colores.texto, marginBottom: 6 },

  resumenProfesional: { flexDirection: 'row', alignItems: 'center', marginTop: 18, backgroundColor: 'rgba(255,255,255,0.12)', padding: 12, borderRadius: Radios.md, gap: 12 },
  avatarPequeno: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colores.acento, alignItems: 'center', justifyContent: 'center' },
  avatarPequenoTexto: { color: Colores.primario, fontWeight: '800' },
  resumenEtiqueta: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  resumenNombre: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginTop: 2 },

  dias: { gap: 10, paddingBottom: 6, paddingRight: 8 },
  chipDia: { paddingVertical: 11, paddingHorizontal: 18, borderRadius: Radios.pill, backgroundColor: Colores.superficie, borderWidth: 1.5, borderColor: Colores.borde },
  chipDiaActivo: { backgroundColor: Colores.primario, borderColor: Colores.primario },
  chipDiaTexto: { color: Colores.textoSuave, fontWeight: '800', fontSize: 14 },
  chipDiaTextoActivo: { color: '#FFFFFF' },
  sinHorarios: { alignItems: 'center', gap: 8, padding: 22, backgroundColor: Colores.peligroFondo, borderRadius: Radios.md, marginVertical: 12 },
  sinHorariosTexto: { color: Colores.peligro, fontWeight: '700', textAlign: 'center' },

  heroConfirmacion: { alignItems: 'center', paddingBottom: 90, paddingHorizontal: 28, borderBottomLeftRadius: 44, borderBottomRightRadius: 44 },
  circuloExito: { width: 104, height: 104, borderRadius: 52, backgroundColor: Colores.acento, alignItems: 'center', justifyContent: 'center', ...Sombras.fuerte },
  confirmacionTitulo: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', letterSpacing: -0.8, marginTop: 22 },
  confirmacionTexto: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 10 },
  ticket: { marginTop: -56, marginHorizontal: 16, backgroundColor: Colores.superficie, borderRadius: Radios.xl, padding: 20, ...Sombras.fuerte },
  filaDetalle: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 6 },
  iconoDetalle: { width: 40, height: 40, borderRadius: 13, backgroundColor: Colores.menta, alignItems: 'center', justifyContent: 'center' },
  detalleEtiqueta: { fontSize: 11, fontWeight: '800', color: Colores.textoTenue, letterSpacing: 0.8 },
  detalleValor: { fontSize: 16, fontWeight: '800', color: Colores.texto, marginTop: 2 },
  separador: { height: 1, backgroundColor: Colores.borde, marginVertical: 10, marginLeft: 54 },

  turno: { borderRadius: Radios.lg, padding: 18, marginBottom: 14 },
  turnoClaro: { backgroundColor: Colores.superficie, ...Sombras.suave },
  turnoInterior: { flexDirection: 'row', alignItems: 'center' },
  turnoFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  turnoFecha: { fontSize: 17, fontWeight: '800', color: Colores.primario },
  turnoDetalle: { fontSize: 14, color: Colores.textoSuave, marginTop: 6 },
  botonCancelar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: Radios.md,
    borderWidth: 1.5,
    borderColor: Colores.peligro
  },
  botonCancelarTexto: { color: Colores.peligro, fontWeight: '800', fontSize: 13 }
});
