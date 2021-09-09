var PIXI = require('pixi.js');
var RgbQuant = require("./WebGLDither/RgbQuant");


var renderer = PIXI.autoDetectRenderer(1000, 800,{backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

var loader = PIXI.loader; // pixi exposes a premade instance for you to use.

// create the root of the scene graph
var stage = new PIXI.Container();

// create a texture from an image path
//var texture = PIXI.Texture.fromImage('bunny.png');

// create a new Sprite using the texture
//var bunny = new PIXI.Sprite(texture);


loader.add('bunny',"bunny.png");
loader.add('newbunny',"test4.png");
loader.once('complete', function( loader, resources) {

    var bunny = new PIXI.Sprite(resources['bunny'].texture);

    var newbunny = new PIXI.Sprite(resources['newbunny'].texture);

    // center the sprite's anchor point
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;

    //Source image data
    var sourcedata = customGetImageData(newbunny.texture.baseTexture.source);

    /*var canv = document.createElement('canvas');
     canv.width = newbunny.width;
     canv.height = newbunny.height;
     var ctx = canv.getContext('2d');
     var supaimg2 = new ImageData(new Uint8ClampedArray(sourcedata.buf8.buffer), newbunny.width, newbunny.height);
     ctx.putImageData(supaimg2, 0, 0);
     document.body.prepend(canv);
     */

    var renderer2 = PIXI.autoDetectRenderer(2000, 1400);

    bunny.position.x = 200;
    bunny.position.y = 150;

    stage.addChild(bunny);

    var QuantizeFilter = require('./filters/quantize/QuantizeFilter');
    var SEColors = require('./SpaceEngineers512Colors');
    var colors = SEColors();
    var filter = new QuantizeFilter(colors);



    newbunny.filters = [filter];
    var buffercontainer = new PIXI.Container();


    buffercontainer.addChild(newbunny);
    renderer2.render(buffercontainer);


    var shaderdata = customGetImageData(renderer2.extract.pixels(buffercontainer));



    //This variable took 8 hours to make. Pass by reference is a thing for arrays in JS. Apparently.
    var tempsourcedata = new Uint32Array(sourcedata.buf32);
    var tempshaderdata = new Uint32Array(shaderdata.buf32);


    var testingthisfuckingthing = document.createElement('canvas');
    testingthisfuckingthing.width = newbunny.width;
    testingthisfuckingthing.height = newbunny.height;
    var context3 = testingthisfuckingthing.getContext('2d');
    var supaimg4 = new ImageData(new Uint8ClampedArray(shaderdata.buf8.buffer), newbunny.width, newbunny.height);
    context3.putImageData(supaimg4, 0, 0);
    document.body.prepend(testingthisfuckingthing);

    var q = new RgbQuant({
        canvas: context3,
        colors:512,
        palette: colors,
        reIndex: true,
        dithKern: "FloydSteinberg",
        useCache: false
    });

    var t0 = performance.now();


    q.sample(newbunny.texture.baseTexture.source);
    var reduced = q.reduce(newbunny.texture.baseTexture.source);

    var t1 = performance.now();
    console.log("Dither Time: " + (t1 - t0) + "m/s.");

    //var buff = glthing2.dither(tempsourcedata, tempshaderdata, newbunny.width, newbunny.height);

    //var glthing = new WebGLDither();
    //var buff = glthing.dither(tempsourcedata, tempshaderdata, newbunny.width, newbunny.height);

    //var quant = new RgbQuant();
    //quant.sample(renderer2.extract.pixels(buffercontainer));
    //var buff = quant.reduce(renderer2.extract.pixels(buffercontainer), shaderdata.buf32, 1,  "FloydSteinberg", false);

    //var newgldither = new WebGLDither();
    //var buff = newgldither.dither(sourcedata, shaderdata);

    //var buff = sDither(sourcedata, shaderdata);

    var canv2 = document.createElement('canvas');
    canv2.width = newbunny.width;
    canv2.height = newbunny.height;
    var ctx3 = canv2.getContext('2d');
    var supaimg3 = new ImageData(new Uint8ClampedArray(reduced.buffer), newbunny.width, newbunny.height);
    ctx3.putImageData(supaimg3, 0, 0);
    document.body.prepend(canv2);
    
    //console.log("Quantize time:" + (t1 - t0) + "m/s");
    //console.log("Dither time:" + (t33 - t22) + "m/s");
    //console.log(buff);

    /*asdfasdfsdfdfdfdfASASDSDDASDDASDADADASDDDASDASDDASDASDDASSASDASDDAS
     var supaimg = new ImageData(new Uint8ClampedArray(reduced.buffer), newbunny.width, newbunny.height);

     var canvas2 = document.createElement('canvas');
     var ctx2 = canvas2.getContext("2d");
     canvas2.width = newbunny.width;
     canvas2.height = newbunny.height;
     ctx2.putImageData(supaimg, 0, 0);
     document.body.appendChild(canvas2);

     var image = new PIXI.Texture.fromCanvas(canvas2);
     var imagesprite = new PIXI.Sprite(image);

     stage.addChild(imagesprite);

     renderer.render(stage);
     */
    //animate();

});

loader.load();


function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

//Not used yet
function isBigEndian() {
    let arrayBuffer = new ArrayBuffer(2);
    let uint8Array = new Uint8Array(arrayBuffer);
    let uint16array = new Uint16Array(arrayBuffer);
    uint8Array[0] = 0xAA; // set first byte
    uint8Array[1] = 0xBB; // set second byte
    if(uint16array[0] === 0xBBAA) return false;
    if(uint16array[0] === 0xAABB) return true;
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
        height: height,
    };
}

/*
 function sDither(data, quantize)
 {
 var kernels = {
 FloydSteinberg: [
 [7 / 16, 1, 0],
 [3 / 16, -1, 1],
 [5 / 16, 0, 1],
 [1 / 16, 1, 1]
 ]
 };

 var ds = kernels["FloydSteinberg"];

 var buf32 = data.buf32,
 width = data.width,
 height = data.height,
 len = buf32.length;

 var serpentine = false;

 var dir = serpentine ? -1 : 1;

 for (var y = 0; y < height; y++) {
 if (serpentine)
 dir = dir * -1;

 var lni = y * width;

 for (var x = (dir == 1 ? 0 : width - 1), xend = (dir == 1 ? width : 0); x !== xend; x += dir) {
 // Image pixel
 var idx = lni + x,
 i32 = buf32[idx],
 r1 = (i32 & 0xff),
 g1 = (i32 & 0xff00) >> 8,
 b1 = (i32 & 0xff0000) >> 16;

 // Reduced pixel
 var i32x = quantize.buf32[idx],
 r2 = (i32x & 0xff),
 g2 = (i32x & 0xff00) >> 8,
 b2 = (i32x & 0xff0000) >> 16;

 buf32[idx] =
 (255 << 24)	|	// alpha
 (b2  << 16)	|	// blue
 (g2  <<  8)	|	// green
 r2;

 // dithering strength
 //if (this.dithDelta) {
 //   var dist = this.colorDist([r1, g1, b1], [r2, g2, b2]);
 //  if (dist < this.dithDelta)
 //       continue;
 //}

 // Component distance
 var er = r1 - r2,
 eg = g1 - g2,
 eb = b1 - b2;

 for (var i = (dir == 1 ? 0 : ds.length - 1), end = (dir == 1 ? ds.length : 0); i !== end; i += dir) {

 //console.log(end);
 var x1 = ds[i][1] * dir,
 y1 = ds[i][2];

 var lni2 = y1 * width;

 if (x1 + x >= 0 && x1 + x < width && y1 + y >= 0 && y1 + y < height) {

 var d = ds[i][0];
 var idx2 = idx + (lni2 + x1);

 var r3 = (buf32[idx2] & 0xff),
 g3 = (buf32[idx2] & 0xff00) >> 8,
 b3 = (buf32[idx2] & 0xff0000) >> 16;

 var r4 = Math.max(0, Math.min(255, r3 + er * d)),
 g4 = Math.max(0, Math.min(255, g3 + eg * d)),
 b4 = Math.max(0, Math.min(255, b3 + eb * d));

 buf32[idx2] =
 (255 << 24)	|	// alpha
 (b4  << 16)	|	// blue
 (g4  <<  8)	|	// green
 r4;			// red
 }
 }
 }
 }

 return buf32;
 }
 */

function animate() {
    requestAnimationFrame(animate);

    // just for fun, let's rotate mr rabbit a little
    bunny.rotation += 0.1;

    // render the container
    renderer.render(stage);
}