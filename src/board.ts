import { fabric } from "fabric";
import Piece from "./piece";
import Game from "./game";

export default class Board {
  pieces: Piece[][];
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly game: Game,
    private readonly width: number,
    private readonly height: number,
    public readonly tileSize: number
  ) {
    this.pieces = [];

    for (let row = 0; row < this.height; row++) {
      let rowPieces = [];

      for (let column = 0; column < this.width; column++) {
        let piece = new Piece(this.canvas, this, row, column);
        let top = row * this.tileSize;
        let left = column * this.tileSize;

        // Add piece
        rowPieces.push(piece);

        this.canvas.add(
          // Draw cell
          new fabric.Rect({
            top: top,
            left: left,
            width: this.tileSize,
            height: this.tileSize,
            fill: "rgba(255,255,255,0.2)",
            selectable: false,
          })
        );

        this.canvas.add(
          // Draw piece
          piece.getDoll()
        );
      }

      this.pieces.push(rowPieces);
    }

    // Load without repeated pieces
    while (this.getMatches().length > 0) {
      this.removeMatches();
    }
  }

  getPiece(row, column) {
    if (
      this.pieces[row] !== undefined &&
      this.pieces[row][column] !== undefined
    ) {
      return this.pieces[row][column];
    }

    return false;
  }

  getRowAt(top) {
    return Math.floor(top / (window as any)._tileSize);
  }

  getColumnAt(left) {
    return Math.floor(left / (window as any)._tileSize);
  }

  getLastRow() {
    return (window as any)._verticalTiles - 1;
  }

  getLastColumn() {
    return (window as any)._horizontalTiles - 1;
  }

  getMatches() {
    var repeatedPieces = {};

    // Horizontal matches
    for (var row in this.pieces) {
      var previousColor = null;
      var repeatedColor = 1;

      for (let column in this.pieces[row]) {
        var current = this.pieces[row][column];

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
          repeatedPieces[row + ":" + (Number(column) - 1)] =
            this.pieces[row][Number(column) - 1];
          repeatedPieces[row + ":" + (Number(column) - 2)] =
            this.pieces[row][Number(column) - 2];
        }
      }
    }

    // Vertical matches
    for (var column = 0; column < this.width; column++) {
      var previousColor = null;
      var repeatedColor = 1;

      for (let row = 0; row < this.height; row++) {
        var current = this.pieces[row][column];

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
          repeatedPieces[row - 1 + ":" + column] = this.pieces[row - 1][column];
          repeatedPieces[row - 2 + ":" + column] = this.pieces[row - 2][column];
        }
      }
    }

    var pieces = [];

    for (var k in repeatedPieces) {
      pieces.push(repeatedPieces[k]);
    }

    return pieces;
  }

  hasEmptyCells() {
    var empty = 0;
    for (var column = 0; column < (window as any)._horizontalTiles; column++) {
      for (var row = 0; row < (window as any)._verticalTiles; row++) {
        if (this.pieces[row][column] == null) {
          empty++;
        }
      }
    }
    return empty;
  }

  dropPieces() {
    for (var column = 0; column < (window as any)._horizontalTiles; column++) {
      for (var row = (window as any)._verticalTiles - 1; row >= 0; row--) {
        var piece = this.pieces[row][column];

        if (piece == null) {
          // Firt row creates new pieces
          if (row == 0) {
            piece = new Piece(this.canvas, this, row, column);
            this.pieces[row][column] = piece;

            const doll = piece.getDoll();

            if (doll) {
              this.canvas.add(doll);
              doll.set("top", -(window as any)._tileSize);
            }
            piece.move(row, column);
          } else {
            var upper = this.getPiece(row - 1, column);

            if (upper) {
              upper.move(row, column);

              this.pieces[row - 1][column] = null;
              this.pieces[row][column] = upper;
            }
          }
        }
      }
    }
  }

  animateRemoveMatches() {
    var repeatedPieces = this.getMatches();

    var removedPieces = 0;

    for (var k in repeatedPieces) {
      repeatedPieces[k].animateDestroy();
      removedPieces++;
    }

    this.game.getPointer().sumDestroyedPieces(removedPieces);
    this.game.getPointer().update();

    // Drop pieces
    while (this.hasEmptyCells()) {
      this.dropPieces();
    }

    while (this.getMatches().length > 0) {
      this.animateRemoveMatches();
    }
  }

  removeMatches() {
    var repeatedPieces = this.getMatches();

    for (var k in repeatedPieces) {
      repeatedPieces[k].regenerate();
    }

    return repeatedPieces.length;
  }

  move(piece1: Piece, piece2: Piece, callback?: Function) {
    var oldRow = piece1.row;
    var oldColumn = piece1.column;

    var newRow = piece2.row;
    var newColumn = piece2.column;

    this.pieces[oldRow][oldColumn] = piece2;
    this.pieces[newRow][newColumn] = piece1;

    piece1.move(newRow, newColumn);
    piece2.move(oldRow, oldColumn, callback);
  }

  checkPosition(newRow, newColumn) {
    var firstRow = 0;
    var firstColumn = 0;
    var lastRow = this.getLastRow();
    var lastColumn = this.getLastColumn();

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
  }
}
