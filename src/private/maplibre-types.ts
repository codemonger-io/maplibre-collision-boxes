/**
 * Extracts types of `maplibre-gl`.
 *
 * @remarks
 *
 * All the material in this file is derived from the source code of
 * `maplibre-gl`, including only minimal definitions necessary to implement
 * this library.
 *
 * @beta
 */

import type { Style } from 'maplibre-gl';

// https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/src/data/extent.ts#L13
export const EXTENT = 8192;

export interface StyleCompat extends Style {
  // sourceCaches was replaced with tileManagers in v5.11.0.
  // the signature is identical in terms of this library's usage.
  sourceCaches?: Style['tileManagers'];
};

// NOTE: unpublished latest `maplibre-gl` exports `StyleLayer`.
export type StyleLayer = Style['_layers'][number];

export type Placement = Style['placement'];

export type CollisionIndex = Placement['collisionIndex'];

export type Tile = Style['sourceCaches']['string']['_tiles']['string'];

export type OverscaledTileID = Tile['tileID'];

export type UnwrappedTileID = ReturnType<OverscaledTileID['toUnwrapped']>;

export type CanonicalTileID = OverscaledTileID['canonical'];

export type Bucket = Tile['buckets']['string'];

// Minimal interface of `SymbolBucket`.
//
// https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/src/data/bucket/symbol_bucket.ts#L277-L955
export type SymbolBucket = Bucket & {
  // `globalState` was introduced in v5.6.0 but was removed in v5.7.2
  // https://github.com/maplibre/maplibre-gl-js/blob/b3e282bbb0b8f93b503895281ec313a4e2a1c6be/src/data/bucket/symbol_bucket.ts#L315
  globalState?: Record<string, any>;
  bucketInstanceId: number;
  symbolInstances: SymbolInstanceArray;
  collisionArrays: CollisionArrays[];
}

// Minimal interface of `SymbolInstanceArray` whose code is generated.
//
// Generated at https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/build/generate-struct-arrays.ts#L164
export interface SymbolInstanceArray {
  length: number;
  get(i: number): SymbolInstanceItem;
}

// Minimal interface of an item in `SymbolInstanceArray`.
//
// Defined at https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/src/data/bucket/symbol_attributes.ts#L78-L107
export interface SymbolInstanceItem {
  featureIndex: number;
}

// Minimal interface of `CollisionArrays`.
//
// https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/src/data/bucket/symbol_bucket.ts#L68-L77
export interface CollisionArrays {
  iconBox?: SingleCollisionBox;
}

// Clone of `SingleCollisionBox`.
//
// https://github.com/maplibre/maplibre-gl-js/blob/50da15ce18fc8b68396f76d43ef512694a3d195d/src/data/bucket/symbol_bucket.ts#L59-L66
export interface SingleCollisionBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  anchorPointX: number;
  anchorPointY: number;
}

// Minimal interface of `SymbolStyleLayer` whose code is generated.
export interface SymbolStyleLayer {
  // You can find the generator script here: https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/build/generate-style-code.ts#L158-L163
  //
  // Actual `paint` properties are defined here: https://github.com/maplibre/maplibre-style-spec/blob/abd2c68b3179e57fa7b02ef2e952221b107f6b6f/src/reference/v8.json#L6859-L7293
  paint: {
    get(k: 'icon-translate'): [number, number];
    get(k: 'icon-translate-anchor'): 'map' | 'viewport';
  };
}

/**
 * Returns if a given `Bucket` is a `SymbolBucket`.
 *
 * @remarks
 *
 * This is a TypeScript custom guard for `SymbolBucket`.
 *
 * @param bucket -
 *
 *   Bucket to be tested.
 *
 * @return -
 *
 *   Whether `bucket` is a `SymbolBucket` or not.
 *
 * @beta
 */
export function isSymbolBucket(bucket: Bucket): bucket is SymbolBucket {
  return (bucket as SymbolBucket).symbolInstances !== undefined;
}
