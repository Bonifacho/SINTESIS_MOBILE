// src/hooks/useColors.ts
// Hook centralizado de tema. Úsalo en cualquier componente para obtener
// los colores reactivos al tema claro/oscuro del usuario.
//
// Uso:
//   import { useColors } from '@/src/hooks/useColors';
//   const C = useColors();

import { useThemeStore } from '@/src/store/themeStore';
import { getColors } from '@/src/theme/colors';

export function useColors() {
  const isDark = useThemeStore((s) => s.isDark);
  return getColors(isDark);
}
