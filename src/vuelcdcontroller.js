import Vue from 'vue';
import * as misc from './misc';
let lcdmenutemplate = require('raw-loader!./lcdmenu.html');

export function initialize(fabric, canvas) {

  let vm = new Vue({
    el: ".lcdmenu-parent-container",
    template: lcdmenutemplate,
    data: {
      lcds: [],
      activeObject: null,
      overlay: null,
      picked: null
    },
    watch: {
        'picked': function(val, oldval) {
            this.updateActiveLCD(val);
        }
    },
    methods:{
        addSVGAsString: function(svgstring, setasactive = false) {
            let svgObject = fabric.loadSVGFromString(svgstring, (objects, options) => {
                let screenboundsobject;
                let restofobject = [];
                let screenbounds;
                let screenframe = [];
                let screenbackground;
                //iterate over layers in the svg
                for(let index in objects) {
                    if(objects[index].id) {
                        let SFSep = objects[index].id.split('SF-');
                        if(SFSep.length == 2) {
                            screenframe.push(objects[index]);
                            continue;
                        }
                        if(/(ScreenBounds)/i.test(objects[index].id)) {
                            screenframe.push(objects[index]);
                            screenbounds = [objects[index]];
                            continue;
                        }
                        if (/(ScreenBackground)/i.test(objects[index].id)) {
                            screenbackground = [objects[index]];
                            continue;
                        }
                    }
                    restofobject.push(objects[index]);
                }

                if(screenbounds.length < 0
                && screenframe.length < 0
                && screenbackground.length < 0) {
                    throw new Error("SVG Does not have screenbounds ID!");
                }

                let background = fabric.util.groupSVGElements(screenbackground, options);
                let lcdbackground = new fabric.lcdbackground([background], {
                    left: 400, top: 390,
                    hasControls: false, hasBorders: false,
                    hasRotatingPoint: false, selectable:false,
                    lockMovementX: true, lockMovementY: true,
                    hoverCursor: "default", evented:false,
                    perPixelTargetFind:true, strokeWidth: 0
                });

                let lcd = fabric.util.groupSVGElements(screenframe, options);
                let LCDGroup = new fabric.lcdgroup([lcd], {
                    left: 400, top: 390,
                    hasControls: false, hasBorders: false,
                    hasRotatingPoint: false, selectable:false,
                    lockMovementX: true, lockMovementY: true,
                    hoverCursor: "default", evented:false,
                    perPixelTargetFind:true, strokeWidth: 0
                });

                //misc.getInnerElementCoordsNoIter(LCDGroup, screenbounds)
                //console.log(JSON.parse(JSON.stringify(LCDGroup)));

                let subobject = new misc.SubObjectPosition(LCDGroup, 'ScreenBounds');

                //Get coords of screenbounds
                let screenboundCoords = misc.getInnerElementCoords(canvas, LCDGroup, 'ScreenBounds');
                //console.log(screenboundCoords);
                let object = {active: false, lcdgroup: LCDGroup, background: lcdbackground, bounds: subobject, imgsrc: misc.encodeSVGToURI(svgstring)}

                this.lcds.unshift(object);
                
                //set default active
                if(setasactive) this.picked = object;
          });

        },
        remove: function(object) {
          this.lcds.splice(this.lcds.indexOf(object), 1);
        },
        updateActiveLCD: function(object) {
            if(this.activeObject) {
                canvas.remove(this.activeObject.lcdgroup);
                canvas.remove(this.activeObject.background);
                this.activeObject.active = false;
            }
            
            canvas.add(object.lcdgroup);
            canvas.add(object.background);
            this.activeObject = object;
            object.active = true;
            canvas.sendToBack(object.background);
            canvas.bringToFront(object.lcdgroup);

            this.updateOverlay(object.lcdgroup);

        },
        updateOverlay: function(lcdobject) {
            let newcoords = misc.getInnerElementCoords(canvas, lcdobject, "ScreenBounds");
            let overlaycoords = misc.getOuterPolygonCoords(canvas, lcdobject, "ScreenBounds");

            var overlayObject = new fabric.lcdoverlay(overlaycoords, {
                left: 0, top: 0,
                fill: 'black', fillRule: 'evenodd',
                hasControls: false, hasBorders: false, hasRotatingPoint: false,
                lockMovementX: true, lockMovementY: true, lockRotation:true,
                statefullcache:true, hoverCursor: "default", selectable: false,
                opacity:0.6, evented:false, perPixelTargetFind:true, strokeWidth: 0
            });

            if(this.overlay) canvas.remove(this.overlay);
            this.overlay = overlayObject;
            canvas.add(overlayObject);

            canvas.bringToFront(overlayObject);
            canvas.sendBackwards(overlayObject);
        }

    },

  });




  return vm;

}