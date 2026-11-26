import AsyncStorage from '@react-native-async-storage/async-storage';

// Servicio de dispositivo (bloque frontend): guarda en el teléfono los datos que el paciente ya escribió en el
// registro para poder retomarlo si Android cierra la app (por ejemplo, al salir a abrir el correo de verificación).
//
// Por privacidad NUNCA se guarda la contraseña, y el borrador se elimina al terminar el registro y al cerrar sesión.
const CLAVE = 'pilares.borradorRegistro.v1';

export const BorradorRegistro = {
  async guardar(formulario) {
    try {
      const { password, ...sinPassword } = formulario;
      await AsyncStorage.setItem(CLAVE, JSON.stringify(sinPassword));
    } catch (error) {
      console.log('Aviso al guardar el borrador del registro:', error.message);
    }
  },

  async leer() {
    try {
      const texto = await AsyncStorage.getItem(CLAVE);
      return texto ? JSON.parse(texto) : null;
    } catch (error) {
      return null;
    }
  },

  async borrar() {
    try {
      await AsyncStorage.removeItem(CLAVE);
    } catch (error) {
      // Sin efecto: el borrador se sobrescribe en el próximo registro.
    }
  }
};
