import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colores, Gradientes, Radios, Sombras } from '../tema/Tema';

// Biblioteca de componentes visuales reutilizables (sin lógica de negocio).

export const Icono = ({ nombre, tamano = 22, color = Colores.primario, style }) => (
  <Ionicons name={nombre} size={tamano} color={color} style={style} />
);

// Entrada suave: aparece desplazándose levemente hacia arriba.
export const Aparecer = ({ children, retraso = 0, distancia = 18, style }) => {
  const progreso = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progreso, {
      toValue: 1,
      duration: 480,
      delay: retraso,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();
  }, [progreso, retraso]);

  // Con distancia 0 solo se anima la opacidad: así no se aplica ninguna transformación a los
  // contenedores de formularios (una transformación animada sobre un TextInput puede desplazar el cursor y el foco).
  const transformacion = distancia === 0
    ? undefined
    : [{ translateY: progreso.interpolate({ inputRange: [0, 1], outputRange: [distancia, 0] }) }];

  return (
    <Animated.View style={[{ opacity: progreso }, transformacion && { transform: transformacion }, style]}>
      {children}
    </Animated.View>
  );
};

// Latido continuo para llamar la atención (por ejemplo, el botón de emergencia).
export const Latido = ({ children, style }) => {
  const escala = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(escala, { toValue: 1.04, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(escala, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
      ])
    );
    animacion.start();
    return () => animacion.stop();
  }, [escala]);
  return <Animated.View style={[{ transform: [{ scale: escala }] }, style]}>{children}</Animated.View>;
};

const VARIANTES = {
  primario: { gradiente: Gradientes.principal, texto: '#FFFFFF', sombra: true },
  acento: { gradiente: Gradientes.acento, texto: Colores.primario, sombra: true },
  peligro: { gradiente: Gradientes.peligro, texto: '#FFFFFF', sombra: true },
  secundario: { fondo: Colores.superficie, borde: Colores.borde, texto: Colores.primario },
  contorno: { fondo: 'transparent', borde: Colores.peligro, texto: Colores.peligro },
  fantasma: { fondo: 'transparent', texto: Colores.primarioMedio }
};

