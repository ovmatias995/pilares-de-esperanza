import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton, BurbujaIcono, Icono } from '../componentes/ComponentesUI';
import { Colores, Gradientes, Radios } from '../tema/Tema';

const PASOS = [
  { clave: 'DNI_FRENTE', etiqueta: 'Frente' },
  { clave: 'DNI_DORSO', etiqueta: 'Dorso' },
  { clave: 'AUTENTICACION_FACIAL', etiqueta: 'Rostro' }
];

const RELACION_DNI = 1.586; // proporción de una tarjeta ID-1 (ancho / alto)
const RELACION_ROSTRO = 0.78; // óvalo facial (ancho / alto)

// Calcula el recuadro de encuadre a partir del tamaño REAL del visor, para que quede siempre centrado
// y proporcional sin depender de medidas fijas ni de superposiciones translúcidas sobre la cámara.
const calcularMarco = (visor, esRostro) => {
  if (!visor) return null;
  const margen = 28;
  const anchoMax = visor.ancho - margen * 2;
  const altoMax = visor.alto - 96; // reserva espacio para la instrucción inferior
  if (esRostro) {
    const alto = Math.min(altoMax, anchoMax / RELACION_ROSTRO);
    return { ancho: alto * RELACION_ROSTRO, alto };
  }
  const ancho = Math.min(anchoMax, altoMax * RELACION_DNI);
  return { ancho, alto: ancho / RELACION_DNI };
};

export const CamaraNativa = ({ tipoLente, pasoActual, onCapturaExitosa, onCancelar }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturando, setCapturando] = useState(false);
  const [visor, setVisor] = useState(null);
  const insets = useSafeAreaInsets();

  if (!permission) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <ActivityIndicator size="large" color={Colores.acento} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <LinearGradient colors={Gradientes.principal} style={[styles.container, styles.centrado, { padding: 28 }]}>
        <BurbujaIcono icono="camera-outline" tamano={84} color={Colores.primario} fondo={Colores.acento} />
        <Text style={styles.permisoTitulo}>Necesitamos su cámara</Text>
        <Text style={styles.texto}>La aplicación requiere acceso a la cámara para la validación de identidad.</Text>
        <Boton titulo="Otorgar Permiso" icono="shield-checkmark-outline" variante="acento" onPress={requestPermission} style={{ alignSelf: 'stretch', marginTop: 8 }} />
        <Boton titulo="Cancelar" variante="fantasma" onPress={onCancelar} style={{ alignSelf: 'stretch', marginTop: 8 }} />
      </LinearGradient>
    );
  }

  const obtenerInstruccion = () => {
    if (pasoActual === 'DNI_FRENTE') return 'Coloque el FRENTE de su DNI dentro del área';
    if (pasoActual === 'DNI_DORSO') return 'Coloque el DORSO de su DNI dentro del área';
    if (pasoActual === 'AUTENTICACION_FACIAL') return 'Coloque su ROSTRO dentro del área (Selfie)';
    return 'Coloque el documento dentro del área';
  };

  const tomarFoto = () => {
    if (!capturando) {
      setCapturando(true);
      setTimeout(() => {
        setCapturando(false);
        onCapturaExitosa('mock_uri_foto');
      }, 2000);
    }
  };

  const esRostro = pasoActual === 'AUTENTICACION_FACIAL';
  const indicePaso = PASOS.findIndex(p => p.clave === pasoActual);
  const marco = calcularMarco(visor, esRostro);

  // Estructura en columna: barra superior opaca / visor con la cámara / barra inferior opaca.
  // Ningún elemento translúcido se superpone al preview (evita que Android lo repinte a medias)
  // y el recuadro se mide contra el visor real, por lo que queda alineado en cualquier pantalla.
  return (
    <View style={styles.container}>
      <View style={[styles.barraSuperior, { paddingTop: insets.top + 10 }]}>
        {PASOS.map((p, i) => (
          <View key={p.clave} style={[styles.pasoChip, i === indicePaso && styles.pasoChipActivo, i < indicePaso && styles.pasoChipHecho]}>
            <Text style={[styles.pasoTexto, i <= indicePaso && { color: Colores.primario }]}>{i + 1} · {p.etiqueta}</Text>
          </View>
        ))}
      </View>

      <View
        style={styles.visor}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setVisor(prev => (prev && prev.ancho === width && prev.alto === height ? prev : { ancho: width, alto: height }));
        }}
      >
        {/* key: reinicia la vista nativa al cambiar de lente (frontal/trasera) */}
        <CameraView key={tipoLente} style={StyleSheet.absoluteFill} facing={tipoLente === 'front' ? 'front' : 'back'} />

        {marco && (
          <View style={styles.capaMarco} pointerEvents="none">
            <View style={[styles.marco, { width: marco.ancho, height: marco.alto }]}>
              <View style={[styles.esquina, styles.esqSupIzq, esRostro && styles.esqRostro]} />
              <View style={[styles.esquina, styles.esqSupDer, esRostro && styles.esqRostro]} />
              <View style={[styles.esquina, styles.esqInfIzq, esRostro && styles.esqRostro]} />
              <View style={[styles.esquina, styles.esqInfDer, esRostro && styles.esqRostro]} />
            </View>
          </View>
        )}

        <View style={styles.instruccionContenedor} pointerEvents="none">
          <Text style={styles.instruccion}>{obtenerInstruccion()}</Text>
        </View>
      </View>

      <View style={[styles.controles, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.botonLateral} onPress={onCancelar} accessibilityRole="button" accessibilityLabel="Cancelar">
          <Icono nombre="close" tamano={26} color="#FFFFFF" />
        </TouchableOpacity>

        {capturando ? (
          <View style={styles.obturador}>
            <ActivityIndicator size="large" color={Colores.primario} />
          </View>
        ) : (
          <TouchableOpacity style={styles.obturadorExterior} onPress={tomarFoto} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Capturar foto">
            <View style={styles.obturador}>
              <Icono nombre="camera" tamano={30} color={Colores.primario} />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.botonLateralVacio} />
      </View>
    </View>
  );
};

