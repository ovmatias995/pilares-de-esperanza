import { StyleSheet } from 'react-native';
import { Colores } from './Tema';

// Estilos compartidos por la composición raíz (App.js). El resto del diseño vive en `Tema.js`
// (tokens) y en `components/ComponentesUI.js` (componentes; el indicador "Procesando" está allí).
export const EstilosGlobales = StyleSheet.create({
  contenedorRaiz: { flex: 1, backgroundColor: Colores.fondo },
  scrollContenedor: { flexGrow: 1 }
});
