/**
 * Motion tokens. Slow, organic, atmospheric — closer to breathing and
 * drifting than to UI micro-interactions. Durations mirror the CSS custom
 * properties in styles.css so JS-driven motion stays in the same language.
 */
export const duration = {
  touch: 260,
  settle: 480,
  page: 720,
  atmos: 1100,
  breath: 5200,
} as const;

export const easing = {
  drift: "cubic-bezier(0.32, 0.08, 0.24, 1)",
  breath: "cubic-bezier(0.45, 0, 0.55, 1)",
  page: "cubic-bezier(0.22, 0.61, 0.24, 1)",
} as const;

/** Stagger helper for lists that should settle rather than pop. */
export function stagger(index: number, step = 55, cap = 8) {
  return `${Math.min(index, cap) * step}ms`;
}
