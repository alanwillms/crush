import "./style.css";

import { fabric } from "fabric";
import Game from "./src/game";

window._tileSize = 48;
window._horizontalTiles = 15;
window._verticalTiles = 10;
window._pointerHeight = 60;
window._piecesImages = {};

fabric.Sprite = fabric.util.createClass(fabric.Image, {
  type: "sprite",

  spriteWidth: 50,
  spriteHeight: 72,
  spriteIndex: 0,

  initialize: function (element, options) {
    options || (options = {});

    options.width = this.spriteWidth;
    options.height = this.spriteHeight;

    this.callSuper("initialize", element, options);

    this.createTmpCanvas();
    this.createSpriteImages();
  },

  createTmpCanvas: function () {
    this.tmpCanvasEl = fabric.util.createCanvasElement();
    this.tmpCanvasEl.width = this.spriteWidth || this.width;
    this.tmpCanvasEl.height = this.spriteHeight || this.height;
  },

  createSpriteImages: function () {
    this.spriteImages = [];

    var steps = this._element.width / this.spriteWidth;
    for (var i = 0; i < steps; i++) {
      this.createSpriteImage(i);
    }
  },

  createSpriteImage: function (i) {
    var tmpCtx = this.tmpCanvasEl.getContext("2d");
    tmpCtx.clearRect(0, 0, this.tmpCanvasEl.width, this.tmpCanvasEl.height);
    tmpCtx.drawImage(this._element, -i * this.spriteWidth, 0);

    var dataURL = this.tmpCanvasEl.toDataURL("image/png");
    var tmpImg = fabric.util.createImage();

    tmpImg.src = dataURL;

    this.spriteImages.push(tmpImg);
  },

  _render: function (ctx) {
    ctx.drawImage(
      this.spriteImages[this.spriteIndex],
      -this.width / 2,
      -this.height / 2
    );
  },

  play: function () {
    var _this = this;
    this.animInterval = setInterval(function () {
      _this.onPlay && _this.onPlay();

      _this.spriteIndex++;
      if (_this.spriteIndex === _this.spriteImages.length) {
        _this.spriteIndex = 0;
      }
    }, 100);
  },

  stop: function () {
    clearInterval(this.animInterval);
  },
});

fabric.Sprite.fromURL = function (url, callback, imgOptions) {
  fabric.util.loadImage(url, function (img) {
    callback(new fabric.Sprite(img, imgOptions));
  });
};

fabric.Sprite.async = true;

const canvas = new fabric.Canvas("canvas", {
  hoverCursor: "pointer",
  selection: false,
  width: window._horizontalTiles * window._tileSize + 1,
  height: window._verticalTiles * window._tileSize + 1 + window._pointerHeight,
});

fabric.Image.fromURL("pieces/01.png", function (sprite) {
  window._piecesImages[1] = sprite.getElement();

  fabric.Image.fromURL("pieces/02.png", function (sprite) {
    window._piecesImages[2] = sprite.getElement();

    fabric.Image.fromURL("pieces/03.png", function (sprite) {
      window._piecesImages[3] = sprite.getElement();

      fabric.Image.fromURL("pieces/04.png", function (sprite) {
        window._piecesImages[4] = sprite.getElement();

        fabric.Image.fromURL("pieces/05.png", function (sprite) {
          window._piecesImages[5] = sprite.getElement();

          fabric.Image.fromURL("pieces/06.png", function (sprite) {
            window._piecesImages[6] = sprite.getElement();

            new Game(canvas);
          });
        });
      });
    });
  });
});
