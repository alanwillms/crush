import "./style.css";

import { fabric } from "fabric";
import Game from "./src/game";
import pieceTypes from "./src/piece-types";

window._tileSize = 48;
window._horizontalTiles = 9;
window._verticalTiles = 9;
window._pointerHeight = 60;
window._piecesImages = {};

const canvas = new fabric.Canvas("canvas", {
  hoverCursor: "pointer",
  selection: false,
  width: window._horizontalTiles * window._tileSize + 1,
  height: window._verticalTiles * window._tileSize + 1 + window._pointerHeight,
});

const loadNextPieceImageOrStartGame = (index) => {
  const url = pieceTypes[index];

  if (!url) {
    return new Game(canvas);
  }

  fabric.Image.fromURL(url, (sprite) => {
    window._piecesImages[index] = sprite.getElement();
    loadNextPieceImageOrStartGame(index + 1);
  });
};

loadNextPieceImageOrStartGame(1);
