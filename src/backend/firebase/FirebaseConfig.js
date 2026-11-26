import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// Configuración leída de variables EXPO_PUBLIC_* (archivo `.env`, ignorado por Git).
// Copie `.env.example` a `.env` y complete los valores del proyecto Firebase "App-Dev-Pilares".
// Expo solo reemplaza referencias estáticas `process.env.EXPO_PUBLIC_*`: no usar acceso dinámico.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const faltantes = Object.entries(firebaseConfig)
  .filter(([, valor]) => !valor)
  .map(([clave]) => clave);

if (faltantes.length > 0) {
  throw new Error(
    `Configuración de Firebase incompleta (${faltantes.join(', ')}). Copie .env.example a .env y complete los valores.`
  );
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// La sesión se guarda en el almacenamiento del dispositivo (AsyncStorage): al cerrar la app o recibir la
// pantalla un bloqueo, el paciente sigue identificado y no debe volver a ingresar su contraseña.
// Sin esta persistencia Firebase guarda la sesión solo en memoria y se pierde cada vez que Android cierra la app.
const crearAuth = () => {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (error) {
    // Ya estaba inicializado (recarga rápida en desarrollo): se reutiliza la instancia existente.
    return getAuth(app);
  }
};

export const auth = crearAuth();
// Los correos de Firebase Auth (verificación y recuperación de contraseña) se envían en español.
auth.languageCode = 'es';
export const db = getFirestore(app);
