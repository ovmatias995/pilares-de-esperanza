import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { CONTACTO_CLINICA } from '../../compartido/DatosClinica';
import { Colores, Radios } from '../tema/Tema';
import { Icono } from './ComponentesUI';

// Indicador de pasos del registro, pensado para ir sobre la cabecera oscura.
export const BarraProgreso = ({ paso, total }) => {
  const porcentaje = Math.round((paso / total) * 100);
  return (
    <View style={estilos.contenedor} accessible accessibilityLabel={`Paso ${paso} de ${total}, ${porcentaje}% completado`}>
      <View style={estilos.fila}>
        <Text style={estilos.texto}>Paso {paso} de {total}</Text>
        <Text style={estilos.porcentaje}>{porcentaje}%</Text>
      </View>
      <View style={estilos.segmentos}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={[estilos.segmento, i < paso && estilos.segmentoActivo]} />
        ))}
      </View>
    </View>
  );
};

export const FooterContacto = () => (
  <View style={estilos.footer}>
    <Text style={estilos.footerTitulo}>¿No es lo que estabas buscando?</Text>
    <Text style={estilos.footerTexto}>Comunicate con nosotros, podemos ayudarte.</Text>

    <TouchableOpacity
      style={estilos.botonWhatsapp}
      onPress={() => Linking.openURL(CONTACTO_CLINICA.whatsappUrl)}
      accessibilityRole="button"
      accessibilityLabel={CONTACTO_CLINICA.whatsappDisplay}
    >
      <Icono nombre="logo-whatsapp" tamano={22} color="#FFFFFF" style={{ marginRight: 10 }} />
      <Text style={estilos.textoWhatsapp}>{CONTACTO_CLINICA.whatsappDisplay}</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={estilos.botonTelefono}
      onPress={() => Linking.openURL(CONTACTO_CLINICA.telefonoFijoUrl)}
      accessibilityRole="button"
      accessibilityLabel={CONTACTO_CLINICA.telefonoFijoDisplay}
    >
      <Icono nombre="call-outline" tamano={18} color={Colores.primarioMedio} style={{ marginRight: 8 }} />
      <Text style={estilos.textoTelefono}>{CONTACTO_CLINICA.telefonoFijoDisplay}</Text>
    </TouchableOpacity>
  </View>
);

const estilos = StyleSheet.create({
  contenedor: { marginTop: 16 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  texto: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  porcentaje: { color: Colores.acento, fontSize: 12, fontWeight: '800' },
  segmentos: { flexDirection: 'row', gap: 6 },
  segmento: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.22)' },
  segmentoActivo: { backgroundColor: Colores.acento },

  footer: { marginTop: 26, padding: 18, backgroundColor: Colores.menta, borderRadius: Radios.lg },
  footerTitulo: { textAlign: 'center', color: Colores.primario, fontWeight: '800', fontSize: 15 },
  footerTexto: { textAlign: 'center', color: Colores.textoSuave, fontSize: 13, marginTop: 3, marginBottom: 14 },
  botonWhatsapp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1FAF5A',
    paddingVertical: 14,
    borderRadius: Radios.md
  },
  textoWhatsapp: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  botonTelefono: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  textoTelefono: { color: Colores.primarioMedio, fontSize: 13, fontWeight: '700' }
});
