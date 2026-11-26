import * as Location from 'expo-location';

export const GpsService = {
  // Coordenadas fijas del centro "Pilares de Esperanza" usadas para validar la zona de cobertura
  COORDENADAS_CLINICA: { latitud: -34.45679, longitud: -58.90425 },
  RADIO_MAXIMO_KM: 100,

  calcularDistanciaHaversine: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Retorna distancia en KM
  },

  // Solicita permiso, lee la posición y valida que esté dentro del área de cobertura.
  // Devuelve { exito: true, latitud, longitud, distanciaKm } o { exito: false, mensaje }.
  capturarYValidarCoordenadas: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return { exito: false, mensaje: 'Permiso de ubicación denegado. Habilítelo para validar su domicilio.' };
      }

      // Precisión balanceada para evitar fallos en interiores
      // Con tope de 25 s: si el GPS no responde (ubicación apagada o sin señal) se muestra el error en vez de girar sin fin.
      const location = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise((_, rechazar) => setTimeout(() => rechazar(new Error('Tiempo de espera del GPS agotado')), 25000))
      ]);
      const latUsuario = location.coords.latitude;
      const lonUsuario = location.coords.longitude;

      const distanciaAlCentro = GpsService.calcularDistanciaHaversine(
        latUsuario, lonUsuario,
        GpsService.COORDENADAS_CLINICA.latitud, GpsService.COORDENADAS_CLINICA.longitud
      );

      if (distanciaAlCentro > GpsService.RADIO_MAXIMO_KM) {
        return {
          exito: false,
          mensaje: `Su ubicación está a ${Math.round(distanciaAlCentro)} km del centro. Fuera del área de cobertura (máximo ${GpsService.RADIO_MAXIMO_KM} km).`
        };
      }

      return { exito: true, latitud: latUsuario, longitud: lonUsuario, distanciaKm: distanciaAlCentro };
    } catch (error) {
      console.warn('Falla en módulo GPS:', error);
      return { exito: false, mensaje: 'No se pudo leer el GPS. Verifique que la ubicación esté activada e intente nuevamente.' };
    }
  }
};
