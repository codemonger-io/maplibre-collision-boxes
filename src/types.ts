import type { GeoJSONFeature, Map } from 'maplibre-gl';

/**
 * Box in the screen coordinate.
 *
 * @beta
 */
export interface Box {
  /** X-coordinate value of the top-left corner of the box. */
  tlX: number;

  /** Y-coordinate value of the top-left corner of the box. */
  tlY: number;

  /** X-coordinate value of the bottom-right corner of the box. */
  brX: number;

  /** Y-coordinate value of the bottom-right corner of the box. */
  brY: number;
}

/**
 * Data part of `GeoJSONFeature`.
 *
 * @remarks
 *
 * Private fields (`_vectorTileFeature.*`) in the original `GeoJSONFeature`
 * class caused a type error in client code.
 *
 * Excludes the following fields and other methods:
 * - `_vectorTileFeature`
 * - `_geometry`
 *
 * @beta
 */
export type GeoJSONFeatureData = Pick<GeoJSONFeature, 'type' | 'geometry' | 'properties' | 'id'>;

/**
 * Box with feature information.
 *
 * @beta
 */
export interface FeatureBox {
  /** Box of the feature. */
  box: Box;

  /** Feature. */
  feature: GeoJSONFeatureData;
}
