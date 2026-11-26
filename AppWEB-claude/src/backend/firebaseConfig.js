import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Configuración del proyecto Firebase `App-Dev-Pilares` para el portal web.
 * Los valores se leen de variables de entorno de Vite (archivo `.env.local`, ignorado por Git).
 * Copie `.env.example` a `.env.local` y complete los valores con los de la app móvil
 * (`src/backend/firebase/FirebaseConfig.js`) o con los de Firebase Console > Configuración del proyecto.
 */
const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const faltantes = Object.entries(firebaseConfig)
  .filter(([, valor]) => !valor)
  .map(([clave]) => clave);

if (faltantes.length > 0) {
  throw new Error(
    `Configuración de Firebase incompleta (${faltantes.join(', ')}). ` +
      'Copie AppWEB-claude/.env.example a AppWEB-claude/.env.local y complete los valores.'
  );
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
