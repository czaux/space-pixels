let css2  = require('./css/imagemenu.css');
let css3  = require('./css/style.css');
let css4  = require('./css/lcdmenu.css');
let css5  = require('./css/layersmenu.css');
let css6  = require('./css/outputmenu.css');
let css7  = require('./css/range-slider.css');

var Vue = require('vue');
let Vuex = require('vuex');
let fabric = require('./fabricwrapper.js');
console.log(fabric);
import * as lodash from 'lodash';
import { Manhattan } from "./rgbquant-alpha/manhattan";
import * as misc from "./misc";
import * as layermanagerUI from "./layermanager-UI";
import * as inputhandler from "./inputhandler";
import * as vuelcdcontroller from "./vuelcdcontroller";
import { LCDSnapping } from "./snapping";
import { SubObjectPosition } from "./soposition";

let MoveMenu = require('./MoveMenu.vue').default;
let OutputMenu = require('./OutputMenu.vue').default;

interface LCDLayerObject {
    active?: boolean; //if this lcd object is active;
    lcdgroup?: any, //lcd frame group in fabricjs object  
    background?: any, //lcd background layer in fabricjs object
    bounds?: SubObjectPosition, //by-reference getter of position values.
    imgsrc?: string; //base64 URI of image
}

interface CanvasLayerObject {
    url?: string; //base64 URI of image
    filename?: string; //name of file layer is from
    object?: any; //fabricjs object of image
    highlight?: false; //if layer is highlighted in UI
    visible?:true; //if layer is visible on canvas
}

let canvas:any = new fabric.Canvas('c3', {
    imageSmoothingEnabled: false,
    backgroundColor: "#ffffff",
    preserveObjectStacking: true,
    controlsAboveOverlay: true,
    perPixelTargetFind: true,
    stopContextMenu: true,
    selection: false,
});

canvas.setZoom(2.0);

window['scanvas'] = canvas;

Vue.use(Vuex);

interface LCDLayerObject {
    active?: boolean; //if this lcd object is active;
    lcdgroup?: any, //lcd frame group in fabricjs object  
    background?: any, //lcd background layer in fabricjs object
    bounds?: SubObjectPosition, //by-reference getter of position values.
    imgsrc?: string; //base64 URI of image
}

interface CanvasLayerObject {
    url?: string; //base64 URI of image
    filename?: string; //name of file layer is from
    object?: any; //fabricjs object of image
    highlight?: false; //if layer is highlighted in UI
    visible?:true; //if layer is visible on canvas
}

const debug = process.env.NODE_ENV !== 'production';

const store = new Vuex.Store({
  state: {
    canvas: canvas,
    activeLCD: null,
    activeLayer: null,
    activePreview: null,
    overlay: null,
    imageLayersList: null,
    lcdsList: null,
    outputImgData: null,
    outputImgText: "",
    processingImage: false,
  },
  mutations: {
    addToLayers (state, object:CanvasLayerObject) {
        state.canvas.add(object.object);
        state.imageLayersList.unshift(object);
    },
    removeFromLayers (state, object:CanvasLayerObject) {
        state.canvas.remove(object.object);
        state.imageLayersList.splice(state.imageLayersList.indexOf(object), 1);
    },


    addActivePreview(state, object) {
        state.activePreview = object;
        state.canvas.add(object);
        object.bringToFront();
        state.canvas.renderAll();
    },
    removeActivePreview (state) {
        state.canvas.remove(state.activePreview);
        state.activePreview = null;
    },

    setProcessState(state, bool:boolean) {
        state.processingImage = bool;
    },

    setOutputImgData(state, object) {
        state.outputImgData = object;
    },
    setOutputImgText(state, string:string) {
        state.outputImgText = string;
    },

    setActiveLCD (state, object:LCDLayerObject) {
        state.activeLCD = object;
    },

    setActiveLayer (state, object:CanvasLayerObject) {
        state.activeLayer = object
    },
    setActivePreview (state, object:CanvasLayerObject) {
        state.activeLayer = object
    },

    setImageHighlight(state, object) {

    },
    removeImageHighlight (state, object) {

    },

    updateImageOrder(state) {
        let activeLCD: LCDLayerObject = state.activeLCD;
        let frame = activeLCD.lcdgroup;
        let background = activeLCD.background;
        let overlay = state.overlay;
        let images:CanvasLayerObject[] = state.imageLayersList;

        //put all objects into an array in order
        let order = [];
        order.push(frame);
        order.push(overlay);
        images.forEach((object) => {
            order.push(object.object);
        });
        order.push(background);

        //inversely send objects to back.
        order.forEach((object) => {
            state.canvas.sendToBack(object);
        });

        state.canvas.renderAll();
    },
    updateOverlay: function(state, lcdobject:LCDLayerObject) {
        let newcoords = misc.getInnerElementCoords(canvas, lcdobject, "ScreenBounds");
        let overlaycoords = misc.getOuterPolygonCoords(canvas, lcdobject, "ScreenBounds");

        let overlayObject = new fabric.lcdoverlay(overlaycoords, {
            left: 0, top: 0,
            fill: 'black', fillRule: 'evenodd',
            hasControls: false, hasBorders: false, hasRotatingPoint: false,
            lockMovementX: true, lockMovementY: true, lockRotation:true,
            statefullcache:true, hoverCursor: "default", selectable: false,
            opacity:0.6, evented:false, perPixelTargetFind:true, strokeWidth: 0
        });

        if(state.overlay) state.canvas.remove(state.overlay);
        state.overlay = overlayObject;
        state.canvas.add(overlayObject);
    },
  }
});


