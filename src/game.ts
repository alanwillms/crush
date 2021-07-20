import { fabric } from "fabric";
import Pointer from "./pointer";
import Board from "./board";
import Sound from "./sound";
import Piece from "./piece";

export default class Game {
  private board;
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

    var currentPiece = null;

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

    this.canvas.on("mouse:up", (options) => {
      var movedPiece = this.getCurrentPiece();

      if (!movedPiece) {
        return false;
      }

      var board = this.getBoard();

      var oldRow = movedPiece.getRow();
      var oldColumn = movedPiece.getColumn();

      var mouseRow = board.getRowAt((options.e as any).offsetY);
      var mouseColumn = board.getColumnAt((options.e as any).offsetX);

      // Moved outside board
      if (!board.checkPosition(mouseRow, mouseColumn)) {
        return false;
        // @TODO play "failure" sound
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

      // If it explodes the board limit, does nothing
      var firstRow = 0;
      var firstColumn = 0;
      var lastRow = board.getLastRow();
      var lastColumn = board.getLastColumn();

      if (!board.checkPosition(newRow, newColumn)) {
        return false;
        // @TODO play "failure" sound
      }

      if (newRow == oldRow && newColumn == oldColumn) {
        return false;
      }

      var replacedPiece = this.getBoard().getPiece(newRow, newColumn);

      board.move(movedPiece, replacedPiece, () => {
        if (board.getMatches().length > 0) {
          board.animateRemoveMatches();

          this.pointer.increaseMovements();
          this.pointer.update();

          // Play sound
          Sound.playMove();
        } else {
          // Move back
          board.move(replacedPiece, movedPiece);
        }
      });
    });
  }

  getBoard() {
    return this.board;
  }

  getPointer() {
    return this.pointer;
  }

  setCurrentPiece(row: number, column: number) {
    this.currentPiece = this.getBoard().getPiece(row, column);
  }

  getCurrentPiece() {
    return this.currentPiece;
  }
}
