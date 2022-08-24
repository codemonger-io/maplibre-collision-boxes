import type { Map } from 'maplibre-gl';

/**
 * Loads and adds images.
 *
 * @param map -
 *
 *   Map instance to load images.
 *
 * @param imagePaths -
 *
 *   Maps an image ID to the path to the image.
 */
export async function loadAndAddImages(
  map: Map,
  imagePaths: { [imageId: string]: string },
): Promise<void> {
  await Promise.all(Object.keys(imagePaths).map(imageId => {
    return loadAndAddImage(map, imageId, imagePaths[imageId]);
  }));
}

// loads and adds a single image.
async function loadAndAddImage(
  map: Map,
  imageId: string,
  imagePath: string,
): Promise<void> {
  const res = await map.loadImage(imagePath);
  if (!map.hasImage(imageId)) {
    map.addImage(imageId, res.data);
  }
}
