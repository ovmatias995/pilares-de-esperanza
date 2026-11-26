// Contenido informativo para solicitar el Certificado Único de Discapacidad (CUD).
// Datos puros (sin UI ni base de datos): la pantalla `SolicitarCUD` solo los dibuja.

export const TITULO_CUD = 'Certificado Único de Discapacidad';

export const INTRODUCCION_CUD =
  'Para obtener el Certificado Único de Discapacidad usted debe realizar los siguientes pasos:';

export const PASOS_CUD = [
  'Consultar los requisitos específicos y el lugar correspondiente según su edad, tipo de problema de salud y domicilio.',
  'Reunir la documentación médica y personal solicitada.',
  'Solicitar turno y presentarse ante la Junta Evaluadora Interdisciplinaria asignada.',
  'Retirar el certificado o acceder a su versión digital en la app Mi Argentina una vez emitido.'
];

export const SECCIONES_CUD = [
  {
    clave: 'requisitos',
    titulo: 'Requisitos generales',
    icono: 'card-outline',
    items: [
      { etiqueta: 'DNI', texto: 'Original y copia del solicitante, con domicilio actualizado en su distrito de residencia.' },
      { etiqueta: 'Menores de edad o curatela', texto: 'Documentación que acredite vínculo, patria potestad, tutela o curatela, según corresponda.' },
      { etiqueta: 'Cobertura médica (si posee)', texto: 'Credencial o constancia de obra social o medicina prepaga.' },
      { etiqueta: 'Renovación o actualización (si aplica)', texto: 'El CUD anterior (original o copia).' }
    ]
  },
  {
    clave: 'medica',
    titulo: 'Documentación médica',
    icono: 'medkit-outline',
    items: [
      { etiqueta: 'Informes y certificados médicos', texto: 'Emitidos por profesionales tratantes o especialistas que describan el diagnóstico, evolución y secuelas funcionales.' },
      { etiqueta: 'Planillas o formularios específicos', texto: 'Completados según el tipo de condición (intelectual/mental, visual, motor, auditivo, respiratorio, cardiovascular, renal/urológico o digestivo/hepático).' },
      { etiqueta: 'Estudios complementarios', texto: 'Resultados de estudios recientes que respalden el diagnóstico (como análisis, radiografías, tomografías u otros exámenes según la patología).' }
    ]
  }
];
