import { Alert } from 'react-native';

// BLOQUE UX/UI — diálogos nativos. El frontend los recibe por inyección (App.js) y no conoce `Alert`.
export const Dialogos = {
  aviso: (titulo, mensaje) => Alert.alert(titulo, mensaje),

  confirmar: ({ titulo, mensaje, textoCancelar, textoConfirmar, onConfirmar }) =>
    Alert.alert(titulo, mensaje, [
      { text: textoCancelar, style: 'cancel' },
      { text: textoConfirmar, onPress: onConfirmar }
    ]),

  confirmarDestructivo: ({ titulo, mensaje, textoCancelar, textoConfirmar, onConfirmar }) =>
    Alert.alert(titulo, mensaje, [
      { text: textoCancelar, style: 'cancel' },
      { text: textoConfirmar, style: 'destructive', onPress: onConfirmar }
    ])
};
