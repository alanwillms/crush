import { fabric } from "fabric";
import Board from "./board";
import types from "./piece-types";

export default class Piece {
  type: number;
  color: string;
  doll: fabric.Image;

  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly board: Board,
    public row: number,
    public column: number
  ) {
    this.type = Math.floor(Math.random() * 6) + 1;
    this.color = types[this.type];
    this.doll = new fabric.Image((window as any)._piecesImages[this.type], {
      top: this.row * this.board.tileSize + 1,
      left: this.column * this.board.tileSize + 1,
      selectable: false,
    });
  }

  getRow() {
    return this.row;
  }

  getColumn() {
    return this.column;
  }

  move(newRow: number, newColumn: number) {
    return new Promise((resolve, reject) => {
      this.row = newRow;
      this.column = newColumn;

      this.getDoll()
        .bringToFront()
        .animate(
          {
            left: 1 + newColumn * (window as any)._tileSize,
            top: 1 + newRow * (window as any)._tileSize,
          },
          {
            duration: 250,
            onChange: this.canvas.renderAll.bind(this.canvas),
            onComplete: resolve,
          }
        );
    });
  }

  getDoll() {
    return this.doll;
  }

  getUpperPiece() {
    return this.board.getPiece(this.row - 1, this.column);
  }

  regenerate() {
    // Remove image
    this.canvas.remove(this.doll);

    // Create new piece
    const piece = new Piece(this.canvas, this.board, this.row, this.column);
    this.board.pieces[this.row][this.column] = piece;
    this.canvas.add(piece.getDoll());
  }

  animateDestroy() {
    // Remove image
    this.canvas.remove(this.doll);

    this.board.pieces[this.row][this.column] = null;
  }
}
