English / [日本語](./README_ja.md)

# Maplibre Collision Boxes

A utility library for [Maplibre GL JS (`maplibre-gl`)](https://github.com/maplibre/maplibre-gl-js), that calculates collision boxes of symbols on a Maplibre map in the screen coordinate.

## Getting started

### Prerequisites

This library is intended to work with `maplibre-gl` version 5.x.
(This library has been developed with v5.6.2.)

### How to install

Please add this repository to your dependencies.

```sh
npm install https://github.com/codemonger-io/maplibre-collision-boxes#v0.1.0
```

#### Installing from GitHub Packages

Whenever commits are pushed to the `main` branch, a _developer package_ is published to the npm registry managed by GitHub Packages.
A _developer package_ bears the next release version but followed by a dash (`-`) plus the short commit hash; e.g., `0.1.0-abc1234` where `abc1234` is the short commit hash of the commit used to build the package (_snapshot_).
You can find _developer packages_ [here](https://github.com/codemonger-io/maplibre-collision-boxes/pkgs/npm/maplibre-collision-boxes).

##### Configuring a GitHub personal access token

To install a _developer package_, you need to configure a **classic** GitHub personal access token (PAT) with at least the `read:packages` scope.
Below briefly explains how to configure a PAT.
Please refer to the [GitHub documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) for more details.

Once you have a PAT, please create a `.npmrc` file in your home directory with the following contents (please replace `$YOUR_GITHUB_PAT` with your PAT.):

```
//npm.pkg.github.com/:_authToken=$YOUR_GITHUB_PAT
```

In the root directory of your project, create another `.npmrc` file with the following contents:

```
@codemonger-io:registry=https://npm.pkg.github.com
```

Then you can install a _developer package_ with the following command:

```sh
npm install @codemonger-io/maplibre-collision-boxes@0.1.0-abc1234
```

Please replace `abc1234` with the short commit hash of the _snapshot_ you want to install.

### Usage

The following snippet is an example to collect features hidden by a clicked symbol on the screen.

```ts
import maplibre from 'maplibre-gl';
import { boxesIntersect, collectCollisionBoxesAndFeatures } from '@codemonger-io/maplibre-collision-boxes';

const map = new maplibre.Map(
    // ... initialize map
);
// ... other configurations
const layerId = 'cats-and-dogs'; // suppose you have a custom layer
const map.on('click', layerId, async event => {
    const clickedFeatureId = event.features[0].id;
    const collisionBoxes = await collectCollisionBoxesAndFeatures(map, layerId);
    const clickedBox = collisionBoxes.find(box => box.feature.id === clickedFeatureId);
    const hiddenBoxes = collisionBoxes.filter(box => box !== clickedBox && boxesIntersect(box.box, clickedBox.box));
    const hiddenFeatures = hiddenBoxes.map(box => box.feature);
    // ... process features
});
```

You can find a complete project in the [`example`](./example) folder.

### Remarks on type compatibility

While this library works with `maplibre-gl` version from 5.0.0 through version 5.6.2, you may face a type error at the call of the `collectCollisionBoxesAndFeatures` function if your `maplibre-gl` version is different from the one (5.6.2) for which this library is built.
Please ignore or suppress the type error in case you see it.

## Motivation

I had been developing an app that shows custom symbols on a map using [symbol layers](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#symbol) of [`mapbox-gl`](https://github.com/mapbox/mapbox-gl-js).
When symbols overlapped on the screen, `mapbox-gl` showed only the first one and hid other overlapping ones.
As far as I knew, there was no `mapbox-gl` API to get symbols hidden by a specific symbol on the screen.
This was not convenient for my app because it wanted to list all the symbols including hidden ones at a clicked point.
Although there was an [option](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#layout-symbol-icon-allow-overlap) that made `mapbox-gl` skip collision detection and show every single symbol on the screen, this would make the map too busy if there were many overlapping symbols.
**`maplibre-gl` has the same problem as its origin is `mapbox-gl` v1.x.**

So I decided to **develop a library that can aggregate symbols overlapping with a specific symbol on a Maplibre map**.

Please refer to [my blog post](https://codemonger.io/blog/0009-mapbox-collision-boxes/) for more details, while it is about `mapbox-gl`, the foundation is the same.

## API Documentation

Please refer to [`api-docs/markdown/index.md`](./api-docs/markdown/index.md).

## Tips

### Viewport padding

Collision boxes collected by [`collectCollisionBoxesAndFeatures`](./api-docs/markdown/maplibre-collision-boxes.collectcollisionboxesandfeatures.md) include constant offsets.
They have the actual screen position + `100`[^1] along both the x- and y-axes.
Since the offsets do not matter to hit tests among collision boxes, this library leaves them to avoid unnecessary calculation.
If you want to project collision boxes to the actual screen, you have to subtract `100` from their x- and y-axis values.

[^1]: This constant is defined as `viewportPadding` at https://github.com/maplibre/maplibre-gl-js/blob/7887f2c899dcc7f7bfa8a05f5a98c92bf1a5bf5a/src/symbol/collision_index.ts#L28 which is not exported from `maplibre-gl`.

## License

[3-Clause BSD license](./LICENSE).

## Development

### Resoving dependencies

```sh
pnpm install --frozen-lockfile
```

### Type-checking

```sh
pnpm type-check
```

### Building the library

```sh
pnpm build
```