import React, { useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FooterContacto } from '../componentes/ComponentesClinica';
import {
  Aparecer,
  Boton,
  BurbujaIcono,
  CabeceraPantalla,
  EstadoVacio,
  Icono,
  Latido,
  Tarjeta
} from '../componentes/ComponentesUI';
import { PREGUNTAS_FRECUENTES, CONTACTO_CLINICA } from '../../compartido/DatosClinica';
import { INTRODUCCION_CUD, PASOS_CUD, SECCIONES_CUD } from '../../compartido/InfoCUD';
import { formatearFechaHora, formatearFechaJunta } from '../../compartido/reglasRecordatorios';
import { Colores, Gradientes, iniciales, Radios, Sombras } from '../tema/Tema';

const TEXTO_ESTADO_CUD = { pendiente: 'Solicitud en revisión', aprobada: 'Solicitud aprobada', rechazada: 'Solicitud rechazada' };

const Contenido = ({ children }) => <View style={estilos.contenido}>{children}</View>;

const ACCESOS = [
  { clave: 'especialidades', titulo: 'Reservar Turno', icono: 'calendar', color: Colores.primarioMedio, fondo: Colores.menta },
  { clave: 'misTurnos', titulo: 'Mis Turnos', icono: 'time', color: Colores.info, fondo: Colores.infoFondo },
  { clave: 'historial', titulo: 'Historial Clínico', icono: 'document-text', color: Colores.lila, fondo: Colores.lilaFondo },
  { clave: 'perfil', titulo: 'Mi Perfil', icono: 'person', color: Colores.alerta, fondo: Colores.alertaFondo },
  { clave: 'center', titulo: 'Servicios Center', icono: 'medkit', color: Colores.peligro, fondo: Colores.peligroFondo },
  { clave: 'soporte', titulo: 'Soporte y Ayuda', icono: 'headset', color: Colores.exito, fondo: Colores.exitoFondo }
];

export const Escritorio = ({
  nombre,
  proximoTurno,
  onNavegarEspecialidades,
  onNavegarMisTurnos,
  onNavegarHistorial,
  onNavegarPerfil,
  onNavegarServiciosCenter,
  onNavegarSoporte,
  onNavegarCud,
  estadoCud
}) => {
  const insets = useSafeAreaInsets();
  const acciones = {
    especialidades: onNavegarEspecialidades,
    misTurnos: onNavegarMisTurnos,
    historial: onNavegarHistorial,
    perfil: onNavegarPerfil,
    center: onNavegarServiciosCenter,
    soporte: onNavegarSoporte
  };

  return (
    <View style={estilos.pantalla}>
      <LinearGradient
        colors={Gradientes.principal}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[estilos.cabeceraInicio, { paddingTop: insets.top + 18 }]}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View style={[estilos.circulo, { width: 240, height: 240, right: -80, top: -90, backgroundColor: 'rgba(213,243,106,0.10)' }]} />
          <View style={[estilos.circulo, { width: 110, height: 110, left: -30, bottom: 20, backgroundColor: 'rgba(255,255,255,0.06)' }]} />
        </View>
        <View style={estilos.saludoFila}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.saludoPequeno}>Buen día,</Text>
            <Text style={estilos.saludoNombre} numberOfLines={1}>{nombre || 'Paciente'}</Text>
            <Text style={estilos.saludoSubtitulo}>Es un placer cuidarle hoy.</Text>
          </View>
          <View style={estilos.avatar}>
            <Text style={estilos.avatarTexto}>{iniciales(nombre || 'Paciente')}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={estilos.contenidoInicio}>
        {proximoTurno ? (
          <Aparecer>
            <LinearGradient colors={Gradientes.acento} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={estilos.proximoTurno}>
              <View style={estilos.proximoIcono}>
                <Icono nombre="calendar" tamano={24} color={Colores.acento} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={estilos.proximoEtiqueta}>PRÓXIMO TURNO • {proximoTurno.fecha}</Text>
                <Text style={estilos.proximoDetalle}>
                  {proximoTurno.especialidad} • {proximoTurno.hora}
                </Text>
                <Text style={estilos.proximoProfesional}>{proximoTurno.profesional}</Text>
              </View>
            </LinearGradient>
          </Aparecer>
        ) : (
          <Aparecer>
            <View style={estilos.sinTurno}>
              <Icono nombre="sparkles-outline" tamano={22} color={Colores.primarioMedio} />
              <Text style={estilos.sinTurnoTexto}>Reserve su próximo turno en pocos pasos.</Text>
            </View>
          </Aparecer>
        )}

        <View style={estilos.grilla}>
          {ACCESOS.map((a, i) => (
            <Aparecer key={a.clave} retraso={120 + i * 60} style={estilos.celdaGrilla}>
              <TouchableOpacity
                style={estilos.acceso}
                onPress={acciones[a.clave]}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={a.titulo}
              >
                <BurbujaIcono icono={a.icono} color={a.color} fondo={a.fondo} tamano={54} />
                <Text style={estilos.accesoTexto}>{a.titulo}</Text>
              </TouchableOpacity>
            </Aparecer>
          ))}
        </View>

        <Aparecer retraso={120 + ACCESOS.length * 60}>
          <TouchableOpacity
            onPress={onNavegarCud}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Solicitar CUD, Certificado Único de Discapacidad"
          >
            <LinearGradient colors={Gradientes.principal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={estilos.botonCud}>
              <View style={estilos.botonCudIcono}>
                <Icono nombre="ribbon" tamano={26} color={Colores.acento} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={estilos.botonCudTitulo}>Solicitar CUD</Text>
                <Text style={estilos.botonCudSubtitulo}>{TEXTO_ESTADO_CUD[estadoCud] || 'Certificado Único de Discapacidad'}</Text>
              </View>
              <Icono nombre="chevron-forward" tamano={22} color={Colores.acento} />
            </LinearGradient>
          </TouchableOpacity>
        </Aparecer>
      </View>
    </View>
  );
};

