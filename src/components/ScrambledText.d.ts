// Types for the untyped JS React Bits component (ScrambledText.jsx).
// TS resolves this declaration in preference to the .jsx file, making all
// props optional to match the runtime defaults in the component source.

import type { ComponentType, CSSProperties, ReactNode } from 'react';

export interface ScrambledTextProps {
  /** Radius around the mouse pointer within which characters scramble */
  radius?: number;
  /** Duration of the scramble effect on a character */
  duration?: number;
  /** Speed of the scramble animation */
  speed?: number;
  /** Characters used for scrambling */
  scrambleChars?: string;
  /** The text content to be scrambled */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

declare const ScrambledText: ComponentType<ScrambledTextProps>;
export default ScrambledText;
