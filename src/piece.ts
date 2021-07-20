import { fabric } from "fabric";
import Board from "./board";

const types = {
  1: "pieces/01.png",
  2: "pieces/02.png",
  3: "pieces/03.png",
  4: "pieces/04.png",
  5: "pieces/05.png",
  6: "pieces/06.png",
};

export default class Piece {
  type: number;
  color: string;
  locked: boolean;
  doll: fabric.Image;

  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly board: Board,
    public row: number,
    public column: number
  ) {
    this.type = Math.floor(Math.random() * 6) + 1;
    this.color = types[this.type];
    this.locked = false;
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

  move(newRow: number, newColumn: number, callback?: Function) {
    this.getDoll().bringToFront();
    this.row = newRow;
    this.column = newColumn;

    this.getDoll().animate(
      {
        left: 1 + newColumn * (window as any)._tileSize,
        top: 1 + newRow * (window as any)._tileSize,
      },
      {
        duration: 250,
        onChange: this.canvas.renderAll.bind(this.canvas),
        onComplete: callback,
      }
    );
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
