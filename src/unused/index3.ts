var iq = require("image-q");
var PIXI = require('pixi.js');
//var fabric = require("fabric");
import {fabric} from "fabric";
import { MonoSpaceColors } from "./monoscolor/monoscolor";
import { Manhattan } from "./rgbquant-alpha/manhattan";
//import * as GridSetup from "./grid";
import * as GridSetup2 from "./anotherdamntest";
//import * as ZoomSetup from "./fabrictest";
import * as ObjectSetup from "./fabricobjects";

import { LcdConfig } from "./lcdconfig/lcdconfig"

const ColorObjectByUint32 = MonoSpaceColors.ColorObjectByUint32();
const ColorObjectArray = MonoSpaceColors.ColorObjectArray();
if(ColorObjectByUint32["0"] == null) {
    throw "monospace-colors.json does not have 0 key";
}

fabric.Object.prototype.objectCaching = false;
fabric.Object.prototype.noScaleCache = false;
fabric.Object.prototype.statefullCache = false;

var html = LcdConfig.buildHTMLList();

document.getElementById('space-pixels-block-menu').innerHTML = html;

var pingers = LcdConfig.getLcdObject()["vanilla"].mods["vanilla"].blocks[2].image;
//Grid is 177 because stroke adds 1 pixel because why make anything consistent
const grid = 178;
const maxsize = 1300;
var canvas = new fabric.Canvas('c3', {
     selection: false,
     imageSmoothingEnabled: false,
     backgroundColor: "#ffffff",
     controlsAboveOverlay: true,
     perPixelTargetFind: true,
     stopContextMenu: true,
     noScaleCache: false,
     objectCaching: false,
     statefullCache: false
});
canvas.setZoom(0.8);

var threshold = grid * 0.05;
//GridSetup.gridstuff(canvas, 178, 178);
GridSetup2.gridstuff2(canvas, 179, 179);
//ZoomSetup.zoomstuff(canvas);


var path = fabric.loadSVGFromString(pingers,function(objects, options) {
  var obj = fabric.util.groupSVGElements(objects, options);
        obj.set({
            left: 200,
            top: 250,
            snapAngle:90,
            snapThreshold:45,
            strokeWidth: 0
        });
      
        obj.scaleToWidth(356);
        canvas.add(obj);
});

var path = fabric.loadSVGFromString(pingers,function(objects, options) {
  var obj = fabric.util.groupSVGElements(objects, options);
        obj.set({
            left: 200,
            top: 250,
            snapAngle:90,
            snapThreshold:45,
            strokeWidth: 0
        });
      
        obj.scaleToWidth(356);
        canvas.add(obj);
});
ObjectSetup.objectstuff(canvas);
function onKeyDownHandler(e) {
   switch (e.keyCode) {
      case 46: // delete

        if(canvas.getActiveObject())
        {
            canvas.remove(canvas.getActiveObject());
        }
   }
   e.preventDefault(); 
};

window.onkeydown = onKeyDownHandler;