new Vue({
  el: '#layers-menu',
  store,
  render: h => h(MoveMenu)
});


console.log(OutputMenu);

declare var Vue: any

new Vue({
  el: '#output-menu',
  store,
  render: h => h(OutputMenu)
});


var canvas_container = document.body;
canvas_container.addEventListener('drop', function (e:any) {
    e = e || window.event;
    if (e.preventDefault) {
        e.preventDefault();
    }
    var dt = e.dataTransfer;
    var files = dt.files;
    for (var i=0; i<files.length; i++) {
        var file = files[i];
        var reader = new FileReader();
        reader.onload = function (e:any) {
            var img = new Image();

            img.onload = function() {
                var imgInstance = new fabric.CanvasImage(img, {
                    filename: file.name,
                    left: 100,
                    top: 100,
                });
                store.commit('addToLayers', {imgInstance});
                //canvas.add(imgInstance);
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
    
    return false;
});

canvas_container.addEventListener('dragover', cancel);
canvas_container.addEventListener('dragenter', cancel);

function cancel(e) {
    if (e.preventDefault) { e.preventDefault(); }
    return false;
}

LCDSnapping.setup(canvas, store);

//When image is added to canvas, add it to our vue instance
canvas.on('mouse:down', function(e) {
    if(store.state.activePreview) {
        store.commit('removeActivePreview')
    }
});

//When we select an object on the canvas, send that selection to our vue instance for highlight
canvas.on('object:selected', function(e) {
    var activeObject = e.target;
    let type = activeObject.get('type');
    if(type) {
        if(type === 'canvasimage') {
            //Find our object in the vue layers
            let objects = store.state.imageLayersList.filter(function(item) {
                //compare reference in memory rather than properties
                if(item.object == activeObject) {
                    return true;
                }
            });
            let object = objects[0];
            store.commit('setImageHighlight', { object });
        }
    }
});

//Clear highlight in vue instance
canvas.on('before:selection:cleared', function(e) {
    var activeObject = e.target;
    let type = activeObject.get('type');
    if(type) {
        if(type === 'canvasimage') {
            let objects = store.state.imageLayersList.filter(function(item) {
                //compare reference in memory rather than properties
                if(item.object == activeObject) {
                    return true;
                }
            });
            let object = objects[0];
            store.commit('removeImageHighlight', { object });
        }
    }
});


enum ArrowDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

function handleArrowMoveObjectInput(Direction:ArrowDirection) {
    let layer:any = store.state.activeLayer;
    let activeObject:any = layer.object;

    if(activeObject) {
        let amount = 1;
        if(Direction === ArrowDirection.UP)
            activeObject.top = Math.round(activeObject.top - amount);
        else if (Direction === ArrowDirection.DOWN)
            activeObject.top = Math.round(activeObject.top + amount);
        else if (Direction === ArrowDirection.LEFT)
            activeObject.left = Math.round(activeObject.left - amount);
        else if (Direction === ArrowDirection.RIGHT)
            activeObject.left = Math.round(activeObject.left + amount);
        store.state.canvas.renderAll();
        activeObject.setCoords();
    }
}

function onKeyDownHandler(e) {
    e.preventDefault(); 

    let layer:any = store.state.activeLayer;
    let activeObject:any = layer.object;
    switch (e.keyCode) {
        case 46:
            if(layer) store.commit('removeFromLayers', { layer });
            break;
        case 37:
            //left arrow
            handleArrowMoveObjectInput(ArrowDirection.LEFT);
            break;
        case 38:
            //up arrow
            handleArrowMoveObjectInput(ArrowDirection.UP);
            break;
        case 39:
            //right arrow
            handleArrowMoveObjectInput(ArrowDirection.RIGHT);
            break;
        case 40:
            //down arrow
            handleArrowMoveObjectInput(ArrowDirection.DOWN);
            break;
    }
}

window.onkeydown = onKeyDownHandler;



canvas.setWidth(2400);
canvas.setHeight(1920);

let can2:any = document.getElementsByClassName('canvas-container-container')[0];
let bar2:any = document.getElementsByClassName('outputbar')[0];
var positionInfo = bar2.getBoundingClientRect();
can2.style.width = window.innerWidth + 'px';
can2.style.height = (window.innerHeight - positionInfo.height )+ 'px';
can2.style.overflow = "scroll";

let newelm:any = document.getElementsByClassName('canvas-container-container')[0];
let newheight = (newelm.scrollHeight - newelm.offsetHeight) / 2;
let newwidth = (newelm.scrollWidth - newelm.offsetWidth) / 2;
newelm.scrollTop = newheight;
newelm.scrollLeft = newwidth;

window.addEventListener('resize', lodash.debounce(function () {
    //console.log(vmlcdmenu.activeObject.bounds.left());
    let can:any = document.getElementsByClassName('canvas-container-container')[0];
    let bar:any = document.getElementsByClassName('outputbar')[0];
    var positionInfo = bar.getBoundingClientRect();
    can.style.width = window.innerWidth + 'px';
    can.style.height = (window.innerHeight - positionInfo.height )+ 'px';
    can.style.overflow = "scroll";

}, 50));

let src = require("raw-loader!./lcdconfig/sprites/alpha-square.svg");
fabric.loadSVGFromString(src, function(objects, options) {
    options.strokeWidth = 0;
    let nobj = fabric.util.groupSVGElements(objects, options);
    nobj.scaleToWidth(16);

    var patternSourceCanvas = new fabric.StaticCanvas();
    patternSourceCanvas.add(nobj);
    patternSourceCanvas.renderAll();
    var pattern = new fabric.Pattern({
        source: function() {
            patternSourceCanvas.setDimensions({
                width: nobj.getWidth(),
                height: nobj.getHeight()
            });
            return patternSourceCanvas.getElement();
        },
        repeat: 'repeat'
    });
    canvas.backgroundColor = pattern;
    canvas.renderAll();

});





//let css7  = require('./css/AlteDin/stylesheet.css');

//Remove these requires before productions pls
//require('raw-loader!../index.html');
//require('raw-loader!./css/layersmenu.css');
//require('raw-loader!./css/imagemenu.css');
//require('raw-loader!./css/lcdmenu.css');
//require('raw-loader!./css/outputmenu.css');

/*
let canvas = new fabric.Canvas('c3', {
    imageSmoothingEnabled: false,
    backgroundColor: "#ffffff",
    preserveObjectStacking: true,
    controlsAboveOverlay: true,
    perPixelTargetFind: true,
    stopContextMenu: true,
    selection: false,
});

canvas.setZoom(2.0);

window['scanvas'] = canvas;
*/

/*
canvas.setWidth(window.innerWidth);
canvas.setHeight(window.innerHeight);
window.addEventListener("resize", function() {
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight);
});
*/


/*
//register our lcd menu and setup handlers to interact with the canvas and our instance of fabricjs
let vmlcdmenu:any = vuelcdcontroller.initialize(fabric, canvas);


//register custom object types
fabrictypes.setup(fabric);

//register input handlers
inputhandler.setup(canvas);

//register layers menu and get its vue context
let vm:any = vuecontroller.initialize(canvas);

//register drag handler on layers menu
layermanagerUI.setupMenu();

//register image drag and drop handler
dragndrop.setupDrop(canvas, vm);


let svg = require("raw-loader!./lcdconfig/sprites/vanilla/LCD-Square.svg");

let svg2 = require("raw-loader!./lcdconfig/sprites/vanilla/LCD-Wide.svg");

let svg3 = require("raw-loader!./lcdconfig/sprites/vanilla/LCD-Corner.svg");

//set default
vmlcdmenu.addSVGAsString(svg2, true);

vmlcdmenu.addSVGAsString(svg);

vmlcdmenu.addSVGAsString(svg3);

//Setup image snapping to lcd
LCDSnapping.setup(canvas, vmlcdmenu);

//setup handling of image addition and connect canvas to our vue layers instance

//setup handling of dithering output
let vueoutputmenuvm = vueoutputmenu.setup(canvas, vmlcdmenu);

layermanager.layersmanager(canvas, vm, vueoutputmenuvm);

vueoutputmenuvm
//canvas.setZoom(1);  // reset zoom so pan actions work as expected
//let vpw = canvas.width / zoom
//let vph = canvas.height / zoom
//let x = (LCDGroup.left - vpw / 2)  // x is the location where the top left of the viewport should be
//let y = (LCDGroup.top - vph / 2)  // y idem
//canvas.absolutePan({x:x, y:y});
//canvas.setZoom(zoom);


var fileAsBase64Src = require("url-loader!./space.jpg");

var imgaa = new Image();

imgaa.onload = function() {
    var imgInstance = new fabric.CanvasImage(imgaa, {
        filename: 'spacee.jpg',
        left: 380,
        top: 370
    });
    imgInstance.scale(0.8);
    //Dirty dirty hack for a dirty boy who doesn't use components yet.
    let interval = setInterval(function(e) {
        if(vmlcdmenu.activeObject) {
            clearInterval(interval);
            canvas.add(imgInstance);
        }
    }, 50)
        

    
}
imgaa.src = fileAsBase64Src;


window.addEventListener('resize', lodash.debounce(function () {
    //console.log(vmlcdmenu.activeObject.bounds.left());
    let can:any = document.getElementsByClassName('canvas-container-container')[0];
    let bar:any = document.getElementsByClassName('outputbar')[0];
    var positionInfo = bar.getBoundingClientRect();
    can.style.width = window.innerWidth + 'px';
    can.style.height = (window.innerHeight - positionInfo.height )+ 'px';
    can.style.overflow = "scroll";

}, 250));


canvas.setWidth(2400);
canvas.setHeight(1920);

let can2:any = document.getElementsByClassName('canvas-container-container')[0];
let bar2:any = document.getElementsByClassName('outputbar')[0];
var positionInfo = bar2.getBoundingClientRect();
can2.style.width = window.innerWidth + 'px';
can2.style.height = (window.innerHeight - positionInfo.height )+ 'px';
can2.style.overflow = "scroll";

let newelm:any = document.getElementsByClassName('canvas-container-container')[0];
let newheight = (newelm.scrollHeight - newelm.offsetHeight) / 2;
let newwidth = (newelm.scrollWidth - newelm.offsetWidth) / 2;
newelm.scrollTop = newheight;
newelm.scrollLeft = newwidth;


let src = require("raw-loader!./lcdconfig/sprites/alpha-square.svg");
fabric.loadSVGFromString(src, function(objects, options) {
    options.strokeWidth = 0;
    let nobj = fabric.util.groupSVGElements(objects, options);
    nobj.scaleToWidth(16);

    var patternSourceCanvas = new fabric.StaticCanvas();
    patternSourceCanvas.add(nobj);
    patternSourceCanvas.renderAll();
    var pattern = new fabric.Pattern({
        source: function() {
            patternSourceCanvas.setDimensions({
                width: nobj.getWidth(),
                height: nobj.getHeight()
            });
            return patternSourceCanvas.getElement();
        },
        repeat: 'repeat'
    });
    canvas.backgroundColor = pattern;
    canvas.renderAll();

});

*/