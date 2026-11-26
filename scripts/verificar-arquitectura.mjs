// Verifica la regla de oro "bajo acoplamiento, alta cohesión" sobre el código real.
// Recorre los imports de cada bloque (backend / frontend / ui / compartido) de la app móvil y del portal web
// y falla (exit 1) si alguno cruza un límite prohibido. Uso:  npm run verify:arch
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Paquetes que cada bloque NO puede importar (coincide por prefijo exacto o "prefijo/").
const DE_UI = ['react-native', 'react-native-', 'expo-linear-gradient', 'expo-camera', '@expo/vector-icons', 'react-dom'];
const DE_DATOS = ['firebase', '@firebase'];

const PROYECTOS = [
  {
    nombre: 'App móvil (src/)',
    dir: join(RAIZ, 'src'),
    reglas: {
      // bloque: { bloquesPermitidos (relativos), paquetesProhibidos }
      backend: { permite: ['backend', 'compartido'], prohibe: [...DE_UI, 'expo-location', 'react'] },
      frontend: { permite: ['frontend', 'compartido'], prohibe: [...DE_UI, ...DE_DATOS] },
      ui: { permite: ['ui', 'compartido'], prohibe: [...DE_DATOS, 'expo-location'] },
      compartido: { permite: ['compartido'], prohibe: [...DE_UI, ...DE_DATOS, 'react', 'expo-location'] }
    },
    // Raíz de composición: App.js (fuera de src/) puede importar los tres bloques.
    raices: [join(RAIZ, 'App.js')]
  },
  {
    nombre: 'Portal web (AppWEB-claude/src/)',
    dir: join(RAIZ, 'AppWEB-claude', 'src'),
    reglas: {
      backend: { permite: ['backend', 'compartido'], prohibe: ['react', 'react-dom'] },
      // El puerto `servicios.ts` está en la raíz de src/ y es el único acceso al backend para frontend y ui.
      frontend: { permite: ['frontend', 'compartido', '@servicios'], prohibe: [...DE_DATOS, 'react-dom'] },
      ui: { permite: ['ui', 'frontend', 'compartido', '@servicios'], prohibe: DE_DATOS },
      compartido: { permite: ['compartido'], prohibe: [...DE_DATOS, 'react', 'react-dom'] }
    },
    raices: []
  }
];

const EXTENSIONES = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const PATRON_IMPORT = /(?:import|export)\s+(?:[^'"`;]*?\s+from\s+)?['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)|import\(\s*['"]([^'"]+)['"]\s*\)/g;

const listarArchivos = (dir) =>
  readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) return nombre === 'node_modules' ? [] : listarArchivos(ruta);
    const ext = nombre.slice(nombre.lastIndexOf('.'));
    return EXTENSIONES.has(ext) ? [ruta] : [];
  });

const importsDe = (archivo) => {
  const texto = readFileSync(archivo, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const encontrados = [];
  for (const m of texto.matchAll(PATRON_IMPORT)) encontrados.push(m[1] ?? m[2] ?? m[3]);
  return encontrados;
};

const empiezaCon = (paquete, lista) => lista.some((p) => paquete === p || paquete.startsWith(p.endsWith('-') ? p : p + '/') || (p.endsWith('-') && paquete.startsWith(p)));

let totalArchivos = 0;
let totalImports = 0;
const violaciones = [];

for (const proyecto of PROYECTOS) {
  for (const archivo of listarArchivos(proyecto.dir)) {
    const rel = relative(proyecto.dir, archivo).split(sep);
    const bloque = rel.length > 1 ? rel[0] : null; // archivos sueltos en src/ son raíz de composición
    const regla = bloque && proyecto.reglas[bloque];
    if (!regla) continue; // raíz de composición (servicios.ts, main.tsx): sin restricción de bloque

    totalArchivos++;
    for (const origen of importsDe(archivo)) {
      totalImports++;
      const mostrar = `${relative(RAIZ, archivo)}  ->  '${origen}'`;
      if (origen.startsWith('.')) {
        // Los recursos estáticos (imágenes, fuentes) de /assets son neutros y pueden usarse desde cualquier bloque.
        if (relative(join(RAIZ, 'assets'), resolve(dirname(archivo), origen)).split(sep)[0] !== '..') continue;
        const destino = relative(proyecto.dir, resolve(dirname(archivo), origen)).split(sep);
        const bloqueDestino = destino[0] === '..' ? '(fuera de src)' : destino.length > 1 ? destino[0] : destino[0].replace(/\.[a-z]+$/, '');
        const permitido = regla.permite.includes(bloqueDestino) || (regla.permite.includes('@servicios') && bloqueDestino === 'servicios');
        if (!permitido) violaciones.push(`[${proyecto.nombre}] "${bloque}" no puede depender de "${bloqueDestino}": ${mostrar}`);
      } else if (empiezaCon(origen, regla.prohibe)) {
        violaciones.push(`[${proyecto.nombre}] "${bloque}" no puede usar el paquete "${origen}": ${mostrar}`);
      }
    }
  }
}

console.log(`Archivos analizados: ${totalArchivos} · imports revisados: ${totalImports}`);
if (violaciones.length > 0) {
  console.error(`\nSe encontraron ${violaciones.length} violaciones de arquitectura:\n`);
  for (const v of violaciones) console.error(' ✗ ' + v);
  process.exit(1);
}
console.log('✔ Arquitectura válida: backend, frontend y ui no se acoplan entre sí (solo vía raíz de composición).');
