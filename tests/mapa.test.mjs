// Pruebas de las reglas puras del mapa de ubicación (TC-105). No requieren dispositivo ni internet.
// Ejecución:  npm run test:logica
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const origen = readFileSync(new URL('../src/compartido/reglasMapa.js', import.meta.url), 'utf8');
const { calcularTeselas, coordenadaATesela, urlTesela } = await import(
  'data:text/javascript;base64,' + Buffer.from(origen).toString('base64')
);

describe('coordenadaATesela (TC-105: mapa sin clave de API)', () => {
  it('ubica (0, 0) en el centro de la grilla', () => {
    const { x, y } = coordenadaATesela(0, 0, 1);
    assert.equal(x, 1);
    assert.equal(y, 1);
  });

  it('coincide con la teselas conocida de Buenos Aires a zoom 10 (x=345, y=617)', () => {
    const { x, y } = coordenadaATesela(-34.6, -58.4, 10);
    assert.equal(Math.floor(x), 345);
    assert.equal(Math.floor(y), 617);
  });
});

describe('calcularTeselas', () => {
  const clinica = { latitud: -34.45679, longitud: -58.90425, ancho: 320, alto: 260 };

  it('cubre todo el visor sin dejar huecos', () => {
    const teselas = calcularTeselas(clinica);
    assert.ok(teselas.length >= 4);
    assert.ok(Math.min(...teselas.map((t) => t.izquierda)) <= 0);
    assert.ok(Math.min(...teselas.map((t) => t.arriba)) <= 0);
    assert.ok(Math.max(...teselas.map((t) => t.izquierda + t.tamano)) >= clinica.ancho);
    assert.ok(Math.max(...teselas.map((t) => t.arriba + t.tamano)) >= clinica.alto);
  });

  it('la coordenada cae dentro de la tesela que contiene el centro del visor', () => {
    const teselas = calcularTeselas(clinica);
    const centro = teselas.find(
      (t) => t.izquierda <= 160 && 160 < t.izquierda + t.tamano && t.arriba <= 130 && 130 < t.arriba + t.tamano
    );
    assert.ok(centro);
  });

  it('arma URLs de OpenStreetMap y no repite teselas', () => {
    const teselas = calcularTeselas(clinica);
    assert.ok(teselas.every((t) => t.url.startsWith('https://tile.openstreetmap.org/15/')));
    assert.equal(new Set(teselas.map((t) => t.clave)).size, teselas.length);
    assert.equal(urlTesela(15, 1, 2), 'https://tile.openstreetmap.org/15/1/2.png');
  });

  it('devuelve lista vacía ante datos inválidos (visor sin medir o coordenada no numérica)', () => {
    assert.deepEqual(calcularTeselas({ ...clinica, ancho: 0 }), []);
    assert.deepEqual(calcularTeselas({ ...clinica, latitud: NaN }), []);
  });

  it('envuelve la longitud al cruzar el antimeridiano', () => {
    const teselas = calcularTeselas({ latitud: 0, longitud: 179.9999, ancho: 600, alto: 260, zoom: 3 });
    // URL: https://tile.openstreetmap.org/{zoom}/{x}/{y}.png  ->  x es el quinto segmento (índice 4)
    const xs = teselas.map((t) => Number(t.url.split('/')[4]));
    assert.ok(xs.every((x) => x >= 0 && x < 8));
    assert.ok(teselas.some((t) => t.clave.includes('/8/')), 'debe haber una tesela más allá del borde (x=8) que se envuelve a 0');
  });
});
