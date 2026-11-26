import React, { useEffect, useRef, useState } from 'react';
import { Animated, ActivityIndicator, Easing, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarraProgreso } from '../componentes/ComponentesClinica';
import { Aparecer, Boton, BurbujaIcono, CampoTexto, Icono, LayoutAuth } from '../componentes/ComponentesUI';
import { MapaReal } from '../dispositivo/MapaReal';
import { Colores, Gradientes, Radios, Sombras } from '../tema/Tema';

const capitalizarPalabras = (texto) => {
  return texto.replace(/(^|\s)([a-záéíóúñ])/g, (match, p1, p2) => p1 + p2.toUpperCase());
};

const formatearFecha = (texto) => {
  const limpio = texto.replace(/[^\d]/g, '');
  let formateado = limpio;
  if (limpio.length > 2) formateado = limpio.slice(0, 2) + '/' + limpio.slice(2);
  if (limpio.length > 4) formateado = formateado.slice(0, 5) + '/' + limpio.slice(4, 8);
  return formateado;
};

// Marca (logo sobre tarjeta blanca) reutilizada en Splash y Bienvenida.
const LogoMarca = ({ tamano = 132 }) => (
  <View style={[estilos.logoTarjeta, { width: tamano, height: tamano, borderRadius: tamano * 0.28 }]}>
    <Image source={require('../../../assets/logo.png')} style={{ width: '88%', height: '88%' }} resizeMode="contain" />
  </View>
);

const Decoracion = () => (
  <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <View style={[estilos.circulo, { width: 300, height: 300, right: -110, top: -90, backgroundColor: 'rgba(213,243,106,0.10)' }]} />
    <View style={[estilos.circulo, { width: 180, height: 180, left: -70, bottom: 40, backgroundColor: 'rgba(255,255,255,0.06)' }]} />
    <View style={[estilos.circulo, { width: 90, height: 90, right: 30, bottom: 90, backgroundColor: 'rgba(213,243,106,0.14)' }]} />
  </View>
);

export const Splash = () => {
  const entrada = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(entrada, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 10 }).start();
  }, [entrada]);

  return (
    <LinearGradient colors={Gradientes.principal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={estilos.pantallaCompleta}>
      <Decoracion />
      <Animated.View style={{ alignItems: 'center', opacity: entrada, transform: [{ scale: entrada.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] }}>
        <LogoMarca tamano={150} />
        <Text style={estilos.splashTitulo}>Pilares de Esperanza</Text>
        <Text style={estilos.splashSubtitulo}>Salud domiciliaria con calidez humana</Text>
        <ActivityIndicator size="small" color={Colores.acento} style={{ marginTop: 34 }} />
      </Animated.View>
    </LinearGradient>
  );
};

const Caracteristica = ({ icono, texto }) => (
  <View style={estilos.caracteristica}>
    <BurbujaIcono icono={icono} tamano={40} />
    <Text style={estilos.caracteristicaTexto}>{texto}</Text>
  </View>
);

export const Bienvenida = ({ onLogin, onRegistro }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: Colores.fondo }}>
      <LinearGradient
        colors={Gradientes.principal}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[estilos.heroBienvenida, { paddingTop: insets.top + 36 }]}
      >
        <Decoracion />
        <Aparecer style={{ alignItems: 'center' }}>
          <LogoMarca />
          <Text style={estilos.heroTitulo}>Pilares de Esperanza</Text>
          <Text style={estilos.heroTexto}>
            Acompañamos su camino hacia una vida activa, libre de dolor y con el cuidado que usted se merece.
          </Text>
        </Aparecer>
      </LinearGradient>

      <Aparecer retraso={150} style={estilos.hojaBienvenida}>
        <View style={estilos.caracteristicas}>
          <Caracteristica icono="home-outline" texto="Atención en su domicilio" />
          <Caracteristica icono="calendar-outline" texto="Turnos en minutos" />
          <Caracteristica icono="shield-checkmark-outline" texto="Cuenta verificada" />
        </View>

        <Text style={estilos.indicacion}>Inicie sesión con sus credenciales o regístrese si es su primera vez</Text>
        <Boton titulo="Iniciar Sesión" icono="log-in-outline" onPress={onLogin} />
        <Boton titulo="Registrarse" icono="person-add-outline" variante="secundario" onPress={onRegistro} style={{ marginTop: 12 }} />
      </Aparecer>
    </View>
  );
};

