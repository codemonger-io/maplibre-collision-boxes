[English](./README.md) / 日本語

# Maplibre Collision Boxesのサンプル

`maplibre-collision-boxes`のデモをする簡単な[Vue 3](https://vuejs.org)アプリです。
このプロジェクトは`npm init vue@latest`で生成しました。

このアプリは東京駅周辺の[Maplibre](https://maplibre.org)マップを表示し、ランダムに猫と犬のシンボルを撒き散らします。
猫か犬のシンボルをクリックし、どのシンボルが隠されているかを見ることができます。
![スクリーンショット](./screenshots.png)

## はじめる

### 事前準備

[Node.js](https://nodejs.org/en/)をインストールする必要があります。
このライブラリはバージョン22で開発しました。

### 依存関係を解決する

```sh
pnpm install --frozen-lockfile
```

### 開発サーバーでサンプルを動かす

```sh
pnpm dev
```

開発サーバーは http://localhost:5173 でホストされます。