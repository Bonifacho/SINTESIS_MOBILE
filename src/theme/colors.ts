// src/theme/colors.ts
// Paleta dinámica con soporte para tema claro y oscuro.
// Importar `getColors(isDark)` en componentes que reaccionen al tema.
// Importar `Colors` (alias del tema claro) en archivos que aún no implementan el tema dinámico.

// ── Tema Claro ────────────────────────────────────────────────────────────────
const LightColors = {
  primary:    '#4F46E5',   // Indigo — botones principales, rigor académico
  secondary:  '#F59E0B',   // Ámbar — llamados a la acción pedagógica
  dark:       '#0F172A',   // Azul marino oscuro — texto principal
  light:      '#F1F5F9',   // Gris azulado — separadores de sección
  gray:       '#64748B',   // Gris pizarra — metadatos y textos secundarios
  success:    '#10B981',   // Verde esmeralda — retroalimentación positiva
  warning:    '#FBBF24',   // Amarillo — alertas preventivas
  error:      '#EF4444',   // Rojo suave — errores y retroalimentación correctiva
  info:       '#0EA5E9',   // Azul cielo — información y módulo practicante
  background: '#F8FAFC',   // Fondo base — evita fatiga visual
  surface:    '#FFFFFF',   // Superficies de tarjetas
  window:     '#E2E8F0',   // Bordes y separadores suaves
} as const;

// ── Tema Oscuro ───────────────────────────────────────────────────────────────
const DarkColors = {
  primary:    '#6366F1',   // Indigo más claro — mayor contraste en oscuro
  secondary:  '#FBBF24',   // Ámbar más brillante
  dark:       '#F1F5F9',   // Texto principal claro (invertido)
  light:      '#1E293B',   // Separadores oscuros
  gray:       '#94A3B8',   // Textos secundarios más claros
  success:    '#34D399',   // Verde más brillante en oscuro
  warning:    '#FCD34D',   // Amarillo más brillante
  error:      '#F87171',   // Rojo más brillante
  info:       '#38BDF8',   // Azul más brillante
  background: '#0F172A',   // Fondo oscuro profundo
  surface:    '#1E293B',   // Superficies de tarjetas oscuras
  window:     '#334155',   // Bordes sutiles en oscuro
} as const;

// ── Función dinámica ───────────────────────────────────────────────────────────
/** Devuelve la paleta correcta según el tema activo. Úsala con `useThemeStore`. */
export function getColors(isDark: boolean) {
  return isDark ? DarkColors : LightColors;
}

// ── Alias estático (compatibilidad hacia atrás) ────────────────────────────────
/** Paleta del tema claro. Para componentes sin soporte dinámico de tema aún. */
export const Colors = LightColors;

export type ColorTheme = typeof LightColors;