export const SolicitarCUD = ({ solicitud, onSolicitar, onVolver }) => (
  <View style={estilos.pantalla}>
    <CabeceraPantalla titulo="Solicitar CUD" subtitulo="Certificado Único de Discapacidad" onVolver={onVolver} />
    <View style={estilos.contenido}>
      <Aparecer>
        <Tarjeta style={{ marginBottom: 16 }}>
          <BurbujaIcono icono="ribbon" tamano={46} />
          <Text style={estilos.cudIntro}>{INTRODUCCION_CUD}</Text>
          {PASOS_CUD.map((paso, i) => (
            <View key={paso} style={estilos.cudPaso}>
              <View style={estilos.cudNumero}>
                <Text style={estilos.cudNumeroTexto}>{i + 1}</Text>
              </View>
              <Text style={estilos.cudPasoTexto}>{paso}</Text>
            </View>
          ))}
        </Tarjeta>
      </Aparecer>

      {SECCIONES_CUD.map((seccion, i) => (
        <Aparecer key={seccion.clave} retraso={120 + i * 80}>
          <Tarjeta style={{ marginBottom: 16 }}>
            <View style={estilos.cudSeccionCabecera}>
              <BurbujaIcono icono={seccion.icono} tamano={38} />
              <Text style={estilos.cudSeccionTitulo}>{seccion.titulo}</Text>
            </View>
            {seccion.items.map((item) => (
              <View key={item.etiqueta} style={estilos.cudItem}>
                <View style={estilos.cudPunto} />
                <Text style={estilos.cudItemTexto}>
                  <Text style={estilos.cudItemEtiqueta}>{item.etiqueta}: </Text>
                  {item.texto}
                </Text>
              </View>
            ))}
          </Tarjeta>
        </Aparecer>
      ))}

      <Aparecer retraso={320}>
        {!solicitud.enviada && (
          <Boton
            titulo="Solicitar Certificado Único de Discapacidad"
            icono="ribbon-outline"
            onPress={onSolicitar}
            deshabilitado={solicitud.cargando}
          />
        )}

        {solicitud.enviada && solicitud.estado === 'aprobada' && (
          <View style={[estilos.cudEnviada, estilos.cudAprobada]}>
            <BurbujaIcono icono="checkmark-done-circle" tamano={46} color={Colores.exito} fondo={Colores.exitoFondo} />
            <View style={{ flex: 1 }}>
              <Text style={estilos.cudEnviadaTitulo}>Solicitud aprobada</Text>
              <Text style={estilos.cudEnviadaTexto}>
                Debe presentarse ante la Junta Evaluadora Interdisciplinaria el{' '}
                <Text style={estilos.cudItemEtiqueta}>{formatearFechaJunta(solicitud.fechaJunta)}</Text> a las{' '}
                <Text style={estilos.cudItemEtiqueta}>{solicitud.horaJunta} hs</Text>.
              </Text>
            </View>
          </View>
        )}

        {solicitud.enviada && solicitud.estado === 'rechazada' && (
          <View style={[estilos.cudEnviada, estilos.cudRechazada]}>
            <BurbujaIcono icono="close-circle" tamano={46} color={Colores.peligro} fondo={Colores.peligroFondo} />
            <View style={{ flex: 1 }}>
              <Text style={[estilos.cudEnviadaTitulo, { color: Colores.peligro }]}>Solicitud rechazada</Text>
              <Text style={estilos.cudEnviadaTexto}>Comuníquese con la administración de la clínica para más información.</Text>
            </View>
          </View>
        )}

        {solicitud.enviada && solicitud.estado !== 'aprobada' && solicitud.estado !== 'rechazada' && (
          <View style={estilos.cudEnviada}>
            <BurbujaIcono icono="checkmark-circle" tamano={46} color={Colores.exito} fondo={Colores.exitoFondo} />
            <View style={{ flex: 1 }}>
              <Text style={estilos.cudEnviadaTitulo}>Solicitud enviada</Text>
              <Text style={estilos.cudEnviadaTexto}>
                {solicitud.fecha ? `Registrada el ${formatearFechaHora(solicitud.fecha)}. ` : ''}La administración de la clínica la está revisando.
              </Text>
            </View>
          </View>
        )}
      </Aparecer>
    </View>
  </View>
);

