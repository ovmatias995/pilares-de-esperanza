// Reglas PURAS del mapa de ubicación (sin React ni dispositivo): convierten una coordenada en las "teselas"
// (imágenes de 256 px) de OpenStreetMap que hay que dibujar y dónde colocarlas. No requiere clave de API.
//
// Se usa en lugar de un mapa de Google porque éste exige una clave de API y, sin ella, la app compilada se cierra
// al mostrar el mapa (error "API key not found" en el registro del teléfono).

export const ZOOM_MAPA = 15;
export const TAMANO_TESELA = 256;

// Posición (fraccionaria) de una coordenada en la grilla de teselas de un nivel de zoom (proyección Web Mercator).
export const coordenadaATesela = (latitud, longitud, zoom = ZOOM_MAPA) => {
  const n = 2 ** zoom;
  const latitudRad = (latitud * Math.PI) / 180;
  return {
    x: ((longitud + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(latitudRad) + 1 / Math.cos(latitudRad)) / Math.PI) / 2) * n
  };
};

export const urlTesela = (zoom, x, y) => `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;

// Teselas necesarias para cubrir un visor de `ancho` x `alto` píxeles con la coordenada en el centro.
// Devuelve [{ clave, url, izquierda, arriba, tamano }] con la posición de cada una dentro del visor.
export const calcularTeselas = ({ latitud, longitud, ancho, alto, zoom = ZOOM_MAPA, tamano = TAMANO_TESELA }) => {
  if (![latitud, longitud, ancho, alto].every(Number.isFinite) || ancho <= 0 || alto <= 0) return [];
  const n = 2 ** zoom;
  const centro = coordenadaATesela(latitud, longitud, zoom);
  const minX = Math.floor(centro.x - ancho / 2 / tamano);
  const maxX = Math.floor(centro.x + ancho / 2 / tamano);
  const minY = Math.floor(centro.y - alto / 2 / tamano);
  const maxY = Math.floor(centro.y + alto / 2 / tamano);

  const teselas = [];
  for (let y = minY; y <= maxY; y++) {
    if (y < 0 || y >= n) continue; // fuera del mapa (más allá de los polos)
    for (let x = minX; x <= maxX; x++) {
      const xEnvuelta = ((x % n) + n) % n; // el mapa da la vuelta al mundo en horizontal
      teselas.push({
        clave: `${zoom}/${x}/${y}`,
        url: urlTesela(zoom, xEnvuelta, y),
        izquierda: Math.round(ancho / 2 + (x - centro.x) * tamano),
        arriba: Math.round(alto / 2 + (y - centro.y) * tamano),
        tamano
      });
    }
  }
  return teselas;
};
