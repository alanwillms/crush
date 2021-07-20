import Piece from "./piece";

var Board = function (canvas, game, width, height, tileSize) {
  this.width = width;
  this.height = height;
  this.tileSize = tileSize;
  this.pieces = [];
  this.game = game;

  var self = this;

  for (var row = 0; row < height; row++) {
    var rowPieces = [];

    for (var column = 0; column < width; column++) {
      var piece = new Piece(canvas, this, row, column);
      var top = row * tileSize;
      var left = column * tileSize;

      // Add piece
      rowPieces.push(piece);

      canvas.add(
        // Draw cell
        new fabric.Rect({
          top: top,
          left: left,
          width: tileSize,
          height: tileSize,
          fill: "rgba(255,255,255,0.2)",
          //stroke: '#000',
          selectable: false,
        })
      );

      canvas.add(
        // Draw piece
        piece.getDoll()
      );
    }

    this.pieces.push(rowPieces);
  }

  this.getPiece = function (row, column) {
    if (
      self.pieces[row] !== undefined &&
      self.pieces[row][column] !== undefined
    ) {
      return self.pieces[row][column];
    }

    return false;
  };

  this.getRowAt = function (top) {
    return Math.floor(top / window._tileSize);
  };

  this.getColumnAt = function (left) {
    return Math.floor(left / window._tileSize);
  };

  this.getLastRow = function () {
    return window._verticalTiles - 1;
  };

  this.getLastColumn = function () {
    return window._horizontalTiles - 1;
  };

  this.getMatches = function () {
    var repeatedPieces = {};

    // Horizontal matches
    for (var row in self.pieces) {
      var previousColor = null;
      var repeatedColor = 1;

      for (var column in self.pieces[row]) {
        var current = self.pieces[row][column];

        if (previousColor === current.color) {
          repeatedColor++;
        } else {
          repeatedColor = 1;
          previousColor = current.color;
        }

        if (repeatedColor > 3) {
          repeatedPieces[row + ":" + column] = current;
        } else if (repeatedColor == 3) {
          repeatedPieces[row + ":" + column] = current;
          repeatedPieces[row + ":" + (column - 1)] =
            self.pieces[row][column - 1];
          repeatedPieces[row + ":" + (column - 2)] =
            self.pieces[row][column - 2];
        }
      }
    }

    // Vertical matches
    for (var column = 0; column < window._horizontalTiles; column++) {
      var previousColor = null;
      var repeatedColor = 1;

      for (var row = 0; row < window._verticalTiles; row++) {
        var current = self.pieces[row][column];

        if (previousColor === current.color) {
          repeatedColor++;
        } else {
          repeatedColor = 1;
          previousColor = current.color;
        }

        if (repeatedColor > 3) {
          repeatedPieces[row + ":" + column] = current;
        } else if (repeatedColor == 3) {
          repeatedPieces[row + ":" + column] = current;
          repeatedPieces[row - 1 + ":" + column] = self.pieces[row - 1][column];
          repeatedPieces[row - 2 + ":" + column] = self.pieces[row - 2][column];
        }
      }
    }

    var pieces = [];

    for (var k in repeatedPieces) {
      pieces.push(repeatedPieces[k]);
    }

    return pieces;
  };

  this.hasEmptyCells = function () {
    var empty = 0;
    for (var column = 0; column < window._horizontalTiles; column++) {
      for (var row = 0; row < window._verticalTiles; row++) {
        if (self.pieces[row][column] == null) {
          empty++;
        }
      }
    }
    return empty;
  };

  this.dropPieces = () => {
    for (var column = 0; column < window._horizontalTiles; column++) {
      for (var row = window._verticalTiles - 1; row >= 0; row--) {
        var piece = self.pieces[row][column];

        if (piece == null) {
          // Firt row creates new pieces
          if (row == 0) {
            piece = new Piece(canvas, self, row, column);
            self.pieces[row][column] = piece;

            const doll = piece.getDoll();

            if (doll) {
              canvas.add(doll);
              doll.set("top", -window._tileSize);
            }
            piece.move(row, column);
          } else {
            var upper = self.getPiece(row - 1, column);

            if (upper) {
              upper.move(row, column);

              self.pieces[row - 1][column] = null;
              self.pieces[row][column] = upper;
            }
          }
        }
      }
    }
  };

  this.animateRemoveMatches = function () {
    var repeatedPieces = self.getMatches();

    var removedPieces = 0;

    for (var k in repeatedPieces) {
      repeatedPieces[k].animateDestroy();
      removedPieces++;
    }

    game.getPointer().piecesDestroyed += removedPieces;
    game.getPointer().update();

    // Drop pieces
    while (self.hasEmptyCells()) {
      self.dropPieces();
    }

    while (self.getMatches().length > 0) {
      self.animateRemoveMatches();
    }
  };

  this.removeMatches = function () {
    var repeatedPieces = self.getMatches();

    for (var k in repeatedPieces) {
      repeatedPieces[k].regenerate();
    }

    return repeatedPieces.length;
  };

  this.move = function (piece1, piece2, callback) {
    var oldRow = piece1.row;
    var oldColumn = piece1.column;

    var newRow = piece2.row;
    var newColumn = piece2.column;

    self.pieces[oldRow][oldColumn] = piece2;
    self.pieces[newRow][newColumn] = piece1;

    piece1.move(newRow, newColumn);
    piece2.move(oldRow, oldColumn, callback);
  };

  this.checkPosition = function (newRow, newColumn) {
    var firstRow = 0;
    var firstColumn = 0;
    var lastRow = self.getLastRow();
    var lastColumn = self.getLastColumn();

    if (
      newRow < firstRow ||
      newRow > lastRow ||
      newColumn < firstColumn ||
      newColumn > lastColumn
    ) {
      return false;
    } else {
      return true;
    }
  };

  // Load without repeated pieces
  while (self.getMatches().length > 0) {
    self.removeMatches();
  }
};

export default Board;
