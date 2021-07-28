import { fabric } from "fabric";
import Piece from "./piece";
import Game from "./game";

const transpose = (matrix) =>
  matrix.reduce(($, row) => row.map((_, i) => [...($[i] || []), row[i]]), []);

const toColor = (board) => {
  console.log(
    board
      .map((row) =>
        row
          .map((piece) => piece?.type || "x")
          .join("")
          .replace(/1/g, "🟦")
          .replace(/2/g, "🟪")
          .replace(/3/g, "🟩")
          .replace(/4/g, "🟨")
          .replace(/5/g, "🟥")
          .replace(/6/g, "🟧")
          .replace(/x/g, "⬛️")
      )
      .join("\n")
  );
};

export default class Board {
  pieces: Piece[][];
  private locked = false;

  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly game: Game,
    private readonly width: number,
    private readonly height: number,
    public readonly tileSize: number
  ) {
    this.fillBoard();

    while (this.hasMatches()) {
      this.removeMatches();
    }
  }

  isLocked() {
    return this.locked;
  }

  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }

  private fillBoard() {
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

  hasMatches() {
    return this.getMatches().length > 0;
  }

  async dropPieces() {
    const animations = [];
    const updatedBoard = [];

    this.pieces.forEach((rowData, row) => {
      updatedBoard.push([]);
      rowData.forEach((piece, column) => {
        updatedBoard[row][column] = piece;
      });
    });

    const transposed = transpose(updatedBoard).map((row) =>
      row.filter((value) => value !== null && value !== undefined)
    );

    console.log("original");
    toColor(updatedBoard);

    console.log("transposed");
    toColor(transposed);

    for (const row in transposed) {
      const transposedRow = transposed[row];
      while (transposedRow.length < (window as any)._verticalTiles) {
        // here row acts as column, because of transposition
        const piece = new Piece(this.canvas, this, -1, row as any);
        const doll = piece.getDoll();
        this.canvas.add(doll);
        doll.set(
          "top",
          -1 *
            (window as any)._tileSize *
            ((window as any)._verticalTiles - transposedRow.length + 1)
        );
        (transposedRow as Piece[]).unshift(piece);
      }
    }

    const untransposed = transpose(transposed);
    console.log("untransposed");
    toColor(untransposed);

    const movements = {};

    untransposed.forEach((data, row) => {
      data.forEach((piece, column) => {
        if (piece.row != row || piece.column != column) {
          movements[piece.id] = [piece, row, column];
        }
      });
    });

    toColor(updatedBoard);

    // Animations
    for (const [key, value] of Object.entries(movements)) {
      const [piece, row, column] = value as any;
      animations.push(piece.move(row, column));
    }

    await Promise.all(animations);

    for (const [key, value] of Object.entries(movements)) {
      const [piece, row, column] = value as any;
      updatedBoard[row][column] = piece;
    }

    updatedBoard.forEach((rowData, row) => {
      rowData.forEach((piece, column) => {
        this.pieces[row][column] = piece;
      });
    });
  }

  async animateRemoveMatches() {
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
      await this.dropPieces();
    }

    while (this.hasMatches()) {
      await this.animateRemoveMatches();
    }
  }

  removeMatches() {
    var repeatedPieces = this.getMatches();

    for (var k in repeatedPieces) {
      repeatedPieces[k].regenerate();
    }

    return repeatedPieces.length;
  }

  async swap(piece1: Piece, piece2: Piece) {
    var oldRow = piece1.row;
    var oldColumn = piece1.column;

    var newRow = piece2.row;
    var newColumn = piece2.column;

    this.pieces[oldRow][oldColumn] = piece2;
    this.pieces[newRow][newColumn] = piece1;

    await Promise.all([
      piece1.move(newRow, newColumn),
      piece2.move(oldRow, oldColumn),
    ]);
  }

  isInsideBoard(newRow, newColumn) {
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
