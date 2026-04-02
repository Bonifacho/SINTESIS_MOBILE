// Ruta: constants/Colors.ts

export const Colors = {
  // --- Identidad y Enfoque Pedagógico ---
  primary: '#4F46E5',    // Indigo (Botón principal, transmite rigor académico y concentración)
  secondary: '#F59E0B',  // Ámbar/Naranja (Llamados a la acción pedagógica, como "Iniciar Módulo", resalta sin distraer)
  
  // --- Ergonomía Cognitiva y Legibilidad ---
  dark: '#0F172A',       // Azul marino oscuro (Texto principal, alta legibilidad para lectura prolongada de teoría)
  light: '#F1F5F9',      // Gris azulado suave (Separadores de secciones de contenido y fondos inactivos)
  gray: '#64748B',       // Gris pizarra (Textos de apoyo, metadatos académicos como fechas o autores)
  
  // --- Retroalimentación Semántica (Evaluaciones y Sistema) ---
  success: '#10B981',    // Verde esmeralda (Retroalimentación positiva en pruebas, creación de registros)
  warning: '#FBBF24',    // Amarillo cálido (Alertas preventivas, confirmaciones antes de modificar datos)
  error: '#EF4444',      // Rojo suave (Retroalimentación correctiva en evaluaciones, prevención de errores)
  info: '#0EA5E9',       // Azul cielo (Información complementaria, tooltips pedagógicos y guías de uso)
  
  // --- Estructura de la Interfaz (Capas de Lectura) ---
  background: '#F8FAFC', // Gris extra claro (Fondo base, diseñado para evitar la fatiga visual del blanco puro)
  surface: '#FFFFFF',    // Blanco puro (Contraste exclusivo para tarjetas de contenido y áreas de evaluación)
  window: '#E2E8F0'      // Tono de contraste suave (Para ventanas modales de confirmación o lectura superpuesta)
} as const;

export type ColorTheme = typeof Colors;