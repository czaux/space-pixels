import { MonoSpaceColors } from "./monoscolor/monoscolor";
import Vue from 'vue';
import * as misc from "./misc";
import detectbrower from "detect-browser";
import filesaver from "file-saver";
let blobber = require('./canvas-toBlob');
let outputtemplate = require('raw-loader!./outputmenu.html');
let logosvg  = require('raw-loader!./logo.svg');
var iq = require("image-q");
let RgbQuant = require('./rgbquant/rgbquant');

//import { Palette } from "./dither/palette"
//import { EuclideanRgbQuantWithAlpha } from "./dither/euclidean"
//import { ErrorDiffusionDither } from "./dither/dither";


export function setup(canvas, lcdsvm) {

    const ColorObjectByUint32 = MonoSpaceColors.ColorObjectByUint32();
    const ColorObjectArray = MonoSpaceColors.ColorObjectArray();
    if(ColorObjectByUint32["0"] == null) {
        throw "monospace-colors.json does not have 0 key";
    }
/*
    let palette = new Palette();
    for(let colorObject of ColorObjectArray) {
        palette.add(colorObject.rgba);
    }
    console.log(palette);
*/
    var SpaceEngineersPalette = [];

    for(let colorObject of ColorObjectArray)
    {
        SpaceEngineersPalette.push(colorObject.rgba);
    }

    const palette2 = new iq.utils.Palette();
    SpaceEngineersPalette.forEach(color => {
        palette2.add(iq.utils.Point.createByQuadruplet(color))
    });





    function buildImageToString(image, width, height)
    {
        var charToPixelString = '';
        let newlinechar = "\r\n";
        //console.log(detectbrower.name);
        if(detectbrower.name == 'edge') newlinechar = "\n" ;
        for (var y = 0; y < height; y++) {
            var lni = y * width;
            for (var x = 0; x !== width; x++) {

                //var char should be a pokemon. varchar
                charToPixelString += ColorObjectByUint32[image[lni + x]].ch;
                if(x+1 == width) {
                    
                    charToPixelString += newlinechar;
                }
            }
        }

        return charToPixelString;
    }

    function getDitheredImage(callback) {
            
        let background = canvas.backgroundColor;
        let canvascontainer = document.getElementsByClassName('canvas-container-container')[0];
        let storescrolltop = canvascontainer.scrollTop;
        let storescrollleft = canvascontainer.scrollLeft;
        canvas.setBackgroundColor('', canvas.renderAll.bind(canvas));
        canvas.setZoom(1.0);
        lcdsvm.activeObject.background.set('visible', false);
        let datr = canvas.toDataURL({
            format: "png",
            multiplier: 1,
            left: lcdsvm.activeObject.bounds.left(true),
            top: lcdsvm.activeObject.bounds.top(true),
            width: lcdsvm.activeObject.bounds.width(true),
            height: lcdsvm.activeObject.bounds.height(true)
        });
        canvas.backgroundColor = background;
        canvas.setZoom(2.0);
        canvascontainer.scrollTop = storescrolltop;
        canvascontainer.scrollLeft = storescrollleft;
        lcdsvm.activeObject.background.set('visible', true);
        canvas.renderAll();

        let tempimg = new Image();
        let img = document.getElementById('asdf');
        tempimg.onload = () => {

            var imagedata = misc.customGetImageData(tempimg);

            /*
            let distance = new EuclideanRgbQuantWithAlpha();
            let imager = new ErrorDiffusionDither();
            let outer = imager.dither(imagedata.buf32, imagedata.width, imagedata.height, palette, distance);
            let supaimg = new ImageData(new Uint8ClampedArray(outer.buffer), imagedata.width, imagedata.height);
            */

           /*
            let distance = new iq.distance.Euclidean();
            let inPointContainer = iq.utils.PointContainer.fromUint8Array(imagedata.buf8, imagedata.width, imagedata.height);
            let imager = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.FloydSteinberg, true, 0, true);
            let outPointContainer = imager.quantize(inPointContainer, palette2);
            let supaimg = new ImageData(new Uint8ClampedArray(outPointContainer.toUint8Array().buffer), imagedata.width, imagedata.height);
*/

            let ditheroption = lcdsvm.ditherOption;
            var opts = {
                colors: 512,
                method: 2,
                initColors: 0,
                minHueCols: 8096,
                dithKern: "FloydSteinberg",
                dithSerp: false,
                palette: SpaceEngineersPalette
            };
            var quant = new RgbQuant(opts);
            quant.sample(tempimg);
            var img8 = quant.reduce(tempimg);
            let supaimg = new ImageData(new Uint8ClampedArray(img8.buffer), imagedata.width, imagedata.height);

            callback(supaimg);
        }

        tempimg.src = datr;


    }


    
    var vm = new Vue({
      el: ".outputbar-container",
      template: outputtemplate,
      data: {
        size: 'normal',
        iconPosition: 'left',
        logosrc: '',
        loading: false,
        menuOptions: null,
        layers: [],
        activePreview: null,
        processing: false,
        supaimg: null,
        output: null,
        showCopy: false,
        copystatus: "none"
      },
      methods: {
        downloadasfile: function(e) {
            if(!this.output) return;
            var blob = new Blob([this.output], {type: "text/plain;charset=utf-8"});
            filesaver.saveAs(blob, "chars.txt");
        },
        downloadimage: function(e) {
            let w = this.supaimg.width;
            let h = this.supaimg.height;
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            canvas.width = w;
            canvas.height = h;

            let imgData = ctx.createImageData(w, h);
            imgData.data.set(this.supaimg.data);
            ctx.putImageData(imgData, 0, 0);

            canvas.toBlob(function(blob) {
                filesaver.saveAs(blob, "render.png");
            });
        },
        handleblur: function(e) {
            if(this.processing == false)
            {
                let children = this.$refs.copydialogcontain.children;
                let matches = false;
                for(let childindex in children) {


                    if(children[childindex] == e.relatedTarget) matches = true;
                }
                if(e.relatedTarget == this.$refs.copydialogcontain) matches = true;

                if(!matches) {
                    this.showCopy = false;
                }
            }
            this.copystatus = "none";
        },
        copyoutput: function(e) {
            if(this.processing) return;
            this.processing = true;
            this.copystatus = "none";
            try {
                var temparea = document.createElement("textarea");
                temparea.style.overflow = "auto";
                temparea.style.wordWrap = "normal";
                temparea.style.whiteSpace = "pre-wrap";
                let orglength = this.output.length;
                temparea.textContent = this.output;
                document.body.appendChild(temparea);
                temparea.select();
                document.execCommand("copy");
                document.body.removeChild(temparea);
                e.target.focus();
                this.copystatus = "success"
            } catch(e) {
                this.copystatus = "fail"
            }

            this.processing = false;
        },
        removeActive: function() {
            canvas.remove(this.activePreview);
        },
        preview: function (data) {
            if(this.processing) return;
            this.processing = true;
            let active = canvas.getActiveObject();
            if(active) active.set('active', false);
            if(this.activePreview) this.removeActive();
           
            getDitheredImage((ditheredimage) => {
                
                var canvas2 = document.createElement('canvas');
                var ctx2 = canvas2.getContext("2d");
                canvas2.width = ditheredimage.width;
                canvas2.height = ditheredimage.height;
                ctx2.putImageData(ditheredimage, 0, 0);

                fabric.Image.fromURL(canvas2.toDataURL(), (imga) => {
                    imga.left = lcdsvm.activeObject.bounds.left(false);
                    imga.top = lcdsvm.activeObject.bounds.top(false);
                    imga.set({'selectable': false, evented:false});
                    this.activePreview = imga;
                    canvas.add(imga);
                    imga.bringToFront();
                    canvas2 = null;
                    canvas.renderAll();
                    this.processing = false;
                });
                
            });
            
            
        },
        generateoutput: function (dataer) {

            if(this.processing) return;
            this.output = null;
            this.supaimg = null;
            this.showCopy = false;
            this.processing = true;
            getDitheredImage((ditheredimage) => {
                let buffdata = misc.customGetImageData(ditheredimage, ditheredimage.width);
                var output = buildImageToString(buffdata.buf32, buffdata.width, buffdata.height);
                this.supaimg = ditheredimage;
                this.output = output;
                this.showCopy = true;
                this.processing = false;
            });
        }
      }
    });

    vm.logosrc = misc.encodeSVGToURI(logosvg);

    return vm;

  
}