// Genera el código QR de descarga de la app (PNG e SVG) para las diapositivas y la cartelería.
//   Uso: npm run qr                      -> apunta a la página de descarga del portal (URL por defecto)
//        npm run qr -- https://otra.url  -> apunta a otra dirección
// Salida: docs/3-comercial/qr/qr-descarga.png y qr-descarga.svg
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const URL_POR_DEFECTO = 'https://app-dev-pilares.web.app/descargar/';
const destino = process.argv[2] || URL_POR_DEFECTO;

if (!/^https:\/\/[^\s]+$/.test(destino)) {
  console.error(`✖ La dirección debe empezar con https:// y no tener espacios. Recibido: "${destino}"`);
  process.exit(1);
}

const carpeta = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'docs', '3-comercial', 'qr');
mkdirSync(carpeta, { recursive: true });

// Corrección de errores alta (H): el código sigue leyéndose aunque se proyecte con poca nitidez o se imprima chico.
const opciones = { errorCorrectionLevel: 'H', margin: 4, color: { dark: '#143D36', light: '#FFFFFF' } };
await QRCode.toFile(resolve(carpeta, 'qr-descarga.png'), destino, { ...opciones, width: 1200 });
await QRCode.toFile(resolve(carpeta, 'qr-descarga.svg'), destino, { ...opciones, type: 'svg' });

console.log(`✔ QR generado para ${destino}\n  ${carpeta}\\qr-descarga.png\n  ${carpeta}\\qr-descarga.svg`);
