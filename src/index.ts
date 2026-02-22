/**
 * Collision box utility for
 * {@link https://github.com/maplibre/maplibre-gl-js|Maplibre GL JS}.
 *
 * @packageDocumentation
 *
 * @beta
 */

import type { Map } from 'maplibre-gl';

import { calculateCollisionBox } from './private/collision-index';
import { EXTENT, SymbolStyleLayer, isSymbolBucket } from './private/maplibre-types';
import { waitForPlacement } from './private/placement';
import { translatePosition } from './private/util';
import type { Box, FeatureBox } from './types';
export type { Box, FeatureBox } from './types';

// placement timeout in milliseconds.
const PLACEMENT_TIMEOUT_IN_MS = 5000;

/**
 * Collects collision boxes on a given Maplibre map layer.
 *
 * @remarks
 *
 * This function waits until the last symbol placement finishes.
 * The wait times out after five seconds.
 *
 * @param map -
 *
 *   {@link https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/|Maplibre map} instance.
 *
 * @param layerId -
 *
 *   ID of the layer where collision boxes are to be collected.
 *
 * @returns
 *
 *   Collision boxes and features on the layer associated with `layerId` on
 *   `map`.
 *
 * @throws RangeError
 *
 *   If there is no layer associated with `layerId`, or if the layer associated
 *   with `layerId` is not a symbol layer.
 *
 * @throws Error
 *
 *   If there is an error.
 *
 * @beta
 */
export async function collectCollisionBoxesAndFeatures(
  map: Map,
  layerId: string,
): Promise<FeatureBox[]> {
  const style = map.style;
  // there was a breaking change to `FeatureIndex.lookupSymbolFeatures` in
  // v5.7.2. so we need to determine if maplibre-gl-js is 5.7.2 or higher.
  // in v5.7.2, the `globalState` field in `SymbolBucket` was removed.
  // however, the `globalState` field was introduced in v5.6.0; i.e., v5.5.0 or
  // lower neither have the `globalState` field. so we need another clue to
  // distinguish v5.7.2 or higher from v5.5.0 or lower. we can use the fact that
  // v5.6.0 introduced the `Map.getGlobalState` API that still exists in v5.7.2
  // or higher.
  const isV5_6_0OrHigher = typeof map.getGlobalState === 'function';
  const placement = style.placement;
  const layer = style._layers[layerId];
  if (layer == null) {
    throw new RangeError(`no such layer: ${layerId}`);
  }
  if (layer.type !== 'symbol') {
    throw new RangeError(`layer "${layerId}" is not a symbol layer`);
  }
  await waitForPlacement(placement, PLACEMENT_TIMEOUT_IN_MS);
  const sourceCache = style.sourceCaches[layer.source];
  if (sourceCache == null) {
    throw new Error(`no SourceCache available`);
  }
  const layerTiles = sourceCache.getRenderableIds(
    true, // symbolLayer?
  ).map(id => sourceCache.getTileByID(id));
  const transform = map.painter.transform;
  const collisionBoxesWithFeature = [];
  for (const tile of layerTiles) {
    const bucket = tile.getBucket(layer);
    if (bucket == null) {
      // tile may not contain any symbols
      continue;
    }
    if (!isSymbolBucket(bucket)) {
      console.warn(`layer "${layerId}" must be associated with a SymbolBucket`);
      continue;
    }
    // if the bucket has `globalState`,
    // the version should be between 5.6.0 and 5.7.1
    const isBetweenV5_6_0AndV5_7_1 = typeof bucket.globalState !== 'undefined';

    // parameters calculated in `Placement.getBucketParts`
    // - https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/src/symbol/placement.ts#L257
    const textPixelRatio = tile.tileSize / EXTENT;
    // - https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/src/symbol/placement.ts#L270-L274
    const translation = translatePosition(
      placement.collisionIndex.transform,
      tile,
      (layer as SymbolStyleLayer).paint.get('icon-translate'),
      (layer as SymbolStyleLayer).paint.get('icon-translate-anchor'),
    );

    // parameters calculated in `Placement.placeLayerBucketPart`
    // - https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/src/symbol/placement.ts#L461
    // @ts-expect-error: TS2341 - _getTerrainElevationFunc is private
    const getElevation = placement._getTerrainElevationFunc(tile.tileID);
    // - https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/src/symbol/placement.ts#L462
    const simpleProjectionMatrix = placement.transform.getFastPathSimpleProjectionMatrix(tile.tileID);

    const featureIndexes = [];
    const featureCollisionBoxes = []; // featureIndex → collision box
    for (let i = 0; i < bucket.symbolInstances.length; ++i) {
      const featureIndex = bucket.symbolInstances.get(i).featureIndex;
      featureIndexes.push(featureIndex);
      // calculates the collision box of the feature
      const { iconBox } = bucket.collisionArrays[i];
      if (iconBox != null) {
        featureCollisionBoxes[featureIndex] = calculateCollisionBox(
          placement,
          tile,
          iconBox,
          textPixelRatio,
          translation,
          getElevation,
          simpleProjectionMatrix,
        );
      }
    }
    const queryData = placement.retainedQueryData[bucket.bucketInstanceId];
    const results = queryData.featureIndex.lookupSymbolFeatures(
      featureIndexes,
      // https://github.com/maplibre/maplibre-gl-js/blob/50da15ce18fc8b68396f76d43ef512694a3d195d/src/style/style.ts#L1542-L1543
      // @ts-expect-error: TS2341 - _serializedAllLayers is private
      style._serializedAllLayers() as {[_: string]: StyleLayer},
      queryData.bucketIndex,
      queryData.sourceLayerIndex,
      // @ts-expect-error: TS2345 - filterSpec parameter was replaced with filterParams in v5.7.2
      isV5_6_0OrHigher && !isBetweenV5_6_0AndV5_7_1
        ? {
          filterSpec: null,
          globalState: map.getGlobalState(),
        }
        : null, // filterSpec
      null, // filterLayerIDs
      style._availableImages,
      style._layers,
    );
    for (const layerResults of Object.values(results)) {
      for (const feature of layerResults) {
        collisionBoxesWithFeature.push({
          box: featureCollisionBoxes[feature.featureIndex],
          feature: feature.feature,
        });
      }
    }
  }
  return collisionBoxesWithFeature;
}

/**
 * Returns if two `Box`es intersect.
 *
 * @param box1 -
 *
 *   Box to be tested.
 *
 * @param box2 -
 *
 *   Another box to be tested.
 *
 * @returns
 *
 *   Whether `box1` and `box2` intersect.
 *
 * @beta
 */
export function boxesIntersect(box1: Box, box2: Box): boolean {
  return box1.tlX < box2.brX &&
    box1.tlY < box2.brY &&
    box2.tlX < box1.brX &&
    box2.tlY < box1.brY;
}
