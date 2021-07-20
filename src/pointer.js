import { fabric } from "fabric";

export default class Pointer {
  _createDoll() {
    return new fabric.Text(
      this.piecesDestroyed + " pieces " + this.movements + " movements",
      {
        left: (window._horizontalTiles * window._tileSize) / 2,
        top: window._verticalTiles * window._tileSize + 1,
        textAlign: "center",
        originX: "center",
        fontFamily: "Arial",
      }
    );
  }

  update() {
    if (this.doll) {
      this.canvas.remove(this.doll);
    }
    this.doll = this._createDoll();
    this.canvas.add(this.doll);
  }

  constructor(canvas) {
    this.canvas = canvas;
    this.movements = 0;
    this.piecesDestroyed = 0;
    this.update();
  }
}
