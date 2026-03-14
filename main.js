import "./style.css";

import { Canvas, FabricImage } from "fabric";
import Game from "./src/game";
import pieceTypes from "./src/piece-types";

window._tileSize = 48;
window._horizontalTiles = 9;
window._verticalTiles = 9;
window._pointerHeight = 60;
window._piecesImages = {};

const canvas = new Canvas("canvas", {
  hoverCursor: "pointer",
  selection: false,
  width: window._horizontalTiles * window._tileSize + window._tileSize / 2 + 1,
  height: (window._verticalTiles + 1) * window._tileSize + 1 + window._pointerHeight,
});

const loadNextPieceImageOrStartGame = async (index) => {
  const url = pieceTypes[index];

  if (!url) {
    return new Game(canvas);
  }

  const sprite = await FabricImage.fromURL(url);
  window._piecesImages[index] = sprite.getElement();
  loadNextPieceImageOrStartGame(index + 1);
};

loadNextPieceImageOrStartGame(1);
