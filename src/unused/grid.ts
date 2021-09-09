var fabric = require("fabric");

export function gridstuff(canvas:any, grid: number, threshold:number) {

  canvas.on('object:moving', snapMoveToGrid);
  canvas.on('object:scaling', snapScaleToGrid);
  canvas.on('object:moving', fixBoundaries);
  canvas.on('object:scaling', fixBoundaries);
  function roundToGrid(value) {
    return Math.round(value / grid) * grid;  
  }

  function fixBoundaries(options){
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
                  right: canvas.getWidth(),
                  bottom: canvas.getHeight()
              };
          var coords = {};
          
      if (tBounds.left < cBounds.left) {
          update = true;
          (coords as any).left = cBounds.left;
      }
      
      if (tBounds.top < cBounds.top) {
          update = true;
          (coords as any).top = cBounds.top;
      }
      
      if (tBounds.right > cBounds.right) {
          update = true;
          (coords as any).left = tBounds.left - (tBounds.right - cBounds.right);
      }
      
      if (tBounds.bottom > cBounds.bottom) {
          update = true;
          (coords as any).top = tBounds.top - (tBounds.bottom - cBounds.bottom);
      }
      
      if (update) {
          t.set(coords);
          canvas.renderAll();
      }
      
      return options;
  }

  function snapMoveToGrid(ev) {
      var t = ev.target,
          w = t.width * t.scaleX,
          h = t.height * t.scaleY,
          snap = {   // Closest snapping points
              top: roundToGrid(t.top),
              left: roundToGrid(t.left),
              bottom: roundToGrid(t.top + h),
              right: roundToGrid(t.left + w)
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
      var target = options.target,
          w = target.getWidth(),
          h = target.getHeight(),
          snap = {   // Closest snapping points
              top: roundToGrid(target.top),
              left: roundToGrid(target.left),
              bottom: roundToGrid(target.top + h),
              right: roundToGrid(target.left + w)
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