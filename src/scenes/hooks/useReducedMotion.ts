/**
 * The site already ships this hook (src/hooks/usePrefersReducedMotion.ts) and it
 * has exactly the semantics the scene system needs: a reactive boolean off
 * `(prefers-reduced-motion: reduce)` with listener cleanup. Re-exported under the
 * scene-system name rather than duplicated, so there is one implementation to keep
 * correct.
 *
 * This is the only outward dependency in src/scenes/. To lift the folder into
 * another project, inline the hook body here and the directory is self-contained
 * again.
 */
export { usePrefersReducedMotion as useReducedMotion } from '../../hooks/usePrefersReducedMotion';
