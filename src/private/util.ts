/**
 * Clone of utilities.
 *
 * @remarks
 *
 * All the code in this file is a modified copy of the source code of
 * `maplibre-gl`.
 */

import type { OverscaledTileID } from './maplibre-types';
import { EXTENT } from './maplibre-types';

/**
 * Clone of `translatePosition`.
 *
 * https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/src/util/util.ts#L44-L73
 */
export function translatePosition(
  transform: { bearingInRadians: number, zoom: number },
  tile: { tileID: OverscaledTileID, tileSize: number },
  translate: [number, number],
  translateAnchor: 'map' | 'viewport',
  inViewportPixelUnitsUnits: boolean = false,
): [number, number] {
    if (!translate[0] && !translate[1]) return [0, 0];

    const angle = inViewportPixelUnitsUnits ?
        (translateAnchor === 'map' ? -transform.bearingInRadians : 0) :
        (translateAnchor === 'viewport' ? transform.bearingInRadians : 0);

    if (angle) {
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);
        translate = [
            translate[0] * cosA - translate[1] * sinA,
            translate[0] * sinA + translate[1] * cosA
        ];
    }

    return [
        inViewportPixelUnitsUnits ? translate[0] : pixelsToTileUnits(tile, translate[0], transform.zoom),
        inViewportPixelUnitsUnits ? translate[1] : pixelsToTileUnits(tile, translate[1], transform.zoom)];
}

/**
 * Clones `pixelsToTileUnits`.
 *
 * https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/src/source/pixels_to_tile_units.ts#L5-L25
 */
function pixelsToTileUnits(
  tile: { tileID: OverscaledTileID, tileSize: number },
  pixelValue: number,
  z: number,
): number {
  return pixelValue * (EXTENT / (tile.tileSize * Math.pow(2, z - tile.tileID.overscaledZ)));
}