export const HistorialClinico = ({ onVolver }) => (
  <View style={estilos.pantalla}>
    <CabeceraPantalla titulo="Historial Clínico" subtitulo="Su registro de atenciones" onVolver={onVolver} />
    <Contenido>
      <Tarjeta>
        <EstadoVacio icono="document-text-outline" titulo="Su historial clínico aparecerá aquí" descripcion="Cuando reciba atenciones, podrá consultarlas en esta sección." />
      </Tarjeta>
    </Contenido>
  </View>
);

const FilaDato = ({ icono, etiqueta, valor }) => (
  <View style={estilos.filaDato}>
    <BurbujaIcono icono={icono} tamano={38} />
    <View style={{ flex: 1 }}>
      <Text style={estilos.datoEtiqueta}>{etiqueta}</Text>
      <Text style={estilos.datoValor} numberOfLines={1}>{valor}</Text>
    </View>
  </View>
);

export const Perfil = ({ datos, onCerrarSesion, onVolver }) => (
  <View style={estilos.pantalla}>
    <CabeceraPantalla onVolver={onVolver} extraAbajo={52}>
      <View style={estilos.perfilCabecera}>
        <View style={estilos.avatarGrande}>
          <Text style={estilos.avatarGrandeTexto}>{iniciales(datos.nombre)}</Text>
        </View>
        <Text style={estilos.perfilNombre}>{datos.nombre}</Text>
        <Text style={estilos.perfilAfiliado}>Afiliado/a N° {datos.afiliado}</Text>
      </View>
    </CabeceraPantalla>

    <View style={[estilos.contenido, { marginTop: -34 }]}>
      <Aparecer>
        <Tarjeta style={{ marginBottom: 16 }}>
          <Text style={estilos.seccion}>Datos personales</Text>
          <FilaDato icono="card-outline" etiqueta="DNI" valor={datos.dni} />
          <FilaDato icono="mail-outline" etiqueta="Email" valor={datos.correo} />
          <FilaDato icono="call-outline" etiqueta="Teléfono" valor={datos.telefono} />
        </Tarjeta>

        <LinearGradient colors={Gradientes.acento} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={estilos.cobertura}>
          <View style={estilos.coberturaIcono}>
            <Icono nombre="shield-checkmark" tamano={24} color={Colores.acento} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={estilos.coberturaEtiqueta}>COBERTURA MÉDICA</Text>
            <Text style={estilos.coberturaTitulo}>{datos.cobertura}</Text>
            <Text style={estilos.coberturaEstado}>{datos.estadoCobertura}</Text>
          </View>
        </LinearGradient>

        <Boton titulo="Cerrar Sesión" icono="log-out-outline" variante="contorno" onPress={onCerrarSesion} style={{ marginTop: 20 }} />
      </Aparecer>
    </View>
  </View>
);

