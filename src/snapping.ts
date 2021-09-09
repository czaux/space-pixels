import * as misc from "./misc"
import { SubObjectPosition } from "./soposition";

interface LCDLayerObject {
    active?: boolean; //if this lcd object is active;
    lcdgroup?: any, //lcd frame group in fabricjs object  
    background?: any, //lcd background layer in fabricjs object
    bounds?: SubObjectPosition, //by-reference getter of position values.
    imgsrc?: string; //base64 URI of image
}

class Snapping {

  private static bounds: any;

  public setup: any = (canvas, store) => {

    let threshold = 3;

    canvas.on('object:moving', snapMoveToGrid);
    canvas.on('object:scaling', snapScaleToGrid);
    canvas.on('object:moving', fixBoundaries);
    canvas.on('object:scaling', fixBoundaries);

    function fixBoundaries(options) {
        if (!options.target) return;
        var t = options.target,
            update = false,
                tBounds = {
                    left: t.left,
                    right: t.left + t.width * t.scaleX,
                    top: t.top,
                    bottom: t.top + t.height * t.scaleY
                },
                cBounds = {
                    left: 0,
                    top: 0,
                    right: store.state.canvas.getWidth(),
                    bottom: store.state.canvas.getHeight()
                },
            coords:any = {};
            
        if (tBounds.left < cBounds.left) {
            update = true;
            coords.left = cBounds.left;
        }
        
        if (tBounds.top < cBounds.top) {
            update = true;
            coords.top = cBounds.top;
        }
        
        if (tBounds.right > cBounds.right) {
            update = true;
            coords.left = tBounds.left - (tBounds.right - cBounds.right);
        }
        
        if (tBounds.bottom > cBounds.bottom) {
            update = true;
            coords.top = tBounds.top - (tBounds.bottom - cBounds.bottom);
        }
        
        if (update) {
            t.set(coords);
            store.state.canvas.renderAll();
        }
        
        return options;
    }

    function snapMoveToGrid(ev) {
        let lcd: LCDLayerObject = store.activeLCD;
        let screenbounds = lcd.bounds;
        if(!screenbounds) return;
        var t = ev.target,
            w = t.width * t.scaleX,
            h = t.height * t.scaleY,
            /*
            snap = {   // Closest snapping points
                top: LCDGroup.top + lcdcoords.object.top,
                left: LCDGroup.left + lcdcoords.object.left,
                bottom: (LCDGroup.top + lcdcoords.object.top) + (lcdcoords.object.height * lcdcoords.object.scaleY),
                right: (LCDGroup.left + lcdcoords.object.left) + (lcdcoords.object.width * lcdcoords.object.scaleX)
            },*/
            snap = {
              top: screenbounds.top(false),
              left: screenbounds.left(false),
              bottom: screenbounds.top(false) + screenbounds.height(false),
              right: screenbounds.left(false) + screenbounds.width(false)
            },
            dist = {   // Distance from snapping points
                top: Math.abs(snap.top - t.top),
                left: Math.abs(snap.left - t.left),
                bottom: Math.abs(snap.bottom - t.top - h),
                right: Math.abs(snap.right - t.left - w)
            };
        
        if (dist.bottom < dist.top) {
            if (dist.bottom > threshold)
                snap.top = t.top; // don't snap
            else
                snap.top = snap.bottom - h;
        }
        else if (dist.top > threshold)
            snap.top = t.top; // don't snap
        
        if (dist.right < dist.left) {
            if (dist.right > threshold)
                snap.left = t.left; // don't snap
            else
                snap.left = snap.right - w;
        }
        else if (dist.left > threshold)
            snap.left = t.left; // don't snap
        
        t.set({
            top: snap.top,
            left: snap.left
        });
    }

    function snapScaleToGrid(options) {
        let lcd: LCDLayerObject = store.activeLCD;
        let screenbounds = lcd.bounds;
        if(!screenbounds) return;
        var target = options.target,
            w = target.getWidth(),
            h = target.getHeight(),
            /*
            snap = {   // Closest snapping points
                top: LCDGroup.top + lcdcoords.object.top,
                left: LCDGroup.left + lcdcoords.object.left,
                bottom: (LCDGroup.top + lcdcoords.object.top) + (lcdcoords.object.height * lcdcoords.object.scaleY),
                right: (LCDGroup.left + lcdcoords.object.left) + (lcdcoords.object.width * lcdcoords.object.scaleX)
            },*/
            snap = {
              top: screenbounds.top(false),
              left: screenbounds.left(false),
              bottom: screenbounds.top(false) + screenbounds.height(false),
              right: screenbounds.left(false) + screenbounds.width(false)
            },
            dist = {   // Distance from snapping points
                top: Math.abs(snap.top - target.top),
                left: Math.abs(snap.left - target.left),
                bottom: Math.abs(snap.bottom - target.top - h),
                right: Math.abs(snap.right - target.left - w)
            },
            attrs = {
                scaleX: target.scaleX,
                scaleY: target.scaleY,
                top: target.top,
                left: target.left
            };
        
        switch(target.__corner) {
            case 'tl':
                if (dist.left < dist.top && dist.left < threshold) {
                    attrs.scaleX = (w - (snap.left - target.left)) / target.width;
                    attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                    attrs.top = target.top + (h - target.height * attrs.scaleY);
                    attrs.left = snap.left;
                }
                else if (dist.top < threshold) {
                    attrs.scaleY = (h - (snap.top - target.top)) / target.height;
                    attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                    attrs.left = attrs.left + (w - target.width * attrs.scaleX);
                    attrs.top = snap.top;
                }
                break;
            case 'mt':
                if (dist.top < threshold) {
                    attrs.scaleY = (h - (snap.top - target.top)) / target.height;
                    attrs.top = snap.top;
                }
                break;
            case 'tr':
                if (dist.right < dist.top && dist.right < threshold) {
                    attrs.scaleX = (snap.right - target.left) / target.width;
                    attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                    attrs.top = target.top + (h - target.height * attrs.scaleY);
                }
                else if (dist.top < threshold) {
                    attrs.scaleY = (h - (snap.top - target.top)) / target.height;
                    attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                    attrs.top = snap.top;
                }
                break;
            case 'ml':
                if (dist.left < threshold) {
                    attrs.scaleX = (w - (snap.left - target.left)) / target.width;
                    attrs.left = snap.left;
                }
                break;
            case 'mr':
                if (dist.right < threshold)
                    attrs.scaleX = (snap.right - target.left) / target.width;
                break;
            case 'bl':
                if (dist.left < dist.bottom && dist.left < threshold) {
                    attrs.scaleX = (w - (snap.left - target.left)) / target.width;
                    attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                    attrs.left = snap.left;
                }
                else if (dist.bottom < threshold) {
                    attrs.scaleY = (snap.bottom - target.top) / target.height;
                    attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                    attrs.left = attrs.left + (w - target.width * attrs.scaleX);
                }
                break;
            case 'mb':
                if (dist.bottom < threshold)
                    attrs.scaleY = (snap.bottom - target.top) / target.height;
                break;
            case 'br':
                if (dist.right < dist.bottom && dist.right < threshold) {
                    attrs.scaleX = (snap.right - target.left) / target.width;
                    attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
                }
                else if (dist.bottom < threshold) {
                    attrs.scaleY = (snap.bottom - target.top) / target.height;
                    attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
                }
                break;
        }
        
        target.set(attrs);
    }

  }


}

export let LCDSnapping = new Snapping();