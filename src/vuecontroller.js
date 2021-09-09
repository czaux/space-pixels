import Vue from 'vue';
import draggable from 'vuedraggable';
import lodash from "lodash";
var layerstemplate = require('raw-loader!./layersmenu.html');
import RangeSlider from 'vue-range-slider';
import { fabric } from "./fabric";

fabric.Image.filters.Luminosity = fabric.util.createClass(fabric.Image.filters.BaseFilter, /** @lends fabric.Image.filters.Luminosity.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Luminosity',

    /**
     * Constructor
     * @memberOf fabric.Image.filters.Brightness.prototype
     * @param {Object} [options] Options object
     * @param {Number} [options.brightness=0] Value to brighten the image up (-255..255)
     */
    initialize: function(options) {
      options = options || { };
      this.brightness = options.brightness || 0;
    },

    /**
     * Applies filter to canvas element
     * @memberOf fabric.Image.filters.Grayscale.prototype
     * @param {Object} canvasEl Canvas element to apply filter to
     */
    applyTo: function(canvasEl) {
      var context = canvasEl.getContext('2d'),
          imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
          data = imageData.data,
          brightness = this.brightness;

      for (var i = 0, len = data.length; i < len; i += 4) {
        data[i] += brightness;
        data[i + 1] += brightness;
        data[i + 2] += brightness;
      }

      context.putImageData(imageData, 0, 0);
    },
    /**
     * Returns object representation of an instance
     * @return {Object} Object representation of an instance
     */
    toObject: function() {
      return extend(this.callSuper('toObject'), {
        brightness: this.brightness
      });
    }
});


export function initialize(canvas) {



  let filteres = fabric.Image.filters;

  var vm = new Vue({
    el: ".layers-parent-container-container",
    template: layerstemplate,
    data: {
      layers: [],
      brightnessValue: 100,
      contrastValue: 0,
      whiteValueThres: 0,
      whiteValueDist: 0
    },
    components: {
      'draggable': draggable,
      'range-slider': RangeSlider
    },
    watch: {
      brightnessValue: lodash.debounce((function(oldval, newval) {
        let object = canvas.getActiveObject();
        if(object)
        {
         object.filters[1] = new filteres.Luminosity({
            brightness: parseInt(newval, 10)
          });
          
         object.applyFilters(canvas.renderAll.bind(canvas));
        }
      }), 10),
      contrastValue: lodash.debounce((function(oldval, newval) {
        let object = canvas.getActiveObject();
        if(object)
        {
         object.filters[2] = new filteres.Contrast({
            contrast: parseInt(newval, 10)
          });
          
         object.applyFilters(canvas.renderAll.bind(canvas));
        }
      }), 10),
      whiteValueThres: lodash.debounce((function(oldval, newval) {
        let object = canvas.getActiveObject();
        if(object)
        {
         object.filters[3] = new filteres.RemoveWhite({
           threshold: parseInt(newval, 10),
            distance: this.whiteValueDist
          });
          
         object.applyFilters(canvas.renderAll.bind(canvas));
        }
      }), 10),
      whiteValueDist: lodash.debounce((function(oldval, newval) {
        let object = canvas.getActiveObject();
        if(object)
        {
         object.filters[3] = new filteres.RemoveWhite({
           threshold: this.whiteValueThres,
            distance: parseInt(newval, 10)
          });
          
         object.applyFilters(canvas.renderAll.bind(canvas));
        }
      }), 10)
    },
    methods: {
        add: function(object) {
          this.layers.unshift(object);
            
          this.updateOrder();
        },
        remove: function(object) {
          this.layers.splice(this.layers.indexOf(object), 1);
          this.updateOrder();
        },
        updateOrder: function() {
            let lcd;
            let lcdbackground;
            let lcdoverlay;
            let objects = canvas.getObjects();
            let objectsinverse = objects.reverse();
            for(let index in objectsinverse)
            {
              let object = objectsinverse[index];
              let type = object.get('type');
              if(type == 'lcdbackground') lcdbackground = object;
              if(type == 'lcdgroup')      lcd = object;
              if(type == 'lcdoverlay')    lcdoverlay = object;
            }

            if(!lcd || !lcdbackground || !lcdoverlay) {
              throw new Error("missing vital screen parts");
            }

            let startindex = objectsinverse.indexOf(lcdbackground);
            startindex++;
            let layersinverse = this.layers.slice().reverse();
            for(let index in layersinverse) {
              layersinverse[index].object.moveTo(index + startindex);
            }
              //canvas.setActiveObject(object.object);
            //canvas.setActiveObject(layersinverse[0].object);
            //this.brightnessValue = 50;
            lcdoverlay.bringToFront();
            lcd.bringToFront();
            

        },
        onSort: function(evt) {
            this.updateOrder();
           
        },
        removeLayer: function(item) {
          //Canvas remove event will take it out of our layers for us
          canvas.remove(item.object);
        },
        showHideLayer: function(item) {
          //Inverse visibility and clear selection, force re-render
          item.object.visible = !item.object.visible;
          item.visible = item.object.visible;
          item.highlight = false;
          canvas.deactivateAll().renderAll();
        },
        setLayerHighlight: function(item, dohighlight) {
          if(item.visible) {
            item.highlight = dohighlight;
            canvas.setActiveObject(item.object);
          }
        }
    },

  });




  return vm;

}