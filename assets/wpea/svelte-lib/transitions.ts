import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

/**
 * Custom transition: slide up + scale + fade
 * Matches the wpea-framework modal animation: translateY(20px) scale(0.95) -> translateY(0) scale(1)
 *
 * @param node - The HTML element to animate
 * @param options - Transition options
 * @param options.duration - Animation duration in milliseconds (default: 300)
 * @param options.easing - Easing function (default: cubicOut)
 * @param options.y - Distance to slide in pixels (default: 20)
 * @param options.scale - Starting scale value (default: 0.95)
 *
 * @example
 * ```svelte
 * <div transition:modalSlideUp>Content</div>
 * <div transition:modalSlideUp={{ duration: 400, y: 30 }}>Content</div>
 * ```
 */
export function modalSlideUp(
  node: HTMLElement,
  {
    duration = 300,
    easing = cubicOut,
    y = 20,
    scale = 0.95
  } = {}
): TransitionConfig {
  return {
    duration,
    easing,
    css: (t: number) => {
      const yPos = (1 - t) * y; // Start at y pixels below, slide to 0
      const scaleValue = scale + (t * (1 - scale)); // Start at scale%, grow to 100%
      const opacity = t; // Start transparent, fade to opaque

      return `
        transform: translateY(${yPos}px) scale(${scaleValue});
        opacity: ${opacity};
      `;
    }
  };
}
