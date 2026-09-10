// Types for the untyped JS React Bits component (CircularGallery.jsx).
// TS resolves this declaration in preference to the .jsx file, making all
// props optional to match the runtime defaults in the component source.

import type { ComponentType } from 'react';

export interface CircularGalleryItem {
  image: string;
  text: string;
}

export interface CircularGalleryProps {
  items?: CircularGalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  fontUrl?: string;
  scrollSpeed?: number;
  scrollEase?: number;
}

declare const CircularGallery: ComponentType<CircularGalleryProps>;
export default CircularGallery;
