var Piece = function (canvas, _board, _row, _column) {
  var self = this;

  var types = {
    1: "pieces/01.png",
    2: "pieces/02.png",
    3: "pieces/03.png",
    4: "pieces/04.png",
    5: "pieces/05.png",
    6: "pieces/06.png",
  };

  this.type = Math.floor(Math.random() * 6) + 1;

  var color = (this.color = types[this.type]);
  var board = _board;

  this.row = _row;
  this.column = _column;
  this.locked = false;

  self.doll = new fabric.Image(window._piecesImages[self.type], {
    top: self.row * board.tileSize + 1,
    left: self.column * board.tileSize + 1,
    selectable: false,
  });

  this.getRow = function () {
    return self.row;
  };

  this.getColumn = function () {
    return self.column;
  };

  this.move = function (newRow, newColumn, callback) {
    self.getDoll().bringToFront();
    self.row = newRow;
    self.column = newColumn;

    self.getDoll().animate(
      {
        left: 1 + newColumn * window._tileSize,
        top: 1 + newRow * window._tileSize,
      },
      {
        duration: 250,
        onChange: canvas.renderAll.bind(canvas),
        onComplete: callback,
      }
    );
  };

  this.getDoll = function () {
    return self.doll;
  };

  this.getUpperPiece = function () {
    return board.getPiece(self.row - 1, self.column);
  };

  this.regenerate = () => {
    // Remove image
    canvas.remove(self.doll);

    // Create new piece
    var piece = new Piece(canvas, board, self.row, self.column);
    board.pieces[self.row][self.column] = piece;
    canvas.add(piece.getDoll());
  };

  this.animateDestroy = () => {
    // @TODO play sound and explosion animation
    // Remove image
    canvas.remove(self.doll);

    board.pieces[self.row][self.column] = null;
  };
};

export default Piece;