const ESQ = 34;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centrado: { alignItems: 'center', justifyContent: 'center' },
  barraSuperior: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 12,
    backgroundColor: Colores.primarioOscuro || '#0B2622'
  },
  visor: { flex: 1, overflow: 'hidden', backgroundColor: '#000' },
  // `StyleSheet.absoluteFillObject` ya no existe en React Native 0.88 (devolvía undefined y la capa quedaba arriba).
  capaMarco: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  marco: {},
  esquina: { position: 'absolute', width: ESQ, height: ESQ, borderColor: Colores.acento },
  esqRostro: { width: 46, height: 46 },
  esqSupIzq: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 22 },
  esqSupDer: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 22 },
  esqInfIzq: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 22 },
  esqInfDer: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 22 },
  instruccionContenedor: { position: 'absolute', left: 16, right: 16, bottom: 16, alignItems: 'center' },
  instruccion: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    textAlign: 'center',
    backgroundColor: '#0B2622',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radios.pill,
    overflow: 'hidden'
  },
  pasoChip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: Radios.pill, backgroundColor: '#1B3D37' },
  pasoChipActivo: { backgroundColor: Colores.acento },
  pasoChipHecho: { backgroundColor: '#A9C75A' },
  pasoTexto: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  controles: {
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#0B2622'
  },
  botonLateral: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#1B3D37', alignItems: 'center', justifyContent: 'center' },
  botonLateralVacio: { width: 52, height: 52 },
  obturadorExterior: { width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: Colores.acento, alignItems: 'center', justifyContent: 'center' },
  obturador: { width: 66, height: 66, borderRadius: 33, backgroundColor: Colores.acento, alignItems: 'center', justifyContent: 'center' },
  permisoTitulo: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 22, letterSpacing: -0.6 },
  texto: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginVertical: 14, fontSize: 15, lineHeight: 22 }
});
