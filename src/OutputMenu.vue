<template>
    <div id="output-menu">
        <div class="outputbar-container">
            <div class="outputbar">
                <ul>
                    <li class="outputbarlogo-contain" style="flex-grow:1;">
                        <img class="outputbarlogo" :src="logosrc"/>
                    </li>
                    <li  class="outputbar-outputitem">
                        <button class="previewbtn" @click="preview">Preview</button>
                    </li>
                    <li style="flex-grow:1;" class="outputbar-outputitem">
                        <button class="generateimagebtn" ref="outputmenubut"  @blur="handleblur" @click="generateoutput" >
                            Generate Image
                        </button>

                        <a class="outputdialog" ref="copydialogcontain" @blur="handleblur" v-show="showCopy">
                            <button tabindex="-1" @click="copyoutput" @blur="handleblur"  ref="focuser" class="copytoboard">Copy to Clipboard</button>
                            <div class="statustexter copysucces" v-show="copystatus == 'success'"style="color:#62ff62;">Copying Success!</div>
                            <div class="statustexter copyfail" v-show="copystatus == 'failed'" style="color:#ff2c2c;">Copying Failed!</div>
                            <button tabindex="-1" @click="downloadimage" @blur="handleblur" class="normalboardbtn">Download as .png</button>
                            <button tabindex="-1" @click="downloadasfile" @blur="handleblur" class="normalboardbtn">Download as .txt</button>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>

</template>

<script>

  import { MonoSpaceColors } from "./monoscolor/monoscolor";
  //import Vue from 'vue';
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

      export default {
        //el: ".outputbar-container",
        name: 'OutputMenu',
        data () {
            return {
                size: 'normal',
                iconPosition: 'left',
                logosrc: '',
                loading: false,
                menuOptions: null,
                showCopy: false,
                copystatus: "none"
            }
        },
        methods: {
          downloadasfile: function(e) {
              if(!this.$store.state.outputImgText) return;
              var blob = new Blob([this.$store.state.outputImgText], {type: "text/plain;charset=utf-8"});
              filesaver.saveAs(blob, "chars.txt");
          },
          downloadimage: function(e) {
              let w = this.supaimg.width;
              let h = this.supaimg.height;
              let canvase = document.createElement('canvas');
              let ctx = canvase.getContext('2d');
              canvase.width = w;
              canvase.height = h;

              let imgData = ctx.createImageData(w, h);
              imgData.data.set(this.supaimg.data);
              ctx.putImageData(imgData, 0, 0);

              canvase.toBlob(function(blob) {
                  filesaver.saveAs(blob, "render.png");
              });
          },
          handleblur: function(e) {
              if(!this.$store.state.processingImage)
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
              if(this.$store.state.processingImage) return;
              this.$store.store.commit('setProcessState', true);
              this.copystatus = "none";
              try {
                  var temparea = document.createElement("textarea");
                  temparea.style.overflow = "auto";
                  temparea.style.wordWrap = "normal";
                  temparea.style.whiteSpace = "pre-wrap";
                  let orglength = this.$store.state.outputImgText.length;
                  temparea.textContent = this.$store.state.outputImgText;
                  document.body.appendChild(temparea);
                  temparea.select();
                  document.execCommand("copy");
                  document.body.removeChild(temparea);
                  e.target.focus();
                  this.copystatus = "success"
              } catch(e) {
                  this.copystatus = "fail"
              }

              store.commit('setProcessState', false);
          },
          preview: function (data) {
              if(this.$store.state.processingImage) return;
              this.$store.commit('setProcessState', true);
              let active = this.$store.state.canvas.getActiveObject();
              if(active) active.set('active', false);
              if(this.activePreview) store.commit('removeActivePreview');
            
              this.getDitheredImage((ditheredimage) => {
                var canvas2 = document.createElement('canvas');
                var ctx2 = canvas2.getContext("2d");
                canvas2.width = ditheredimage.width;
                canvas2.height = ditheredimage.height;
                ctx2.putImageData(ditheredimage, 0, 0);

                fabric.Image.fromURL(canvas2.toDataURL(), (imga) => {
                    imga.left = lcdsvm.activeObject.bounds.left(false);
                    imga.top = lcdsvm.activeObject.bounds.top(false);
                    imga.set({'selectable': false, evented:false});
                    this.$store.commit('addActivePreview', { imga });
                    this.$store.commit('setProcessState', false);
                });
              });
              
          },
          generateoutput: function (dataer) {
              if(this.$store.state.processingImage) return;
              this.$store.store.commit('setProcessState', true);
              this.$store.store.commit('setOutputImgData', null);
              this.$store.store.commit('setOutputImgText', null);
              this.showCopy = false;
              this.getDitheredImage((ditheredimage) => {
                  let buffdata = misc.customGetImageData(ditheredimage, ditheredimage.width);
                  var output = this.buildImageToString(buffdata.buf32, buffdata.width, buffdata.height);
                  store.commit('setoutputImgData', ditheredimage);
                  store.commit('setOutputImgText', output);
                  this.showCopy = true;
                  store.commit('setProcessState', false);
              });
          },
        buildImageToString: function(image, width, height)
        {
            var charToPixelString = '';
            let newlinechar = "\r\n";
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
        },
          getDitheredImage: function (callback) {
                if(!this.$store.state.activeLCD) {
                    throw new Error("No active LCD!");
                }

                let background = this.$store.state.canvas.backgroundColor;
                let canvascontainer = document.getElementsByClassName('canvas-container-container')[0];
                let storescrolltop = canvascontainer.scrollTop;
                let storescrollleft = canvascontainer.scrollLeft;
                this.$store.state.canvas.setBackgroundColor('', this.$store.state.canvas.renderAll.bind(this.$store.state.canvas));
                this.$store.state.canvas.setZoom(1.0);
                console.log(this.$store.state.activeLCD);
                this.$store.state.activeLCD.background.set('visible', false);
                //lcdsvm.activeObject.background.set('visible', false);
                let datr = this.$store.state.canvas.toDataURL({
                    format: "png",
                    multiplier: 1,
                    left: lcdsvm.activeObject.bounds.left(true),
                    top: lcdsvm.activeObject.bounds.top(true),
                    width: lcdsvm.activeObject.bounds.width(true),
                    height: lcdsvm.activeObject.bounds.height(true)
                });
                this.$store.state.canvas.backgroundColor = background;
                this.$store.state.canvas.setZoom(2.0);
                canvascontainer.scrollTop = storescrolltop;
                canvascontainer.scrollLeft = storescrollleft;
                lcdsvm.activeObject.background.set('visible', true);
                this.$store.state.canvas.renderAll();

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
        }
      }

      //vm.logosrc = misc.encodeSVGToURI(logosvg);



</script>

<style>
</style>