export const Boton = ({ titulo, onPress, variante = 'primario', icono, deshabilitado = false, compacto = false, style }) => {
  const escala = useRef(new Animated.Value(1)).current;
  const animar = (valor) => Animated.spring(escala, { toValue: valor, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  const cfg = VARIANTES[variante];

  const contenido = (
    <View style={[estilos.botonInterno, compacto && { paddingVertical: 10 }]}>
      {icono ? <Icono nombre={icono} tamano={20} color={cfg.texto} style={{ marginRight: 8 }} /> : null}
      <Text style={[estilos.botonTexto, { color: cfg.texto }, compacto && { fontSize: 13 }]}>{titulo}</Text>
    </View>
  );

  return (
    <Animated.View style={[{ transform: [{ scale: escala }], opacity: deshabilitado ? 0.45 : 1 }, style]}>
      <Pressable
        onPress={onPress}
        disabled={deshabilitado}
        onPressIn={() => animar(0.97)}
        onPressOut={() => animar(1)}
        accessibilityRole="button"
        accessibilityLabel={titulo}
        accessibilityState={{ disabled: deshabilitado }}
      >
        {cfg.gradiente ? (
          <LinearGradient
            colors={cfg.gradiente}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[estilos.boton, cfg.sombra && Sombras.suave]}
          >
            {contenido}
          </LinearGradient>
        ) : (
          <View style={[estilos.boton, { backgroundColor: cfg.fondo, borderWidth: cfg.borde ? 1.5 : 0, borderColor: cfg.borde }]}>
            {contenido}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export const CampoTexto = ({ etiqueta, icono, prefijo, secureTextEntry, style, ...props }) => {
  const [foco, setFoco] = useState(false);
  const [oculto, setOculto] = useState(Boolean(secureTextEntry));

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {etiqueta ? <Text style={estilos.etiqueta}>{etiqueta}</Text> : null}
      <View style={[estilos.campo, foco && estilos.campoFoco]}>
        {icono ? <Icono nombre={icono} tamano={20} color={foco ? Colores.primarioMedio : Colores.textoTenue} style={{ marginRight: 10 }} /> : null}
        {prefijo ? <Text style={estilos.prefijo}>{prefijo}</Text> : null}
        <TextInput
          style={estilos.input}
          placeholderTextColor={Colores.textoTenue}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          secureTextEntry={oculto}
          {...props}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setOculto(!oculto)}
            accessibilityRole="button"
            accessibilityLabel={oculto ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icono nombre={oculto ? 'eye-outline' : 'eye-off-outline'} tamano={20} color={Colores.textoTenue} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const TONOS = {
  exito: { fondo: Colores.exitoFondo, texto: Colores.exito },
  alerta: { fondo: Colores.alertaFondo, texto: Colores.alerta },
  peligro: { fondo: Colores.peligroFondo, texto: Colores.peligro },
  info: { fondo: Colores.infoFondo, texto: Colores.info },
  neutro: { fondo: '#EDF0EF', texto: Colores.textoSuave },
  acento: { fondo: Colores.acento, texto: Colores.primario }
};

export const Insignia = ({ texto, tono = 'info', icono }) => {
  const t = TONOS[tono] || TONOS.info;
  return (
    <View style={[estilos.insignia, { backgroundColor: t.fondo }]}>
      {icono ? <Icono nombre={icono} tamano={13} color={t.texto} style={{ marginRight: 4 }} /> : null}
      <Text style={[estilos.insigniaTexto, { color: t.texto }]}>{texto}</Text>
    </View>
  );
};

export const Tarjeta = ({ children, style }) => <View style={[estilos.tarjeta, style]}>{children}</View>;

// Burbuja circular con un icono, para listados y menús.
export const BurbujaIcono = ({ icono, color = Colores.primarioMedio, fondo = Colores.menta, tamano = 48 }) => (
  <View style={{ width: tamano, height: tamano, borderRadius: tamano / 2, backgroundColor: fondo, alignItems: 'center', justifyContent: 'center' }}>
    <Icono nombre={icono} tamano={tamano * 0.5} color={color} />
  </View>
);

const Decoracion = () => (
  <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <View style={[estilos.circulo, { width: 220, height: 220, right: -70, top: -80, backgroundColor: 'rgba(213,243,106,0.10)' }]} />
    <View style={[estilos.circulo, { width: 120, height: 120, left: -40, bottom: -30, backgroundColor: 'rgba(255,255,255,0.06)' }]} />
  </View>
);

// Cabecera con degradado para las pantallas internas.
export const CabeceraPantalla = ({ titulo, subtitulo, onVolver, derecha, children, extraAbajo = 0 }) => {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={Gradientes.principal}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[estilos.cabecera, { paddingTop: insets.top + 12, paddingBottom: 24 + extraAbajo }]}
    >
      <Decoracion />
      <View style={estilos.cabeceraFila}>
        {onVolver ? (
          <TouchableOpacity onPress={onVolver} style={estilos.botonVolver} accessibilityRole="button" accessibilityLabel="Volver">
            <Icono nombre="chevron-back" tamano={22} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1 }}>
          {titulo ? <Text style={estilos.cabeceraTitulo}>{titulo}</Text> : null}
          {subtitulo ? <Text style={estilos.cabeceraSubtitulo}>{subtitulo}</Text> : null}
        </View>
        {derecha}
      </View>
      {children}
    </LinearGradient>
  );
};

// Pantalla de acceso: cabecera con degradado y hoja blanca superpuesta que contiene el formulario.
export const LayoutAuth = ({ titulo, subtitulo, onVolver, children, encabezado }) => (
  <View style={{ backgroundColor: Colores.fondo }}>
    <CabeceraPantalla titulo={titulo} subtitulo={subtitulo} onVolver={onVolver} extraAbajo={46}>
      {encabezado}
    </CabeceraPantalla>
    <Aparecer distancia={0} style={estilos.hoja}>{children}</Aparecer>
    <View style={{ height: 36 }} />
  </View>
);

// Indicador de actividad discreto: círculo girando (y "Procesando..." si hay lugar) fijo arriba y centrado, sobre
// la cabecera de cada pantalla. Sin tarjeta ni velo; la capa transparente solo evita toques mientras se trabaja.
const ANCHO_MINIMO_CON_TEXTO = 340;
export const IndicadorProcesando = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  return (
    <View style={estilos.capaProcesando} accessibilityRole="progressbar" accessibilityLabel="Procesando">
      <View style={[estilos.indicadorProcesando, { top: insets.top + 6 }]} pointerEvents="none">
        <ActivityIndicator size="small" color="#FFFFFF" />
        {width >= ANCHO_MINIMO_CON_TEXTO ? <Text style={estilos.textoProcesando}>Procesando...</Text> : null}
      </View>
    </View>
  );
};

// Estado vacío con icono.
export const EstadoVacio = ({ icono, titulo, descripcion }) => (
  <View style={estilos.vacio}>
    <BurbujaIcono icono={icono} tamano={72} />
    <Text style={estilos.vacioTitulo}>{titulo}</Text>
    {descripcion ? <Text style={estilos.vacioTexto}>{descripcion}</Text> : null}
  </View>
);

const estilos = StyleSheet.create({
  capaProcesando: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
  indicadorProcesando: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: Radios.pill,
    backgroundColor: 'rgba(11, 38, 34, 0.55)'
  },
  textoProcesando: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  boton:{ borderRadius: Radios.md, overflow: 'hidden' },
  botonInterno: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  botonTexto: { fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },

  etiqueta: { fontSize: 12, fontWeight: '700', color: Colores.textoSuave, marginBottom: 7, letterSpacing: 0.4 },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAF9',
    borderWidth: 1.5,
    borderColor: Colores.borde,
    borderRadius: Radios.md,
    paddingHorizontal: 14,
    minHeight: 54
  },
  campoFoco: { borderColor: Colores.primarioClaro, backgroundColor: '#FFFFFF' },
  prefijo: { fontSize: 15, fontWeight: '700', color: Colores.primarioMedio, marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: Colores.texto, paddingVertical: 12 },

  insignia: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: Radios.pill },
  insigniaTexto: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },

  tarjeta: { backgroundColor: Colores.superficie, borderRadius: Radios.lg, padding: 18, ...Sombras.suave },

  cabecera: { paddingHorizontal: 20, borderBottomLeftRadius: 34, borderBottomRightRadius: 34, overflow: 'hidden' },
  cabeceraFila: { flexDirection: 'row', alignItems: 'center' },
  cabeceraTitulo: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  cabeceraSubtitulo: { color: 'rgba(255,255,255,0.78)', fontSize: 14, marginTop: 3 },
  botonVolver: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  circulo: { position: 'absolute', borderRadius: 999 },

  hoja: {
    marginTop: -40,
    marginHorizontal: 16,
    backgroundColor: Colores.superficie,
    borderRadius: Radios.xl,
    padding: 22,
    ...Sombras.fuerte
  },

  vacio: { alignItems: 'center', padding: 28 },
  vacioTitulo: { fontSize: 18, fontWeight: '800', color: Colores.texto, marginTop: 16, textAlign: 'center' },
  vacioTexto: { fontSize: 14, color: Colores.textoSuave, marginTop: 6, textAlign: 'center', lineHeight: 20 }
});