export const ServiciosCenter = ({ onVolver }) => (
  <View style={estilos.pantalla}>
    <CabeceraPantalla titulo="Servicios Center" subtitulo="Asistencia cuando la necesita" onVolver={onVolver} />
    <Contenido>
      <Aparecer>
        <Latido>
          <Boton titulo="Llamar Ambulancia (Emergencia)" icono="medkit" variante="peligro" onPress={() => Linking.openURL(CONTACTO_CLINICA.emergenciasUrl)} />
        </Latido>
        <Text style={estilos.notaEmergencia}>Ante una emergencia médica, llame de inmediato al 107.</Text>
        <Boton titulo="Contactar Recepción Clínica" icono="call" onPress={() => Linking.openURL(CONTACTO_CLINICA.telefonoFijoUrl)} style={{ marginTop: 6 }} />
        <FooterContacto />
      </Aparecer>
    </Contenido>
  </View>
);

export const SoporteAyuda = ({ onVolver }) => {
  const [preguntaActiva, setPreguntaActiva] = useState(null);

  if (preguntaActiva) {
    return (
      <View style={estilos.pantalla}>
        <CabeceraPantalla titulo="Respuesta" subtitulo="Soporte y Ayuda" onVolver={() => setPreguntaActiva(null)} />
        <Contenido>
          <Aparecer>
            <Tarjeta>
              <BurbujaIcono icono="help-circle" tamano={46} />
              <Text style={estilos.preguntaDetalle}>{preguntaActiva.p}</Text>
              <Text style={estilos.respuesta}>{preguntaActiva.r}</Text>
            </Tarjeta>
            <FooterContacto />
          </Aparecer>
        </Contenido>
      </View>
    );
  }

  return (
    <View style={estilos.pantalla}>
      <CabeceraPantalla titulo="Soporte y Ayuda" subtitulo="Preguntas frecuentes" onVolver={onVolver} />
      <View style={estilos.contenido}>
        {PREGUNTAS_FRECUENTES.map((faq, i) => (
          <Aparecer key={faq.id} retraso={i * 60}>
            <TouchableOpacity
              onPress={() => setPreguntaActiva(faq)}
              style={estilos.pregunta}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={faq.p}
            >
              <BurbujaIcono icono="help-circle-outline" tamano={40} />
              <Text style={estilos.preguntaTexto}>{faq.p}</Text>
              <Icono nombre="chevron-forward" tamano={20} color={Colores.textoTenue} />
            </TouchableOpacity>
          </Aparecer>
        ))}
        <FooterContacto />
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { padding: 18, paddingBottom: 40 },
  circulo: { position: 'absolute', borderRadius: 999 },
  seccion: { fontSize: 12, fontWeight: '800', color: Colores.textoSuave, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },

  cabeceraInicio: { paddingHorizontal: 22, paddingBottom: 64, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  saludoFila: { flexDirection: 'row', alignItems: 'center' },
  saludoPequeno: { color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: '600' },
  saludoNombre: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.7, marginTop: 2 },
  saludoSubtitulo: { color: Colores.acento, fontSize: 14, fontWeight: '600', marginTop: 4 },
  avatar: { width: 58, height: 58, borderRadius: 20, backgroundColor: Colores.acento, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  avatarTexto: { color: Colores.primario, fontWeight: '800', fontSize: 20 },

  contenidoInicio: { paddingHorizontal: 18, marginTop: -38, paddingBottom: 40 },
  proximoTurno: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: Radios.lg, ...Sombras.fuerte },
  proximoIcono: { width: 50, height: 50, borderRadius: 16, backgroundColor: Colores.primario, alignItems: 'center', justifyContent: 'center' },
  proximoEtiqueta: { color: Colores.primario, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, opacity: 0.8 },
  proximoDetalle: { color: Colores.primario, fontSize: 18, fontWeight: '800', marginTop: 3 },
  proximoProfesional: { color: Colores.primario, fontSize: 13, marginTop: 2, opacity: 0.85 },
  sinTurno: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colores.superficie, padding: 16, borderRadius: Radios.lg, ...Sombras.fuerte },
  sinTurnoTexto: { flex: 1, color: Colores.textoSuave, fontWeight: '600', fontSize: 14 },

  grilla: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 },
  celdaGrilla: { width: '48%', marginBottom: 14 },
  acceso: { backgroundColor: Colores.superficie, borderRadius: Radios.lg, paddingVertical: 22, paddingHorizontal: 12, alignItems: 'center', gap: 12, ...Sombras.suave },
  accesoTexto: { color: Colores.texto, fontWeight: '800', fontSize: 14, textAlign: 'center' },

  botonCud: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: Radios.lg, marginTop: 2, ...Sombras.fuerte },
  botonCudIcono: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(213,243,106,0.16)', alignItems: 'center', justifyContent: 'center' },
  botonCudTitulo: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  botonCudSubtitulo: { color: Colores.acento, fontSize: 13, fontWeight: '600', marginTop: 2 },

  cudIntro: { fontSize: 17, fontWeight: '800', color: Colores.primario, lineHeight: 25, marginTop: 14, marginBottom: 8 },
  cudPaso: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  cudNumero: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colores.acento, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  cudNumeroTexto: { color: Colores.primario, fontWeight: '800', fontSize: 14 },
  cudPasoTexto: { flex: 1, color: Colores.texto, fontSize: 15, lineHeight: 22 },
  cudEnviada: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colores.exitoFondo, padding: 16, borderRadius: Radios.lg },
  cudAprobada: { backgroundColor: Colores.exitoFondo },
  cudRechazada: { backgroundColor: Colores.peligroFondo },
  cudEnviadaTitulo: { color: Colores.exito, fontSize: 17, fontWeight: '800' },
  cudEnviadaTexto: { color: Colores.texto, fontSize: 14, lineHeight: 20, marginTop: 3 },
  cudSeccionCabecera: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  cudSeccionTitulo: { flex: 1, fontSize: 18, fontWeight: '800', color: Colores.primario, letterSpacing: -0.3 },
  cudItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 7 },
  cudPunto: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colores.primarioMedio, marginTop: 8 },
  cudItemTexto: { flex: 1, color: Colores.textoSuave, fontSize: 15, lineHeight: 22 },
  cudItemEtiqueta: { color: Colores.texto, fontWeight: '800' },

  filaDato: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 },
  datoEtiqueta: { fontSize: 11, fontWeight: '800', color: Colores.textoTenue, letterSpacing: 0.8, textTransform: 'uppercase' },
  datoValor: { fontSize: 16, fontWeight: '700', color: Colores.texto, marginTop: 1 },

  perfilCabecera: { alignItems: 'center', marginTop: 4 },
  avatarGrande: { width: 92, height: 92, borderRadius: 32, backgroundColor: Colores.acento, alignItems: 'center', justifyContent: 'center', ...Sombras.fuerte },
  avatarGrandeTexto: { color: Colores.primario, fontSize: 32, fontWeight: '800' },
  perfilNombre: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginTop: 14, textAlign: 'center' },
  perfilAfiliado: { color: Colores.acento, fontSize: 14, fontWeight: '700', marginTop: 4 },
  cobertura: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: Radios.lg },
  coberturaIcono: { width: 50, height: 50, borderRadius: 16, backgroundColor: Colores.primario, alignItems: 'center', justifyContent: 'center' },
  coberturaEtiqueta: { color: Colores.primario, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, opacity: 0.8 },
  coberturaTitulo: { color: Colores.primario, fontSize: 17, fontWeight: '800', marginTop: 3 },
  coberturaEstado: { color: Colores.primario, fontSize: 13, marginTop: 2, opacity: 0.85 },

  notaEmergencia: { textAlign: 'center', color: Colores.textoSuave, fontSize: 13, marginVertical: 14 },

  pregunta: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colores.superficie, padding: 14, borderRadius: Radios.lg, marginBottom: 12, ...Sombras.suave },
  preguntaTexto: { flex: 1, color: Colores.texto, fontWeight: '800', fontSize: 15 },
  preguntaDetalle: { fontSize: 21, fontWeight: '800', color: Colores.primario, letterSpacing: -0.4, marginTop: 14 },
  respuesta: { color: Colores.textoSuave, fontSize: 15, lineHeight: 24, marginTop: 12 }
});