export const Login = ({ onIngresar, onRecuperar, onRegistro, onVolver }) => {
  const [credenciales, setCredenciales] = useState({ correo: '', password: '' });
  return (
    <LayoutAuth titulo="Iniciar Sesión" subtitulo="Ingrese para gestionar sus turnos" onVolver={onVolver}>
      <CampoTexto
        etiqueta="Correo electrónico"
        icono="mail-outline"
        placeholder="maria@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={credenciales.correo}
        onChangeText={(t) => setCredenciales({ ...credenciales, correo: t })}
      />
      <CampoTexto
        etiqueta="Contraseña"
        icono="lock-closed-outline"
        placeholder="Su contraseña"
        secureTextEntry={true}
        autoCapitalize="none"
        value={credenciales.password}
        onChangeText={(t) => setCredenciales({ ...credenciales, password: t })}
      />
      <Boton titulo="Iniciar Sesión" icono="arrow-forward-circle-outline" onPress={() => onIngresar(credenciales)} />
      <TouchableOpacity onPress={() => onRecuperar(credenciales.correo)} style={estilos.enlace} accessibilityRole="button">
        <Text style={estilos.enlaceFuerte}>¿Olvidó su contraseña?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onRegistro} style={estilos.enlace} accessibilityRole="button">
        <Text style={estilos.enlaceSuave}>¿No tiene cuenta? <Text style={estilos.enlaceFuerte}>Regístrese aquí</Text></Text>
      </TouchableOpacity>
    </LayoutAuth>
  );
};

export const RegistroDatos = ({ estados, setEstados, onSiguiente, onVolver }) => (
  <LayoutAuth
    titulo="Cree su cuenta"
    subtitulo="Datos personales"
    onVolver={onVolver}
    encabezado={<BarraProgreso paso={1} total={4} />}
  >
    <CampoTexto
      etiqueta="Nombre y apellido completo"
      icono="person-outline"
      placeholder="Ej: María Elena Gómez"
      autoCapitalize="words"
      value={estados.nombre}
      onChangeText={(t) => setEstados({ ...estados, nombre: capitalizarPalabras(t) })}
    />
    <CampoTexto
      etiqueta="Correo electrónico"
      icono="mail-outline"
      placeholder="maria.gomez@gmail.com"
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      value={estados.correo}
      onChangeText={(t) => setEstados({ ...estados, correo: t })}
    />
    <CampoTexto
      etiqueta="Contraseña (mínimo 6 caracteres)"
      icono="lock-closed-outline"
      placeholder="Cree una contraseña segura"
      secureTextEntry={true}
      autoCapitalize="none"
      value={estados.password}
      onChangeText={(t) => setEstados({ ...estados, password: t })}
    />
    <CampoTexto
      etiqueta="Número de DNI"
      icono="card-outline"
      placeholder="Ej: 12345678"
      keyboardType="numeric"
      value={estados.dni}
      onChangeText={(t) => setEstados({ ...estados, dni: t })}
    />
    <CampoTexto
      etiqueta="Teléfono"
      icono="call-outline"
      prefijo="+54 9"
      placeholder="Sin 0 ni 15 (Ej: 11 5555 1234)"
      keyboardType="numeric"
      value={estados.telefono}
      onChangeText={(t) => setEstados({ ...estados, telefono: t })}
    />
    <CampoTexto
      etiqueta="Fecha de nacimiento"
      icono="calendar-outline"
      placeholder="DD/MM/AAAA"
      keyboardType="numeric"
      maxLength={10}
      value={estados.fecha}
      onChangeText={(t) => setEstados({ ...estados, fecha: formatearFecha(t) })}
    />
    <CampoTexto
      etiqueta="Obra social o prepaga (opcional)"
      icono="medkit-outline"
      placeholder="Ejemplo: PAMI"
      autoCapitalize="words"
      value={estados.obraSocial}
      onChangeText={(t) => setEstados({ ...estados, obraSocial: capitalizarPalabras(t) })}
    />
    <Boton titulo="Siguiente" icono="arrow-forward-outline" onPress={onSiguiente} />
  </LayoutAuth>
);

