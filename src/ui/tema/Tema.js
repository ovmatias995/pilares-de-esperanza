// Sistema de diseño de la app móvil. La paleta comparte identidad con el portal web
// (verde profundo + lima) para que ambas aplicaciones se vean como una sola marca.

export const Colores = {
  fondo: '#F2F6F4',
  superficie: '#FFFFFF',
  texto: '#10241F',
  textoSuave: '#5E7771',
  textoTenue: '#8FA39D',
  borde: '#DDE8E4',

  primario: '#143D36',
  primarioOscuro: '#0B2622',
  primarioMedio: '#1E6B5C',
  primarioClaro: '#2F8F78',
  acento: '#D5F36A',
  acentoOscuro: '#A9D83A',
  menta: '#E3F3EE',

  exito: '#16A34A',
  exitoFondo: '#E3F6EA',
  alerta: '#B7791F',
  alertaFondo: '#FFF4DC',
  peligro: '#D93A3F',
  peligroFondo: '#FDECEC',
  info: '#2E6F95',
  infoFondo: '#E3F0F7',
  lila: '#6B5BA8',
  lilaFondo: '#ECE8F8'
};

export const Gradientes = {
  principal: ['#0B2622', '#14574B', '#1E6B5C'],
  acento: ['#E4F98F', '#C4EA4A'],
  peligro: ['#EF5A5F', '#C62A30'],
  suave: ['#FFFFFF', '#F2F6F4']
};

export const Radios = { sm: 10, md: 16, lg: 22, xl: 30, pill: 999 };

export const Sombras = {
  suave: {
    shadowColor: '#0B2622',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  fuerte: {
    shadowColor: '#0B2622',
    shadowOpacity: 0.18,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10
  }
};

export const Tipografia = {
  titulo: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8, color: Colores.texto },
  subtitulo: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4, color: Colores.texto },
  cuerpo: { fontSize: 15, lineHeight: 22, color: Colores.textoSuave },
  etiqueta: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: Colores.textoSuave, textTransform: 'uppercase' }
};

export const iniciales = (nombre = '') => {
  const letras = nombre.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase());
  return letras.join('') || '?';
};
