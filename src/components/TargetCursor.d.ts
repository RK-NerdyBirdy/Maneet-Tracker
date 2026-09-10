// Types for the untyped JS React Bits component (TargetCursor.jsx).
// TS resolves this declaration in preference to the .jsx file, making all
// props optional to match the runtime defaults in the component source.

import type { ComponentType } from 'react';

export interface TargetCursorProps {
  /** CSS selector for elements that trigger the cursor targeting effect */
  targetSelector?: string;
  /** Seconds for the cursor's spinning animation when not targeting */
  spinDuration?: number;
  /** Whether to hide the default browser cursor */
  hideDefaultCursor?: boolean;
  /** Seconds for the transition when the cursor locks onto a target */
  hoverDuration?: number;
  /** Enables a subtle parallax effect on the corners over a target */
  parallaxOn?: boolean;
  /** Color of the cursor dot and corner brackets at rest */
  cursorColor?: string;
  /** Optional color the cursor transitions to while locked onto a target */
  cursorColorOnTarget?: string;
}

declare const TargetCursor: ComponentType<TargetCursorProps>;
export default TargetCursor;