const PasoVerificacion = ({ numero, texto }) => (
  <View style={estilos.pasoFila}>
    <View style={estilos.pasoNumero}><Text style={estilos.pasoNumeroTexto}>{numero}</Text></View>
    <Text style={estilos.pasoTexto}>{texto}</Text>
  </View>
);

export const VerificacionEmail = ({ correo, onVerificar, onReenviar, onVolver }) => (
  <LayoutAuth
    titulo="Verifique su correo"
    subtitulo="Confirmación de correo electrónico"
    onVolver={onVolver}
    encabezado={<BarraProgreso paso={2} total={4} />}
  >
    <View style={{ alignItems: 'center', marginBottom: 18 }}>
      <BurbujaIcono icono="mail-open-outline" tamano={84} color={Colores.primarioMedio} fondo={Colores.menta} />
      <Text style={estilos.verificacionTexto}>Hemos enviado un enlace de verificación a:</Text>
      <View style={estilos.correoChip}>
        <Text style={estilos.correoChipTexto} numberOfLines={1}>{correo}</Text>
      </View>
    </View>

    <PasoVerificacion numero="1" texto="Abra su bandeja de entrada (revise también Spam)." />
    <PasoVerificacion numero="2" texto="Haga clic en el enlace recibido." />
    <PasoVerificacion numero="3" texto="Vuelva aquí y presione el botón inferior." />

    <Boton titulo="Ya verifiqué mi correo" icono="checkmark-circle-outline" onPress={onVerificar} style={{ marginTop: 18 }} />
    <TouchableOpacity onPress={onReenviar} style={estilos.enlace} accessibilityRole="button">
      <Text style={estilos.enlaceFuerte}>Reenviar enlace de verificación</Text>
    </TouchableOpacity>
  </LayoutAuth>
);

export const UbicacionMapa = ({ ubicacion, onReintentar, onConfirmar, onVolver }) => (
  <LayoutAuth
    titulo="Su ubicación"
    subtitulo="Validación GPS y zona de cobertura"
    onVolver={onVolver}
    encabezado={<BarraProgreso paso={4} total={4} />}
  >
    <MapaReal ubicacion={ubicacion} onReintentar={onReintentar} />
    <Boton titulo="Confirmar Ubicación" icono="location-outline" onPress={onConfirmar} />
  </LayoutAuth>
);

const estilos = StyleSheet.create({
  pantallaCompleta: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  circulo: { position: 'absolute', borderRadius: 999 },
  logoTarjeta: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Sombras.fuerte
  },
  splashTitulo: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', letterSpacing: -0.8, marginTop: 28, textAlign: 'center' },
  splashSubtitulo: { color: Colores.acento, fontSize: 15, fontWeight: '600', marginTop: 8, textAlign: 'center' },

  heroBienvenida: {
    paddingBottom: 70,
    paddingHorizontal: 26,
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
    overflow: 'hidden'
  },
  heroTitulo: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', letterSpacing: -0.8, marginTop: 24, textAlign: 'center' },
  heroTexto: { color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 22, marginTop: 10, textAlign: 'center' },
  hojaBienvenida: {
    marginTop: -40,
    marginHorizontal: 16,
    padding: 22,
    backgroundColor: Colores.superficie,
    borderRadius: Radios.xl,
    ...Sombras.fuerte
  },
  caracteristicas: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  caracteristica: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  caracteristicaTexto: { fontSize: 11, fontWeight: '700', color: Colores.textoSuave, textAlign: 'center', marginTop: 8 },
  indicacion: { textAlign: 'center', color: Colores.textoSuave, fontSize: 13, marginBottom: 16 },

  enlace: { alignItems: 'center', marginTop: 18 },
  enlaceFuerte: { color: Colores.primarioMedio, fontWeight: '800', fontSize: 14 },
  enlaceSuave: { color: Colores.textoSuave, fontSize: 14 },

  verificacionTexto: { color: Colores.textoSuave, fontSize: 14, marginTop: 14, textAlign: 'center' },
  correoChip: { marginTop: 10, backgroundColor: Colores.menta, paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radios.pill, maxWidth: '100%' },
  correoChipTexto: { color: Colores.primario, fontWeight: '800', fontSize: 15 },
  pasoFila: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  pasoNumero: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colores.acento, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  pasoNumeroTexto: { color: Colores.primario, fontWeight: '800' },
  pasoTexto: { flex: 1, color: Colores.texto, fontSize: 14 }
});
