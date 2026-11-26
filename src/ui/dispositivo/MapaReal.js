import React, { useState } from 'react';
import { ActivityIndicator, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Boton, Icono } from '../componentes/ComponentesUI';
import { calcularTeselas } from '../../compartido/reglasMapa';
import { Colores, Radios, Sombras } from '../tema/Tema';

// Componente PURO de interfaz: muestra el estado de la ubicación que le entrega el frontend por props.
// `ubicacion` = { cargando, error, region, distanciaKm } ; la lectura y validación del GPS no ocurren aquí.
//
// El mapa se dibuja con imágenes (teselas) de OpenStreetMap: no necesita clave de API ni módulos nativos, por lo que
// no puede cerrar la aplicación. Si no hay internet para bajar las teselas, igualmente se ve el marcador y el aviso.
const ALTO_MAPA = 260;
const AGENTE = { 'User-Agent': 'PilaresDeEsperanza/1.0 (aplicacion de pacientes)' };

const abrirEnMapas = (region) => {
  Linking.openURL(`https://www.openstreetmap.org/?mlat=${region.latitude}&mlon=${region.longitude}#map=16/${region.latitude}/${region.longitude}`)
    .catch(() => {});
};

const MapaTeselas = ({ region }) => {
  const [ancho, setAncho] = useState(0);
  const teselas = ancho > 0 ? calcularTeselas({ latitud: region.latitude, longitud: region.longitude, ancho, alto: ALTO_MAPA }) : [];

  return (
    <View style={styles.mapContainer} onLayout={(e) => setAncho(Math.round(e.nativeEvent.layout.width))}>
      {teselas.map((t) => (
        <Image
          key={t.clave}
          source={{ uri: t.url, headers: AGENTE }}
          style={{ position: 'absolute', left: t.izquierda, top: t.arriba, width: t.tamano, height: t.tamano }}
        />
      ))}
      <View style={styles.marcador} pointerEvents="none">
        <Icono nombre="location" tamano={44} color={Colores.peligro} />
      </View>
      <Text style={styles.atribucion}>© OpenStreetMap</Text>
    </View>
  );
};

export const MapaReal = ({ ubicacion, onReintentar }) => {
  const { cargando, error, region, distanciaKm } = ubicacion;

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color={Colores.primarioMedio} />
        <Text style={styles.cargandoTexto}>Cargando GPS real...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icono nombre="location-outline" tamano={34} color={Colores.peligro} />
        <Text style={styles.errorTexto}>{error}</Text>
        <Boton titulo="Reintentar" icono="refresh-outline" variante="secundario" compacto onPress={onReintentar} />
      </View>
    );
  }

  return (
    <View>
      <MapaTeselas region={region} />
      <TouchableOpacity onPress={() => abrirEnMapas(region)} style={styles.enlaceMapa} accessibilityRole="button">
        <Text style={styles.enlaceMapaTexto}>Ver en el mapa completo</Text>
      </TouchableOpacity>
      {distanciaKm !== null && (
        <View style={styles.cobertura}>
          <Icono nombre="checkmark-circle" tamano={18} color={Colores.exito} />
          <Text style={styles.coberturaTexto}>Dentro del área de cobertura ({Math.round(distanciaKm)} km del centro)</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cargando: { alignItems: 'center', paddingVertical: 36, gap: 12 },
  cargandoTexto: { color: Colores.textoSuave, fontWeight: '600' },
  mapContainer: {
    height: ALTO_MAPA,
    width: '100%',
    borderRadius: Radios.lg,
    overflow: 'hidden',
    marginTop: 4,
    backgroundColor: Colores.menta,
    ...Sombras.suave
  },
  // El pico del ícono queda sobre el centro exacto del mapa.
  marcador: { position: 'absolute', left: 0, right: 0, top: ALTO_MAPA / 2 - 44, alignItems: 'center' },
  atribucion: {
    position: 'absolute',
    right: 6,
    bottom: 4,
    fontSize: 10,
    color: '#333333',
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 4,
    borderRadius: 4
  },
  enlaceMapa: { alignItems: 'center', marginTop: 10 },
  enlaceMapaTexto: { color: Colores.primarioMedio, fontWeight: '800', fontSize: 13 },
  cobertura: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colores.exitoFondo,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radios.md,
    marginVertical: 14
  },
  coberturaTexto: { color: Colores.exito, fontWeight: '700', fontSize: 13, flexShrink: 1 },
  errorContainer: { backgroundColor: Colores.peligroFondo, padding: 20, borderRadius: Radios.lg, marginBottom: 16, alignItems: 'center', gap: 12 },
  errorTexto: { color: Colores.peligro, fontWeight: '700', textAlign: 'center', lineHeight: 20 }
});
