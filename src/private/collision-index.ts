/**
 * Clone of `CollisionIndex`.
 *
 * @remarks
 *
 * All the code in this file is a modified copy of the source code of
 * `maplibre-gl`.
 *
 * @beta
 */

import type { mat4 } from 'gl-matrix';

import type { Box } from '../types';
import type {
  CollisionIndex,
  Placement,
  SingleCollisionBox,
  SymbolBucket,
  Tile,
} from './maplibre-types';

/**
 * Clone of collistion box calculation in `CollisionIndex#placeCollisionBox`.
 *
 * @remarks
 *
 * Implements only the collision box calculation of
 * `CollisionIndex#placeCollisionBox`.
 * https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/src/symbol/collision_index.ts#L102-L183
 *
 * @beta
 */
export function calculateCollisionBox(
  placement: Placement,
  tile: Tile,
  collisionBox: SingleCollisionBox,
  textPixelRatio: number,
  translation: [number, number],
  getElevation?: (x: number, y: number) => number,
  simpleProjectionMatrix?: mat4,
): Box {
  const { collisionIndex } = placement;

  const x = collisionBox.anchorPointX + translation[0];
  const y = collisionBox.anchorPointY + translation[1];
  const projectedPoint = collisionIndex.projectAndGetPerspectiveRatio(
    x,
    y,
    tile.tileID.toUnwrapped(),
    getElevation,
    simpleProjectionMatrix,
  );

  const tileToViewport = textPixelRatio * projectedPoint.perspectiveRatio;

  // assumes `pitchWithMap` and `rotateWithMap` are both `false`,
  // because they are for texts
  // https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/src/symbol/collision_index.ts#L130-L141
  const pointX = projectedPoint.x; // no shift for texts
  const pointY = projectedPoint.y; // no shift for texts
  const tlX = pointX + collisionBox.x1 * tileToViewport;
  const tlY = pointY + collisionBox.y1 * tileToViewport;
  const brX = pointX + collisionBox.x2 * tileToViewport;
  const brY = pointY + collisionBox.y2 * tileToViewport;

  return {
    tlX,
    tlY,
    brX,
    brY,
  };
}
