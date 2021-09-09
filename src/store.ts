import Vuex from 'vuex';
import { SubObjectPosition } from "./soposition";

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
    activeLCD: {},
    activeLayer: {},
    activePreview: {},
    overlay: {},
    imageLayersList: [],
    lcdsList: {},
    outputImgData: {},
    outputImgText: "",
    processingImage: false,
  },
  strict: debug,
  mutations: {
    addToLayers (state, object:CanvasLayerObject) {
        canvas.add(object.object);
        state.imageLayersList.unshift(object);
    },
    removeFromLayers (state, object:CanvasLayerObject) {
        canvas.remove(object.object);
        state.imageLayersList.splice(state.imageLayersList.indexOf(object), 1);
    },
    removeActivePreview (state) {
        canvas.remove(state.activePreview);
        state.activePreview = null;
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

        if(state.overlay) canvas.remove(state.overlay);
        state.overlay = overlayObject;
        canvas.add(overlayObject);
    },
  }
});

export default store;