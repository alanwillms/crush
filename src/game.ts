import { fabric } from "fabric";
import Pointer from "./pointer";
import Board from "./board";
import Sound from "./sound";
import Piece from "./piece";

export default class Game {
  private board: Board;
  private currentPiece: Piece;
  private pointer: Pointer;

  constructor(private readonly canvas: fabric.Canvas) {
    const tileSize = (window as any)._tileSize;
    const horizontalTiles = (window as any)._horizontalTiles;
    const verticalTiles = (window as any)._verticalTiles;

    this.board = new Board(
      this.canvas,
      this,
      horizontalTiles,
      verticalTiles,
      tileSize
    );
    this.pointer = new Pointer(this.canvas);

    document.getElementById("app").style.width =
      horizontalTiles * tileSize + 1 + "px";
    document.getElementById("app").style.height =
      verticalTiles * tileSize + 1 + "px";

    this.canvas.on("mouse:down", (options) => {
      (window as any)._mouseBeginningX = (options.e as any).offsetX;
      (window as any)._mouseBeginningY = (options.e as any).offsetY;

      this.setCurrentPiece(
        this.getBoard().getRowAt((options.e as any).offsetY),
        this.getBoard().getColumnAt((options.e as any).offsetX)
      );
    });

    this.canvas.on("mouse:up", async (options) => {
      var movedPiece = this.getCurrentPiece();

      if (!movedPiece) {
        return false;
      }

      var board = this.getBoard();

      if (board.isLocked()) {
        return false;
      }

      var oldRow = movedPiece.getRow();
      var oldColumn = movedPiece.getColumn();

      var mouseRow = board.getRowAt((options.e as any).offsetY);
      var mouseColumn = board.getColumnAt((options.e as any).offsetX);

      if (!board.isInsideBoard(mouseRow, mouseColumn)) {
        return false;
      }

      // Moved mouse outside initial place
      if (mouseRow == oldRow && mouseColumn == oldColumn) {
        return false;
      }

      var newRow = oldRow;
      var newColumn = oldColumn;

      // Limit row movement to 1 position
      // diagonal become either up or down
      if (mouseRow < oldRow) {
        newRow--;
      } else if (mouseRow > oldRow) {
        newRow++;
      } else if (mouseColumn > oldColumn) {
        newColumn++;
      } else {
        newColumn--;
      }

      if (!board.isInsideBoard(newRow, newColumn)) {
        return false;
      }

      if (newRow == oldRow && newColumn == oldColumn) {
        return false;
      }

      var replacedPiece = this.getBoard().getPiece(newRow, newColumn);

      if (!replacedPiece) {
        return false;
      }

      board.lock();
      await board.swap(movedPiece, replacedPiece);

      if (!board.hasMatches()) {
        // Move back
        await this.board.swap(replacedPiece as Piece, movedPiece);
        board.unlock();
        return false;
      }

      await board.animateRemoveMatches();

      board.unlock();

      this.pointer.increaseMovements();
      this.pointer.update();

      // Play sound
      Sound.playMove();
    });
  }

  getBoard() {
    return this.board;
  }

  getPointer() {
    return this.pointer;
  }

  setCurrentPiece(row: number, column: number) {
    this.currentPiece = this.getBoard().getPiece(row, column) as Piece;
  }

  getCurrentPiece() {
    return this.currentPiece;
  }
}
