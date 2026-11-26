// Publica el portal administrativo (y la página de descarga de la app) en Firebase Hosting.
//   Uso: npm run desplegar:web
// Pasos: 1) compila el portal  2) coloca en la página de descarga el enlace del APK  3) sube todo a Hosting.
// Requisito previo, una sola vez:  npx firebase-tools login
//
// El APK NO se sube a Hosting: el plan gratuito (Spark) rechaza los archivos ejecutables (HTTP 400). El APK se aloja en otro
// sitio (p. ej. una versión de GitHub) y su dirección se guarda en distribucion/enlace-apk.txt (una sola línea con la URL).
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ejecutar = (comando, args, cwd = raiz) => {
  const r = spawnSync(comando, args, { cwd, stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    console.error(`✖ Falló: ${comando} ${args.join(' ')}`);
    process.exit(r.status ?? 1);
  }
};

console.log('1/3 Compilando el portal...');
ejecutar('npm', ['run', 'build'], resolve(raiz, 'AppWEB-claude'));

const archivoEnlace = resolve(raiz, 'distribucion', 'enlace-apk.txt');
const enlace = (process.env.APK_URL || (existsSync(archivoEnlace) ? readFileSync(archivoEnlace, 'utf8') : '')).trim();
const paginaDescarga = resolve(raiz, 'AppWEB-claude', 'dist', 'descargar', 'index.html');
if (/^https:\/\/\S+$/.test(enlace) && existsSync(paginaDescarga)) {
  writeFileSync(paginaDescarga, readFileSync(paginaDescarga, 'utf8').replace('__ENLACE_APK__', enlace));
  console.log(`2/3 Enlace del APK colocado en la página de descarga: ${enlace}`);
} else {
  if (existsSync(paginaDescarga)) {
    writeFileSync(paginaDescarga, readFileSync(paginaDescarga, 'utf8').replace('__ENLACE_APK__', '#'));
  }
  console.log('2/3 Sin enlace del APK (falta distribucion/enlace-apk.txt con una URL https): el botón de descarga quedará inactivo.');
}

console.log('3/3 Subiendo a Firebase Hosting...');
ejecutar('npx', ['firebase-tools', 'deploy', '--only', 'hosting']);
