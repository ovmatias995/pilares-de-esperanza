import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colores, Gradientes, Radios, Sombras } from '../tema/Tema';
import { Icono } from './ComponentesUI';

export default function SelectorHorarios({ bloquesDisponibles, bloqueSeleccionado, onCambioBloque }) {
  if (!bloquesDisponibles || bloquesDisponibles.length === 0) {
    return (
      <View style={styles.contenedorVacio}>
        <Icono nombre="calendar-clear-outline" tamano={26} color={Colores.peligro} />
        <Text style={styles.textoVacio}>No hay disponibilidad en esta fecha.</Text>
      </View>
    );
  }

  return (
    <View style={styles.grillaHoraria}>
      {bloquesDisponibles.map((hora) => {
        const esActivo = bloqueSeleccionado === hora;
        const contenido = (
          <View style={styles.contenidoCelda}>
            <Icono nombre="time-outline" tamano={16} color={esActivo ? Colores.primario : Colores.textoTenue} />
            <Text style={[styles.txt, esActivo && styles.txtActivo]}>{hora}</Text>
          </View>
        );
        return (
          <TouchableOpacity
            key={hora}
            style={styles.celdaExterior}
            onPress={() => onCambioBloque(hora)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Horario ${hora}`}
            accessibilityState={{ selected: esActivo }}
          >
            {esActivo ? (
              <LinearGradient colors={Gradientes.acento} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.celda, styles.activa]}>
                {contenido}
              </LinearGradient>
            ) : (
              <View style={styles.celda}>{contenido}</View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grillaHoraria: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 12 },
  celdaExterior: { width: '31%' },
  celda: {
    paddingVertical: 14,
    backgroundColor: '#F7FAF9',
    borderRadius: Radios.md,
    borderWidth: 1.5,
    borderColor: Colores.borde
  },
  activa: { borderColor: Colores.acentoOscuro, ...Sombras.suave },
  contenidoCelda: { alignItems: 'center', gap: 4 },
  txt: { fontSize: 15, fontWeight: '800', color: Colores.textoSuave },
  txtActivo: { color: Colores.primario },
  contenedorVacio: {
    padding: 22,
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colores.peligroFondo,
    borderRadius: Radios.md,
    marginVertical: 12
  },
  textoVacio: { color: Colores.peligro, fontWeight: '700' }
});