var renderer = PIXI.autoDetectRenderer(1000, 800, {backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

var loader = PIXI.loader;

var stage = new PIXI.Container();

loader.add('bunny',"./src/test/bunny.png");
loader.add('newbunny',"./src/test/testcorner.png");
loader.once('complete', function( loader, resources) {

        
        var bunny = new PIXI.Sprite(resources['bunny'].texture);

        var newbunny = new PIXI.Sprite(resources['newbunny'].texture);

        var imgobj = new fabric.Object();

        var image = new fabric.Image(newbunny.texture.baseTexture.source, {
                            angle: 30,
                            opacity: 1.0
                        });


        renderer.resize(newbunny.width, newbunny.height);
/*
        var sourcedata = customGetImageData(newbunny.texture.baseTexture.source, newbunny.width);

        var SpaceEngineersPalette: Array<Array<number>> = [];

        for(let colorObject of ColorObjectArray)
        {
            SpaceEngineersPalette.push(colorObject.rgba);
        }

        const palette = new iq.utils.Palette();
        SpaceEngineersPalette.forEach(color => {
            palette.add(iq.utils.Point.createByQuadruplet(color))
        });

        var imagedata = customGetImageData(newbunny.texture.baseTexture.source, newbunny.width);

        const distance          = new iq.distance.EuclideanRgbQuantWithAlpha(),
          inPointContainer  = iq.utils.PointContainer.fromUint8Array(imagedata.buf8, newbunny.width, newbunny.height),
		  imager             = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.FloydSteinberg),
		  outPointContainer = imager.quantize(inPointContainer, palette);

        var supaimg = new ImageData(new Uint8ClampedArray(outPointContainer.toUint8Array().buffer), newbunny.width, newbunny.height);

        var canvas2 = document.createElement('canvas');
        var ctx2 = canvas2.getContext("2d");
        canvas2.width = newbunny.width;
        canvas2.height = newbunny.height;
        ctx2.putImageData(supaimg, 0, 0);

        var image = new PIXI.Texture.fromCanvas(canvas2);
        var imagesprite = new PIXI.Sprite(image);

        imagesprite.anchor.x = 0;
        imagesprite.anchor.y = 0;

        stage.addChild(imagesprite);

        renderer.render(stage);

        var shaderdata = customGetImageData(renderer.extract.pixels(stage), newbunny.width);

        var output = buildImageToString(shaderdata.buf32, shaderdata.width, shaderdata.height);

        var textarea = document.createElement('textarea');
        textarea.textContent = output;
        document.body.appendChild(textarea);
*/
        //animate();

});

loader.load();

function buildImageToString(image: Uint32Array, width: number, height: number)
{

    var charToPixelString: string = '';

    for (var y = 0; y < height; y++) {
        var lni = y * width;
        for (var x = 0; x !== width; x++) {

            //var char should be a pokemon. varchar
            charToPixelString += ColorObjectByUint32[image[lni + x]].ch;
            if(x+1 == width) {
                 charToPixelString += "\r\n";
            }
        }
    }

    return charToPixelString;
}



function typeOf(val) {
    return Object.prototype.toString.call(val).slice(8,-1);
}

// returns uniform pixel data from various img
function customGetImageData(img, width) {
    var can, ctx, imgd, buf8, buf32, height;

    switch (typeOf(img)) {
        case "HTMLImageElement":
            can = document.createElement("canvas");
            can.width = img.naturalWidth;
            can.height = img.naturalHeight;
            ctx = can.getContext("2d");
            ctx.drawImage(img,0,0);
        case "Canvas":
        case "HTMLCanvasElement":
            can = can || img;
            ctx = ctx || can.getContext("2d");
        case "CanvasRenderingContext2D":
            ctx = ctx || img;
            can = can || ctx.canvas;
            imgd = ctx.getImageData(0, 0, can.width, can.height);
        case "ImageData":
            imgd = imgd || img;
            width = imgd.width;
            if (typeOf(imgd.data) == "CanvasPixelArray")
                buf8 = new Uint8Array(imgd.data);
            else
                buf8 = imgd.data;
        case "Array":
        case "CanvasPixelArray":
            buf8 = buf8 || new Uint8Array(img);
        case "Uint8Array":
        case "Uint8ClampedArray":
            buf8 = buf8 || img;
            buf32 = new Uint32Array(buf8.buffer);
        case "Uint32Array":
            buf32 = buf32 || img;
            buf8 = buf8 || new Uint8Array(buf32.buffer);
            width = width || buf32.length;
            height = buf32.length / width;
    }

    return {
        can: can,
        ctx: ctx,
        imgd: imgd,
        buf8: buf8,
        buf32: buf32,
        width: width,
        height: height
    };
}


function animate() {
    requestAnimationFrame(animate);

    // just for fun, let's rotate mr rabbit a little
    //bunny.rotation += 0.1;

    // render the container
    renderer.render(stage);
}