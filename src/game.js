import Pointer from "./pointer";
import Board from "./board";
import Sound from "./sound";

var Game = function (canvas) {
  var tileSize = window._tileSize;
  var horizontalTiles = window._horizontalTiles;
  var verticalTiles = window._verticalTiles;
  var board = new Board(canvas, this, horizontalTiles, verticalTiles, tileSize);
  var pointer = new Pointer(canvas);

  var currentPiece = null;

  self = this;

  document.getElementById("app").style.width =
    horizontalTiles * tileSize + 1 + "px";
  document.getElementById("app").style.height =
    verticalTiles * tileSize + 1 + "px";

  this.getBoard = function () {
    return board;
  };

  this.getPointer = function () {
    return pointer;
  };

  this.setCurrentPiece = function (row, column) {
    currentPiece = self.getBoard().getPiece(row, column);
  };

  this.getCurrentPiece = function () {
    return currentPiece;
  };

  canvas.on({
    "mouse:down": function (options) {
      window._mouseBeginningX = options.e.offsetX;
      window._mouseBeginningY = options.e.offsetY;

      self.setCurrentPiece(
        self.getBoard().getRowAt(options.e.offsetY),
        self.getBoard().getColumnAt(options.e.offsetX)
      );
    },
    "mouse:up": function (options) {
      var movedPiece = self.getCurrentPiece();

      if (!movedPiece) {
        return false;
      }

      var board = self.getBoard();

      var oldRow = movedPiece.getRow();
      var oldColumn = movedPiece.getColumn();

      var mouseRow = board.getRowAt(options.e.offsetY);
      var mouseColumn = board.getColumnAt(options.e.offsetX);

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

      var replacedPiece = self.getBoard().getPiece(newRow, newColumn);

      board.move(movedPiece, replacedPiece, function () {
        if (board.getMatches().length > 0) {
          board.animateRemoveMatches();

          pointer.movements++;
          pointer.update();

          // Play sound
          Sound.playMove();
        } else {
          // Move back
          board.move(replacedPiece, movedPiece);
        }
      });
    },
  });
};

export default Game;
