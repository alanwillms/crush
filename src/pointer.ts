import { fabric } from "fabric";

export default class Pointer {
  private doll: fabric.Text;

  constructor(
    private readonly canvas: fabric.Canvas,
    private movements = 0,
    private piecesDestroyed = 0
  ) {
    this.update();
  }

  update() {
    if (this.doll) {
      this.canvas.remove(this.doll);
    }
    this.doll = this.createDoll();
    this.canvas.add(this.doll);
  }

  private createDoll() {
    return new fabric.Text(
      `${this.piecesDestroyed} pieces ${this.movements} movements`,
      {
        left:
          ((window as any)._horizontalTiles * (window as any)._tileSize) / 2,
        top: (window as any)._verticalTiles * (window as any)._tileSize + 1,
        textAlign: "center",
        originX: "center",
        fontFamily: "Arial",
      }
    );
  }
}
