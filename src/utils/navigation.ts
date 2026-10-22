/**
 * Navigation interface compatible with expo-router's useRouter()
 */
export interface SafeRouter {
  canGoBack: () => boolean;
  back: () => void;
  push: (href: any) => void;
  replace?: (href: any) => void;
}

/**
 * Safely navigates back in stack if possible, otherwise falls back to specified route.
 * Prevents infinite navigation loops and duplicated screen stacks (MOV-23).
 */
export function goBackOrTo(
  router: SafeRouter,
  fallbackHref: string = '/(student)/subjects'
) {
  if (router && typeof router.canGoBack === 'function' && router.canGoBack()) {
    router.back();
  } else if (router && typeof router.push === 'function') {
    router.push(fallbackHref as any);
  }
}
